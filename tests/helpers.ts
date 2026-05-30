import { readFileSync, writeFileSync } from 'fs'

const SESSION_FILE = '/tmp/opencode/test-session.json'

interface Session {
  baseUrl: string
  cookie: string
}

export function getSession(): Session {
  const raw = readFileSync(SESSION_FILE, 'utf-8')
  return JSON.parse(raw)
}

export function saveSession(session: Session) {
  writeFileSync(SESSION_FILE, JSON.stringify(session), 'utf-8')
}

export async function signIn(baseUrl: string): Promise<string> {
  const signInRes = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test-runner@test.local',
      password: 'test-password-123!',
    }),
    redirect: 'manual',
  })

  if (!signInRes.ok) {
    return ''
  }

  const all = typeof signInRes.headers.getSetCookie === 'function'
    ? signInRes.headers.getSetCookie()
    : []

  return all.map((c) => c.split(';')[0].trim()).filter(Boolean).join('; ')
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: Record<string, unknown> }

export async function api(
  path: string,
  options: ApiOptions = {},
  authenticated = true,
) {
  const { baseUrl, cookie } = getSession()
  const headers: Record<string, string> = {}

  if (typeof options.body === 'object' && options.body !== null) {
    headers['Content-Type'] = 'application/json'
  }

  if (authenticated && cookie) {
    headers['Cookie'] = cookie
  }

  const body = options.body !== undefined ? JSON.stringify(options.body) : undefined

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    body,
    redirect: 'manual',
  } as RequestInit)
}

export async function apiJson(path: string, options: ApiOptions = {}, authenticated = true) {
  const res = await api(path, options, authenticated)
  const data = res.status === 204 || res.status === 307 || res.status === 401 ? null : await res.json()
  return { res, data }
}
