import { sql } from '@/lib/db'
import { updateItemSchema } from '@/lib/validators'
import { generateUniqueSlug } from '@/lib/slug'

async function findItemByIdentifier(identifier: string) {
  const isNumeric = /^\d+$/.test(identifier)
  let item

  if (isNumeric) {
    [item] = await sql`
      SELECT * FROM items WHERE id = ${parseInt(identifier)}
    `
  }

  if (!item) {
    [item] = await sql`
      SELECT * FROM items WHERE slug = ${identifier}
    `
  }

  return item
}

async function getItemCategories(itemId: number) {
  return await sql`
    SELECT c.id, c.name
    FROM categories c
    JOIN item_categories ic ON ic.category_id = c.id
    WHERE ic.item_id = ${itemId}
    ORDER BY c.name
  `
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await findItemByIdentifier(id)
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  item.categories = await getItemCategories(item.id)
  return Response.json(item)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await findItemByIdentifier(id)
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = updateItemSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description, image_url, categoryIds } = parsed.data

  let slug = item.slug
  if (name && name !== item.name) {
    slug = await generateUniqueSlug(name, async (s) => {
      if (s === item.slug) return false
      const [existing] = await sql`SELECT 1 FROM items WHERE slug = ${s}`
      return !!existing
    })
  }

  const [updated] = await sql`
    UPDATE items
    SET slug = ${slug},
        name = COALESCE(${name ?? null}, name),
        description = COALESCE(${description ?? null}, description),
        image_url = COALESCE(${image_url ?? null}, image_url),
        updated_at = now()
    WHERE id = ${item.id}
    RETURNING *
  `

  if (categoryIds !== undefined) {
    if (categoryIds.length > 0) {
      const existing = await sql`
        SELECT id FROM categories WHERE id = ANY(${categoryIds}::int[])
      `
      const existingIds = new Set(existing.map(c => (c as { id: number }).id))
      const missing = categoryIds.filter(cid => !existingIds.has(cid))
      if (missing.length > 0) {
        return Response.json(
          { error: `Categories not found: ${missing.join(', ')}` },
          { status: 400 }
        )
      }
    }

    await sql.transaction([
      sql`DELETE FROM item_categories WHERE item_id = ${item.id}`,
      ...categoryIds.map(cid =>
        sql`INSERT INTO item_categories (item_id, category_id) VALUES (${item.id}, ${cid}) ON CONFLICT DO NOTHING`
      ),
    ])
  }

  updated.categories = await getItemCategories(item.id)
  return Response.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await findItemByIdentifier(id)
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  await sql`DELETE FROM items WHERE id = ${item.id}`
  return Response.json({ message: 'Item deleted' })
}
