import { sql } from '@/lib/db'
import { stockAdjustSchema } from '@/lib/validators'

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await findItemByIdentifier(id)
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = stockAdjustSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { change, reason } = parsed.data
  const previousStock = item.stock
  const newStock = previousStock + change

  if (newStock < 0) {
    return Response.json(
      { error: 'Insufficient stock', previousStock },
      { status: 400 }
    )
  }

  await sql.transaction([
    sql`UPDATE items SET stock = ${newStock}, updated_at = now()
       WHERE id = ${item.id}`,
    sql`INSERT INTO stock_history (item_id, previous_stock, new_stock, reason)
       VALUES (${item.id}, ${previousStock}, ${newStock}, ${reason ?? null})`,
  ])

  return Response.json({
    id: item.id,
    previousStock,
    newStock,
    change,
  })
}
