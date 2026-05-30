import { sql } from '@/lib/db'
import { createCategorySchema } from '@/lib/validators'

export async function GET() {
  const categories = await sql`
    SELECT * FROM categories ORDER BY name ASC
  `
  return Response.json(categories)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description } = parsed.data

  const [category] = await sql`
    INSERT INTO categories (name, description)
    VALUES (${name}, ${description ?? null})
    RETURNING *
  `
  return Response.json(category, { status: 201 })
}
