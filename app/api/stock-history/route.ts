import { sql } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: (string | number)[] = []
  let p = 1

  if (itemId) {
    conditions.push(`sh.item_id = $${p}`)
    params.push(parseInt(itemId))
    p++
  }
  if (startDate) {
    conditions.push(`sh.created_at >= $${p}`)
    params.push(startDate)
    p++
  }
  if (endDate) {
    conditions.push(`sh.created_at <= $${p}`)
    params.push(endDate)
    p++
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [countResult] = await sql.query(
    `SELECT COUNT(*)::int AS count FROM stock_history sh ${where}`,
    params
  )
  const total = countResult.count

  params.push(limit)
  params.push(offset)
  const history = await sql.query(
    `SELECT sh.*, i.name AS item_name, i.slug AS item_slug
     FROM stock_history sh
     JOIN items i ON i.id = sh.item_id
     ${where}
     ORDER BY sh.created_at DESC
     LIMIT $${p} OFFSET $${p + 1}`,
    params
  )

  return Response.json({
    history,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
