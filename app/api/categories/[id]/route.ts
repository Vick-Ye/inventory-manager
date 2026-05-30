import { sql } from '@/lib/db'
import { updateCategorySchema } from '@/lib/validators'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [category] = await sql`
    SELECT * FROM categories WHERE id = ${parseInt(id)}
  `
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }
  return Response.json(category)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const parsed = updateCategorySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description } = parsed.data

  const [category] = await sql`
    UPDATE categories
    SET name = COALESCE(${name ?? null}, name),
        description = COALESCE(${description ?? null}, description),
        updated_at = now()
    WHERE id = ${parseInt(id)}
    RETURNING *
  `
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }
  return Response.json(category)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [category] = await sql`
    DELETE FROM categories WHERE id = ${parseInt(id)}
    RETURNING *
  `
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }
  return Response.json({ message: 'Category deleted' })
}
