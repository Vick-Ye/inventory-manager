import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  return <AppLayout userEmail={session.user.email ?? ''}>{children}</AppLayout>
}
