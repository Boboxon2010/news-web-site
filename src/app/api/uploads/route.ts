import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');

const getSafeExtension = (fileName: string, contentType: string) => {
    const fromName = path.extname(fileName).toLowerCase().replace(/[^a-z0-9.]/g, '');
    if (fromName) return fromName;
    const fromType = contentType.split('/')[1]?.split(';')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return fromType ? `.${fromType}` : '.bin';
};

export async function POST(request: Request) {
    try {
        if (!request.body) return NextResponse.json({ error: 'Fayl yuborilmadi' }, { status: 400 });

        const fileName = request.headers.get('x-file-name') || 'media';
        const contentType = request.headers.get('content-type') || 'application/octet-stream';
        const extension = getSafeExtension(fileName, contentType);
        const storedName = `${randomUUID()}${extension}`;
        await mkdir(uploadDirectory, { recursive: true });

        const target = path.join(uploadDirectory, storedName);
        const source = Readable.fromWeb(request.body as import('node:stream/web').ReadableStream);
        await new Promise<void>((resolve, reject) => {
            const destination = createWriteStream(target, { flags: 'wx' });
            source.pipe(destination);
            destination.on('finish', resolve);
            destination.on('error', reject);
            source.on('error', reject);
        });

        return NextResponse.json({
            success: true,
            id: storedName,
            name: fileName,
            type: contentType,
            dataUrl: `/api/media/${storedName}`,
        });
    } catch {
        return NextResponse.json({ error: 'Faylni serverga yuklashda xatolik yuz berdi' }, { status: 500 });
    }
}
