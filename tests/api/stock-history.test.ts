import { describe, it, expect, afterEach } from 'vitest'
import { apiJson } from '../helpers'

const createdItemIds: number[] = []

afterEach(async () => {
  for (const id of createdItemIds) {
    await apiJson(`/api/items/${id}`, { method: 'DELETE' }).catch(() => {})
  }
  createdItemIds.length = 0
})

describe('stock-history API', () => {
  async function createItem(name: string, initialStock = 0) {
    const { data } = await apiJson('/api/items', {
      method: 'POST',
      body: { name },
    })
    createdItemIds.push(data.id)

    if (initialStock > 0) {
      await apiJson(`/api/items/${data.id}/stock`, {
        method: 'PATCH',
        body: { change: initialStock, reason: 'initial' },
      })
    }
    return data
  }

  it('adjusts stock and returns previous/new/change', async () => {
    const item = await createItem('Stock-Test-A')

    const { res, data } = await apiJson(`/api/items/${item.id}/stock`, {
      method: 'PATCH',
      body: { change: 10, reason: 'restock' },
    })
    expect(res.status).toBe(200)
    expect(data.previousStock).toBe(0)
    expect(data.newStock).toBe(10)
    expect(data.change).toBe(10)
  })

  it('updates item stock after adjustment', async () => {
    const item = await createItem('Stock-Test-B')
    await apiJson(`/api/items/${item.id}/stock`, {
      method: 'PATCH',
      body: { change: 5 },
    })
    const { data } = await apiJson(`/api/items/${item.id}`)
    expect(data.stock).toBe(5)
  })

  it('rejects insufficient stock', async () => {
    const item = await createItem('Stock-Test-C')

    const { res, data } = await apiJson(`/api/items/${item.id}/stock`, {
      method: 'PATCH',
      body: { change: -1 },
    })
    expect(res.status).toBe(400)
    expect(data.error).toContain('Insufficient')
  })

  it('creates stock history entry on adjustment', async () => {
    const item = await createItem('Stock-Test-D')

    await apiJson(`/api/items/${item.id}/stock`, {
      method: 'PATCH',
      body: { change: 7, reason: 'delivery' },
    })

    const { data } = await apiJson(`/api/items/${item.id}/stock-history`)
    expect(data.history.length).toBeGreaterThanOrEqual(1)

    const last = data.history[data.history.length - 1]
    expect(last.previous_stock).toBe(item.stock)
    expect(last.new_stock).toBe(item.stock + 7)
    expect(last.reason).toBe('delivery')
  })

  it('paginates stock history', async () => {
    const item = await createItem('Stock-Test-E')

    for (let i = 0; i < 5; i++) {
      await apiJson(`/api/items/${item.id}/stock`, {
        method: 'PATCH',
        body: { change: 1, reason: `add-${i}` },
      })
    }

    const { data } = await apiJson(`/api/items/${item.id}/stock-history?page=1&limit=2`)
    expect(data.history.length).toBeLessThanOrEqual(2)
    expect(data.pagination.total).toBeGreaterThanOrEqual(5)
    expect(data.pagination.page).toBe(1)
  })

  it('filters stock history by date range', async () => {
    const item = await createItem('Stock-Test-F')
    await apiJson(`/api/items/${item.id}/stock`, {
      method: 'PATCH',
      body: { change: 3 },
    })

    const now = new Date().toISOString()
    const past = new Date(Date.now() - 86400000).toISOString()
    const future = new Date(Date.now() + 86400000).toISOString()

    const { data: pastData } = await apiJson(
      `/api/items/${item.id}/stock-history?startDate=${past}&endDate=${future}`,
    )
    expect(pastData.history.length).toBeGreaterThanOrEqual(1)

    const { data: emptyData } = await apiJson(
      `/api/items/${item.id}/stock-history?startDate=${past}&endDate=${past}`,
    )
    expect(emptyData.history).toHaveLength(0)
  })

  it('returns global stock history with item info', async () => {
    const item = await createItem('Stock-Test-G')
    await apiJson(`/api/items/${item.id}/stock`, {
      method: 'PATCH',
      body: { change: 5 },
    })

    const { data } = await apiJson('/api/stock-history')
    expect(data.history.length).toBeGreaterThanOrEqual(1)

    const entry = data.history.find((h: any) => h.item_id === item.id)
    expect(entry).toBeDefined()
    expect(entry.item_name).toBe('Stock-Test-G')
    expect(entry.item_slug).toBe('stock-test-g')
  })

  it('filters global history by itemId', async () => {
    const itemA = await createItem('Stock-Test-H')
    const itemB = await createItem('Stock-Test-I')

    await apiJson(`/api/items/${itemA.id}/stock`, { method: 'PATCH', body: { change: 2 } })
    await apiJson(`/api/items/${itemB.id}/stock`, { method: 'PATCH', body: { change: 3 } })

    const { data } = await apiJson(`/api/stock-history?itemId=${itemA.id}`)
    expect(data.history.every((h: any) => h.item_id === itemA.id)).toBe(true)
  })
})
