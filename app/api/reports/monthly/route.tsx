import { NextResponse } from 'next/server'
import { render } from '@react-email/components'
import { generateReport, getUserEmails } from '@/lib/report'
import { sendReportEmail } from '@/lib/email'
import { ReportEmail } from '@/emails/report-email'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [report, emails] = await Promise.all([
    generateReport(),
    getUserEmails(),
  ])

  if (emails.length === 0) {
    return NextResponse.json({ sent: false, reason: 'No users found' })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const html = await render(<ReportEmail report={report} baseUrl={baseUrl} />)
  await sendReportEmail(html, emails)

  return NextResponse.json({ sent: true, recipients: emails.length })
}
