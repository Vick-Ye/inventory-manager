import { sql } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  if (!code) {
    return Response.json({ error: 'Barcode is required' }, { status: 400 })
  }

  const [item] = await sql`SELECT * FROM items WHERE barcode = ${code}`
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  const categories = await sql`
    SELECT c.id, c.name
    FROM categories c
    JOIN item_categories ic ON ic.category_id = c.id
    WHERE ic.item_id = ${(item as { id: number }).id}
    ORDER BY c.name
  `
  ;(item as { categories: unknown[] }).categories = categories

  return Response.json(item)
}
