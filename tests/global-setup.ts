import { spawn, ChildProcess, execSync } from 'child_process'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const PORT = 3457
const BASE_URL = `http://localhost:${PORT}`
const SESSION_FILE = '/tmp/opencode/test-session.json'
const TEST_USER = {
  name: 'TestRunner',
  email: 'test-runner@test.local',
  password: 'test-password-123!',
}

let server: ChildProcess | null = null

export async function setup() {
  const tmpDir = path.dirname(SESSION_FILE)
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir, { recursive: true })
  }

  killPort(PORT)

  server = spawn('npx', ['next', 'dev', '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })

  let output = ''
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Server did not start within 60s.\n${output}`))
    }, 60_000)

    const onData = (chunk: string) => {
      output += chunk
      process.stdout.write(chunk)
      if (output.includes('Ready in')) {
        clearTimeout(timeout)
        resolve()
      }
    }

    server!.stdout!.on('data', onData)
    server!.stderr!.on('data', onData)

    server!.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })

  await new Promise((r) => setTimeout(r, 2000))

  const cookie = await createTestSession()

  writeFileSync(SESSION_FILE, JSON.stringify({ baseUrl: BASE_URL, cookie }), 'utf-8')
}

export async function teardown() {
  try {
    const { cookie } = JSON.parse(
      require('fs').readFileSync(SESSION_FILE, 'utf-8'),
    )
    if (cookie) {
      await fetch(`${BASE_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
      })
    }
  } catch { /* ignore */ }

  if (server) {
    server.kill('SIGTERM')
  }

  killPort(PORT)
}

async function createTestSession(): Promise<string> {
  const signUpRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  })

  if (!signUpRes.ok && signUpRes.status !== 422) {
    const body = await signUpRes.text()
    throw new Error(`Sign-up failed (${signUpRes.status}): ${body}`)
  }

  const signInRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
  })

  if (!signInRes.ok) {
    const body = await signInRes.text()
    throw new Error(`Sign-in failed (${signInRes.status}): ${body}`)
  }

  let allCookies: string[] = []
  if (typeof signInRes.headers.getSetCookie === 'function') {
    allCookies = signInRes.headers.getSetCookie()
  } else {
    const raw = signInRes.headers.get('set-cookie') ?? ''
    allCookies = raw.match(/[^,]+(?:,[^,]+)*?(?=,\s*(?:[^,]+=)|$)/g) ?? [raw]
  }
  const cookies = allCookies
    .map((c) => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ')

  return cookies
}

function killPort(port: number) {
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: 'ignore' })
  } catch { /* ignore */ }
}

declare module 'vitest' {
  export interface ProvidedContext {
    sessionCookie: string
    baseUrl: string
  }
}
