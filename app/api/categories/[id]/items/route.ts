import { sql } from '@/lib/db'
import { z } from 'zod'

const addItemsSchema = z.object({
  itemIds: z.array(z.number().int().positive()).min(1),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const categoryId = parseInt(id)
  if (isNaN(categoryId)) {
    return Response.json({ error: 'Invalid category id' }, { status: 400 })
  }

  const [category] = await sql`SELECT id FROM categories WHERE id = ${categoryId}`
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = addItemsSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { itemIds } = parsed.data

  const existing = await sql`
    SELECT id FROM items WHERE id = ANY(${itemIds}::int[])
  `
  const existingIds = new Set(existing.map((i: Record<string, unknown>) => i.id as number))
  const missing = itemIds.filter((iid) => !existingIds.has(iid))
  if (missing.length > 0) {
    return Response.json(
      { error: `Items not found: ${missing.join(', ')}` },
      { status: 400 },
    )
  }

  await sql.transaction(
    itemIds.map((iid) =>
      sql`INSERT INTO item_categories (item_id, category_id) VALUES (${iid}, ${categoryId}) ON CONFLICT DO NOTHING`,
    ),
  )

  return Response.json({ added: itemIds.length }, { status: 200 })
}
