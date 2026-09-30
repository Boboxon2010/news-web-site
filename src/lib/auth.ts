import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'iiv_litsey_development_secret_only');

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function getCryptoKey(): Promise<CryptoKey> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET production muhitida sozlanishi kerak');
  }
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJwtToken(payload: Record<string, any>, expiresInSeconds = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifyJwtToken(token: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const key = await getCryptoKey();
    const sigBytes = Uint8Array.from(base64UrlDecode(signature), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

export function getAdminTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value || null;
}
