import type { List, ListItem } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

interface ApiList {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface ApiItem {
  id: number
  list_id: number
  value: string
  description: string
  position: number
  created_at: string
  updated_at: string
}

function toList(l: ApiList): List {
  return {
    id: String(l.id),
    name: l.name,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  }
}

function toItem(i: ApiItem): ListItem {
  return {
    id: String(i.id),
    listId: String(i.list_id),
    description: i.description,
    value: i.value,
    position: i.position,
    createdAt: i.created_at,
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`${options?.method ?? 'GET'} ${path} failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface DataStore {
  listLists(): Promise<List[]>
  createList(name?: string): Promise<List>
  renameList(listId: string, name: string): Promise<List>
  deleteList(listId: string): Promise<void>
  listItems(listId: string): Promise<ListItem[]>
  addItem(listId: string, description: string, value: string): Promise<ListItem>
  updateItem(
    listId: string,
    itemId: string,
    patch: { description?: string; value?: string }
  ): Promise<ListItem>
  deleteItems(listId: string, itemIds: string[]): Promise<void>
}

export const dataStore: DataStore = {
  async listLists() {
    const lists = await request<ApiList[]>('/lists')
    return lists.map(toList)
  },

  async createList(name = 'Name Your List') {
    const list = await request<ApiList>('/lists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    return toList(list)
  },

  async renameList(listId, name) {
    const list = await request<ApiList>(`/lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
    return toList(list)
  },

  async deleteList(listId) {
    await request<void>(`/lists/${listId}`, { method: 'DELETE' })
  },

  async listItems(listId) {
    const items = await request<ApiItem[]>(`/lists/${listId}/items`)
    return items.map(toItem).sort((a, b) => a.position - b.position)
  },

  async addItem(listId, description, value) {
    const item = await request<ApiItem>(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ description, value }),
    })
    return toItem(item)
  },

  async updateItem(listId, itemId, patch) {
    const item = await request<ApiItem>(`/lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return toItem(item)
  },

  async deleteItems(listId, itemIds) {
    await Promise.all(
      itemIds.map(id => request<void>(`/lists/${listId}/items/${id}`, { method: 'DELETE' }))
    )
  },
}
