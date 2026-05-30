import { describe, it, expect, afterEach } from 'vitest'
import { apiJson } from '../helpers'

const createdIds: number[] = []

afterEach(async () => {
  for (const id of createdIds) {
    await apiJson(`/api/categories/${id}`, { method: 'DELETE' }).catch(() => {})
  }
  createdIds.length = 0
})

describe('categories API', () => {
  it('lists categories', async () => {
    const { res, data } = await apiJson('/api/categories')
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('creates a category', async () => {
    const { res, data } = await apiJson('/api/categories', {
      method: 'POST',
      body: { name: 'Test-Cat-A', description: 'A test category' },
    })
    expect(res.status).toBe(201)
    expect(data.id).toBeGreaterThan(0)
    expect(data.name).toBe('Test-Cat-A')
    expect(data.description).toBe('A test category')
    createdIds.push(data.id)
  })

  it('rejects category without name', async () => {
    const { res, data } = await apiJson('/api/categories', {
      method: 'POST',
      body: { description: 'no name' },
    })
    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('gets a single category', async () => {
    const { data: created } = await apiJson('/api/categories', {
      method: 'POST',
      body: { name: 'Test-Cat-B' },
    })
    createdIds.push(created.id)

    const { res, data } = await apiJson(`/api/categories/${created.id}`)
    expect(res.status).toBe(200)
    expect(data.name).toBe('Test-Cat-B')
  })

  it('returns 404 for nonexistent category', async () => {
    const { res, data } = await apiJson('/api/categories/999999')
    expect(res.status).toBe(404)
    expect(data.error).toBeDefined()
  })

  it('updates a category', async () => {
    const { data: created } = await apiJson('/api/categories', {
      method: 'POST',
      body: { name: 'Test-Cat-C', description: 'original' },
    })
    createdIds.push(created.id)

    const { res, data } = await apiJson(`/api/categories/${created.id}`, {
      method: 'PUT',
      body: { name: 'Test-Cat-C-Updated', description: 'updated' },
    })
    expect(res.status).toBe(200)
    expect(data.name).toBe('Test-Cat-C-Updated')
    expect(data.description).toBe('updated')
  })

  it('deletes a category', async () => {
    const { data: created } = await apiJson('/api/categories', {
      method: 'POST',
      body: { name: 'Test-Cat-D' },
    })

    const { res } = await apiJson(`/api/categories/${created.id}`, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)

    const { res: getRes } = await apiJson(`/api/categories/${created.id}`)
    expect(getRes.status).toBe(404)
  })
})
