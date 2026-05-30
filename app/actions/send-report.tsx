'use server'

import { generateReport, getUserEmails } from '@/lib/report'
import { sendReportEmail } from '@/lib/email'
import { render } from '@react-email/components'
import { ReportEmail } from '@/emails/report-email'

export async function triggerMonthlyReport() {
  const [report, emails] = await Promise.all([
    generateReport(),
    getUserEmails(),
  ])

  if (emails.length === 0) {
    throw new Error('No users found')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const html = await render(<ReportEmail report={report} baseUrl={baseUrl} />)
  await sendReportEmail(html, emails)

  return { sent: true }
}
