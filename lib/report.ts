import { sql } from './db'

export interface ReportData {
  month: string
  summary: {
    totalChanges: number
    itemsAffected: number
    netChange: number
  }
  outOfStock: { id: number; slug: string; name: string }[]
  wentOutOfStock: { id: number; slug: string; name: string; date: string }[]
  topChanges: {
    id: number
    slug: string
    name: string
    previousStock: number
    newStock: number
    change: number
    reason: string | null
  }[]
}

export async function generateReport(): Promise<ReportData> {
  const thisMonth = sql`date_trunc('month', NOW())`

  const [[monthResult], [summary], outOfStock, wentOut, topChanges] = await Promise.all([
    sql`SELECT to_char(NOW(), 'FMMonth YYYY') AS month`,
    sql`
      SELECT
        COUNT(*)::int AS total_changes,
        COUNT(DISTINCT item_id)::int AS items_affected,
        COALESCE(SUM(new_stock - previous_stock), 0)::int AS net_change
      FROM stock_history
      WHERE date_trunc('month', created_at) = ${thisMonth}
    `,
    sql`
      SELECT id, slug, name FROM items WHERE stock = 0 ORDER BY name
    `,
    sql`
      SELECT DISTINCT i.id, i.slug, i.name, sh.created_at::text AS date
      FROM stock_history sh
      JOIN items i ON i.id = sh.item_id
      WHERE sh.new_stock = 0
        AND date_trunc('month', sh.created_at) = ${thisMonth}
      ORDER BY i.name
    `,
    sql`
      SELECT i.id, i.slug, i.name,
             sh.previous_stock, sh.new_stock,
             (sh.new_stock - sh.previous_stock) AS change,
             sh.reason
      FROM stock_history sh
      JOIN items i ON i.id = sh.item_id
      WHERE date_trunc('month', sh.created_at) = ${thisMonth}
      ORDER BY abs(sh.new_stock - sh.previous_stock) DESC
      LIMIT 10
    `,
  ])

  const report: ReportData = {
    month: (monthResult as { month: string }).month,
    summary: {
      totalChanges: (summary as { total_changes: number }).total_changes,
      itemsAffected: (summary as { items_affected: number }).items_affected,
      netChange: (summary as { net_change: number }).net_change,
    },
    outOfStock: outOfStock as { id: number; slug: string; name: string }[],
    wentOutOfStock: wentOut as { id: number; slug: string; name: string; date: string }[],
    topChanges: (topChanges as {
      id: number; slug: string; name: string
      previous_stock: number; new_stock: number
      change: number; reason: string | null
    }[]).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      previousStock: t.previous_stock,
      newStock: t.new_stock,
      change: t.change,
      reason: t.reason,
    })),
  }

  return report
}

export async function getUserEmails(): Promise<string[]> {
  const rows = await sql`SELECT email FROM neon_auth.user ORDER BY email`
  return rows.map((r: Record<string, unknown>) => r.email as string)
}
