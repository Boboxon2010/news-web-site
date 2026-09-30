import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : (Number(process.env.SMTP_PORT) || 465) === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendContactNotificationEmail(
  adminEmail: string,
  userMessage: { name: string; phone: string; email: string; message: string; date: string }
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP sozlamalari belgilanmagan, xabar faqat bazaga saqlandi.");
    return false;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #334155;">
      <h2 style="color: #f59e0b; margin-top: 0;">🏛️ Yangi Onlayn Murojaat Qabul Qilindi</h2>
      <p style="color: #94a3b8; font-size: 14px;">Litsey rasmiy veb-saytidan yangi fuqaro/o'quvchi murojaati kelib tushdi:</p>
      
      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>👤 Murojaatchi:</strong> ${userMessage.name}</p>
        ${userMessage.phone ? `<p style="margin: 5px 0;"><strong>📞 Telefon:</strong> <a href="tel:${userMessage.phone.replace(/[^\d+]/g, '')}" style="color: #38bdf8;">${userMessage.phone}</a></p>` : ''}
        ${userMessage.email ? `<p style="margin: 5px 0;"><strong>✉️ Elektron pochta:</strong> <a href="mailto:${userMessage.email}" style="color: #38bdf8;">${userMessage.email}</a></p>` : ''}
        <p style="margin: 5px 0;"><strong>📅 Vaqti:</strong> ${userMessage.date}</p>
      </div>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <p style="margin-top: 0; color: #cbd5e1;"><strong>📝 Murojaat matni:</strong></p>
        <p style="white-space: pre-line; color: #f8fafc; line-height: 1.6;">${userMessage.message}</p>
      </div>

      <hr style="border-color: #334155; margin: 20px 0;" />
      <p style="font-size: 11px; color: #64748b; text-center: center;">Ichki Ishlar Vazirligi Xorazm Akademik Litseyi Boshqaruv Portali</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Litsey Veb-Sayti" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `📩 Yangi Murojaat: ${userMessage.name}`,
      html: htmlContent,
      replyTo: userMessage.email || undefined,
    });
    return true;
  } catch (error) {
    console.error("Email yuborishda xatolik yuz berdi:", error);
    return false;
  }
}
