import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { apiJson } from '../helpers'

const createdItemIds: number[] = []
let testCategoryId = 0

beforeEach(async () => {
  if (!testCategoryId) {
    const { data } = await apiJson('/api/categories', {
      method: 'POST',
      body: { name: 'Test-Item-Cat' },
    })
    testCategoryId = data.id
  }
})

afterEach(async () => {
  for (const id of createdItemIds) {
    await apiJson(`/api/items/${id}`, { method: 'DELETE' }).catch(() => {})
  }
  createdItemIds.length = 0
})

afterEach(async () => {
  if (testCategoryId && !createdItemIds.length) {
    // keep category across tests within this suite
  }
})

describe('items API', () => {
  it('lists items with pagination', async () => {
    const { res, data } = await apiJson('/api/items')
    expect(res.status).toBe(200)
    expect(data.items).toBeDefined()
    expect(data.pagination).toBeDefined()
    expect(data.pagination.page).toBe(1)
  })

  it('creates an item with auto-slug', async () => {
    const { res, data } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Alpha', description: 'A test widget' },
    })
    expect(res.status).toBe(201)
    expect(data.slug).toMatch(/^test-widget-alpha(-\d+)?$/)
    expect(data.name).toBe('Test Widget Alpha')
    expect(data.stock).toBe(0)
    expect(data.categories).toEqual([])
    createdItemIds.push(data.id)
  })

  it('generates unique slug on duplicate name', async () => {
    const { data: first } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Beta' },
    })
    createdItemIds.push(first.id)
    expect(first.slug).toMatch(/^test-widget-beta(-\d+)?$/)

    const { data: second } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Beta' },
    })
    createdItemIds.push(second.id)
    expect(second.slug).toMatch(/^test-widget-beta(-\d+)?$/)
    expect(second.slug).not.toBe(first.slug)
  })

  it('creates item with categories', async () => {
    const { data: cat2 } = await apiJson('/api/categories', {
      method: 'POST',
      body: { name: 'Test-Item-Cat-2' },
    })

    const { res, data } = await apiJson('/api/items', {
      method: 'POST',
      body: {
        name: 'Test Widget Gamma',
        categoryIds: [testCategoryId, cat2.id],
      },
    })
    expect(res.status).toBe(201)
    expect(data.categories).toHaveLength(2)
    createdItemIds.push(data.id)

    await apiJson(`/api/categories/${cat2.id}`, { method: 'DELETE' })
  })

  it('rejects item with nonexistent category', async () => {
    const { res, data } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Delta', categoryIds: [99999] },
    })
    expect(res.status).toBe(400)
    expect(data.error).toContain('Categories not found')
  })

  it('gets item by id', async () => {
    const { data: created } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Epsilon' },
    })
    createdItemIds.push(created.id)

    const { res, data } = await apiJson(`/api/items/${created.id}`)
    expect(res.status).toBe(200)
    expect(data.name).toBe('Test Widget Epsilon')
  })

  it('gets item by slug', async () => {
    const { data: created } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Zeta' },
    })
    createdItemIds.push(created.id)

    const { res, data } = await apiJson(`/api/items/${created.slug}`)
    expect(res.status).toBe(200)
    expect(data.name).toBe('Test Widget Zeta')
  })

  it('returns 404 for nonexistent item', async () => {
    const { res, data } = await apiJson('/api/items/999999')
    expect(res.status).toBe(404)
    expect(data.error).toBeDefined()
  })

  it('filters items by search', async () => {
    const { data: item } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Searchable-Unique-Item' },
    })
    createdItemIds.push(item.id)

    const { data } = await apiJson('/api/items?search=Searchable-Unique')
    expect(data.items.length).toBeGreaterThanOrEqual(1)
    expect(data.items.some((i: Record<string, unknown>) => i.id === item.id)).toBe(true)
  })

  it('filters items by category', async () => {
    const { data: item } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Theta', categoryIds: [testCategoryId] },
    })
    createdItemIds.push(item.id)

    const { data } = await apiJson(`/api/items?categoryId=${testCategoryId}`)
    expect(data.items.length).toBeGreaterThanOrEqual(1)
    expect(data.items.some((i: Record<string, unknown>) => i.id === item.id)).toBe(true)
  })

  it('updates item name and regenerates slug', async () => {
    const { data: created } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Iota' },
    })
    createdItemIds.push(created.id)

    const { data } = await apiJson(`/api/items/${created.id}`, {
      method: 'PUT',
      body: { name: 'Test Widget Iota Renamed' },
    })
    expect(data.name).toBe('Test Widget Iota Renamed')
    expect(data.slug).toBe('test-widget-iota-renamed')
  })

  it('updates item categories', async () => {
    const { data: created } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Kappa', categoryIds: [testCategoryId] },
    })
    createdItemIds.push(created.id)
    expect(created.categories).toHaveLength(1)

    const { data } = await apiJson(`/api/items/${created.id}`, {
      method: 'PUT',
      body: { categoryIds: [] },
    })
    expect(data.categories).toHaveLength(0)
  })

  it('deletes an item', async () => {
    const { data: created } = await apiJson('/api/items', {
      method: 'POST',
      body: { name: 'Test Widget Lambda' },
    })

    const { res } = await apiJson(`/api/items/${created.id}`, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)

    const { res: getRes } = await apiJson(`/api/items/${created.id}`)
    expect(getRes.status).toBe(404)
  })
})
