import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const mediaDirectory = path.join(process.cwd(), 'public', 'uploads');

const contentTypes: Record<string, string> = {
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.m4v': 'video/x-m4v',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
};

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
    const requestedPath = params.path.join('/');
    const filePath = path.resolve(mediaDirectory, requestedPath);
    if (!filePath.startsWith(`${mediaDirectory}${path.sep}`)) return new NextResponse('Not found', { status: 404 });

    try {
        const fileStats = await stat(filePath);
        const range = request.headers.get('range');
        const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        const commonHeaders = {
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Type': contentType,
        };

        if (!range) {
            return new NextResponse(Readable.toWeb(createReadStream(filePath)) as unknown as BodyInit, {
                headers: { ...commonHeaders, 'Content-Length': String(fileStats.size) },
            });
        }

        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) return new NextResponse('Invalid range', { status: 416, headers: { 'Content-Range': `bytes */${fileStats.size}` } });
        const start = match[1] ? Number(match[1]) : Math.max(fileStats.size - Number(match[2]), 0);
        const end = match[2] ? Number(match[2]) : fileStats.size - 1;
        if (start > end || start >= fileStats.size) return new NextResponse('Range not satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${fileStats.size}` } });

        const safeEnd = Math.min(end, fileStats.size - 1);
        return new NextResponse(Readable.toWeb(createReadStream(filePath, { start, end: safeEnd })) as unknown as BodyInit, {
            status: 206,
            headers: {
                ...commonHeaders,
                'Content-Length': String(safeEnd - start + 1),
                'Content-Range': `bytes ${start}-${safeEnd}/${fileStats.size}`,
            },
        });
    } catch {
        return new NextResponse('Not found', { status: 404 });
    }
}
