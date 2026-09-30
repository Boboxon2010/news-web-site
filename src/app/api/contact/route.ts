import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendContactNotificationEmail } from '@/lib/email';
import { checkRateLimit, sanitizeInput } from '@/lib/security';

// POST: Foydalanuvchi murojaatini saqlash va Admin Gmail'iga yuborish
export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1').split(',')[0].trim();

    if (!checkRateLimit(ip, 15, 60000)) {
      return NextResponse.json(
        { success: false, message: 'Ketma-ket juda ko\'p murojaat yuborildi. Bir ozdan so\'ng urinib ko\'ring.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await req.json();
    const name = sanitizeInput(body.name || '');
    const phone = sanitizeInput(body.phone || '');
    const email = sanitizeInput(body.email || '').trim();
    const message = sanitizeInput(body.message || '');

    if (!name || (!phone && !email) || !message) {
      return NextResponse.json({ success: false, message: 'Ism, murojaat matni va telefon yoki emaildan kamida bittasini kiriting.' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Email manzili noto\'g\'ri kiritilgan.' }, { status: 400 });
    }

    // 1. Bazaga saqlash
    const dbRes = await query(
      `INSERT INTO contact_messages (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [name, phone, email, message]
    );

    const createdDate = new Date(dbRes.rows[0].created_at).toLocaleString('uz-UZ');

    // 2. Admin emailini olish
    const settingsRes = await query(`SELECT email FROM site_settings ORDER BY id ASC LIMIT 1`);
    const adminEmail = settingsRes.rows[0]?.email || '';

    // 3. Email xabarnoma yuborish
    let emailSent = false;
    if (adminEmail) {
      emailSent = await sendContactNotificationEmail(adminEmail, {
        name,
        phone,
        email,
        message,
        date: createdDate,
      });
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailMessage: emailSent ? '' : 'Murojaat admin paneliga saqlandi, ammo Gmail yuborilmadi. Admin emaili va SMTP_USER/SMTP_PASS sozlamalarini tekshiring.',
      message: 'Murojaatingiz qabul qilindi!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Serverda xatolik yuz berdi' }, { status: 500 });
  }
}

// GET: Admin uchun kelgan murojaatlarni olish
export async function GET() {
  try {
    const res = await query(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
    const messages = res.rows.map((r: any) => ({
      id: r.id.toString(),
      name: r.name,
      phone: r.phone,
      email: r.email || '',
      message: r.message,
      isRead: r.is_read,
      createdAt: new Date(r.created_at).toLocaleString('uz-UZ'),
    }));

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID kiritilmadi' }, { status: 400 });
    await query('UPDATE contact_messages SET is_read = TRUE WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Murojaat holatini yangilashda xatolik' }, { status: 500 });
  }
}

// DELETE: Murojaatni o'chirish
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID topilmadi' }, { status: 400 });

    await query(`DELETE FROM contact_messages WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'O\'chirishda xatolik' }, { status: 500 });
  }
}
