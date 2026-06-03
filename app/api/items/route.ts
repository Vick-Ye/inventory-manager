import { sql } from '@/lib/db'
import { createItemSchema } from '@/lib/validators'
import { generateUniqueSlug } from '@/lib/slug'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const categoryId = searchParams.get('categoryId')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: (string | number)[] = []
  let p = 1

  if (search) {
    conditions.push(`(i.name ILIKE $${p} OR i.notes ILIKE $${p})`)
    params.push(`%${search}%`)
    p++
  }

  if (categoryId) {
    conditions.push(`EXISTS (SELECT 1 FROM item_categories ic2 WHERE ic2.item_id = i.id AND ic2.category_id = $${p})`)
    params.push(parseInt(categoryId))
    p++
  }

  const minVolume = searchParams.get('minVolume')
  const maxVolume = searchParams.get('maxVolume')
  const minDim = searchParams.get('minDim')
  const maxDim = searchParams.get('maxDim')
  const dimFormula = parseInt(searchParams.get('dimFormula') ?? '166')

  if (![166, 139, 5000].includes(dimFormula)) {
    return Response.json({ error: 'Invalid dimFormula' }, { status: 400 })
  }

  if (minVolume) {
    conditions.push(`(i.length * i.width * i.height) >= $${p}`)
    params.push(parseFloat(minVolume))
    p++
  }
  if (maxVolume) {
    conditions.push(`(i.length * i.width * i.height) <= $${p}`)
    params.push(parseFloat(maxVolume))
    p++
  }

  const dimDivisor = dimFormula === 5000 ? `${dimFormula}` : `${dimFormula}`
  const dimMultiplier = dimFormula === 5000 ? '16.387' : '1'

  if (minDim) {
    conditions.push(`(i.length * i.width * i.height * ${dimMultiplier}) / ${dimDivisor} >= $${p}`)
    params.push(parseFloat(minDim))
    p++
  }
  if (maxDim) {
    conditions.push(`(i.length * i.width * i.height * ${dimMultiplier}) / ${dimDivisor} <= $${p}`)
    params.push(parseFloat(maxDim))
    p++
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [countResult] = await sql.query(`SELECT COUNT(*)::int AS count FROM items i ${where}`, params)
  const total = countResult.count

  params.push(limit)
  params.push(offset)
  const items = await sql.query(
    `SELECT i.* FROM items i ${where} ORDER BY i.created_at DESC LIMIT $${p} OFFSET $${p + 1}`,
    params
  )

  if (items.length > 0) {
    const ids = items.map(i => (i as { id: number }).id)
    const catResult = await sql.query(
      `SELECT ic.item_id, c.id, c.name
       FROM item_categories ic
       JOIN categories c ON c.id = ic.category_id
       WHERE ic.item_id = ANY($1::int[])
       ORDER BY c.name`,
      [ids]
    )

    const catMap = new Map<number, { id: number; name: string }[]>()
    for (const row of catResult) {
      const arr = catMap.get(row.item_id) ?? []
      arr.push({ id: row.id, name: row.name })
      catMap.set(row.item_id, arr)
    }

    for (const item of items) {
      item.categories = catMap.get(item.id) ?? []
    }
  }

  return Response.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createItemSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, notes, price, length, width, height, weight, image_url, stock, barcode, sku, categoryIds } = parsed.data

  const slug = await generateUniqueSlug(name, async (s) => {
    const [existing] = await sql`SELECT 1 FROM items WHERE slug = ${s}`
    return !!existing
  })

  const [item] = await sql`
    INSERT INTO items (slug, name, notes, price, length, width, height, weight, image_url, stock, barcode, sku)
    VALUES (${slug}, ${name}, ${notes ?? null}, ${price ?? null}, ${length ?? null}, ${width ?? null}, ${height ?? null}, ${weight ?? null}, ${image_url || null}, ${stock ?? 0}, ${barcode ?? null}, ${sku ?? null})
    RETURNING *
  `

  if (categoryIds && categoryIds.length > 0) {
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

    await sql.transaction(
      categoryIds.map(cid =>
        sql`INSERT INTO item_categories (item_id, category_id) VALUES (${item.id}, ${cid}) ON CONFLICT DO NOTHING`
      )
    )
  }

  const categories = await sql`
    SELECT c.id, c.name
    FROM categories c
    JOIN item_categories ic ON ic.category_id = c.id
    WHERE ic.item_id = ${item.id}
    ORDER BY c.name
  `
  item.categories = categories

  return Response.json(item, { status: 201 })
}
