import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendReportEmail(html: string, to: string[]) {
  if (to.length === 0) return

  await transporter.sendMail({
    from: `"Inventory Manager" <${process.env.SMTP_EMAIL}>`,
    to: to.join(', '),
    subject: `Monthly Inventory Report — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`,
    html,
  })
}
