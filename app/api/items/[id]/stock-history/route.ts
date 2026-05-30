import { sql } from '@/lib/db'

async function findItemByIdentifier(identifier: string) {
  const isNumeric = /^\d+$/.test(identifier)
  let item

  if (isNumeric) {
    [item] = await sql`
      SELECT id FROM items WHERE id = ${parseInt(identifier)}
    `
  }

  if (!item) {
    [item] = await sql`
      SELECT id FROM items WHERE slug = ${identifier}
    `
  }

  return item
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await findItemByIdentifier(id)
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const offset = (page - 1) * limit

  const conditions: string[] = ['item_id = $1']
  const queryParams: (string | number)[] = [item.id]
  let p = 2

  if (startDate) {
    conditions.push(`created_at >= $${p}`)
    queryParams.push(startDate)
    p++
  }
  if (endDate) {
    conditions.push(`created_at <= $${p}`)
    queryParams.push(endDate)
    p++
  }

  const where = conditions.join(' AND ')

  const [countResult] = await sql.query(
    `SELECT COUNT(*)::int AS count FROM stock_history WHERE ${where}`,
    queryParams
  )
  const total = countResult.count

  queryParams.push(limit)
  queryParams.push(offset)
  const history = await sql.query(
    `SELECT * FROM stock_history WHERE ${where} ORDER BY created_at DESC LIMIT $${p} OFFSET $${p + 1}`,
    queryParams
  )

  return Response.json({
    history,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
