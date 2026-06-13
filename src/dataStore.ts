import type { List, ListItem } from './types'

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms))

const listsMap = new Map<string, List>()
const itemsMap = new Map<string, ListItem[]>()

// Seed: Restaurants list
const restaurantId = crypto.randomUUID()
const amenitiesId = crypto.randomUUID()

listsMap.set(restaurantId, {
  id: restaurantId,
  name: 'Restaurants',
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString(),
})

listsMap.set(amenitiesId, {
  id: amenitiesId,
  name: 'Amenities',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

itemsMap.set(restaurantId, [
  {
    id: crypto.randomUUID(),
    listId: restaurantId,
    description: 'Mamamou',
    value: 'Pasta #38 Ngo Duc Ke, just opened',
    position: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    listId: restaurantId,
    description: 'Propaganda',
    value: '21 Ha Trung, D.1 — lunch only',
    position: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    listId: restaurantId,
    description: 'Anan Saigon',
    value: '89 Ton That Dam, D.1',
    position: 3,
    createdAt: new Date().toISOString(),
  },
])

itemsMap.set(amenitiesId, [])

export interface DataStore {
  listLists(): Promise<List[]>
  createList(name?: string): Promise<List>
  renameList(listId: string, name: string): Promise<List>
  deleteList(listId: string): Promise<void>
  listItems(listId: string): Promise<ListItem[]>
  addItem(listId: string, description: string, value: string): Promise<ListItem>
  updateItem(itemId: string, patch: { description?: string; value?: string }): Promise<ListItem>
  deleteItems(itemIds: string[]): Promise<void>
}

export const dataStore: DataStore = {
  async listLists() {
    await delay()
    return Array.from(listsMap.values()).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    )
  },

  async createList(name?) {
    await delay()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const list: List = { id, name: name ?? 'Name Your List', createdAt: now, updatedAt: now }
    listsMap.set(id, list)
    itemsMap.set(id, [])
    return list
  },

  async renameList(listId, name) {
    await delay()
    const list = listsMap.get(listId)!
    const updated = { ...list, name, updatedAt: new Date().toISOString() }
    listsMap.set(listId, updated)
    return updated
  },

  async deleteList(listId) {
    await delay()
    listsMap.delete(listId)
    itemsMap.delete(listId)
  },

  async listItems(listId) {
    await delay()
    return (itemsMap.get(listId) ?? []).slice().sort((a, b) => a.position - b.position)
  },

  async addItem(listId, description, value) {
    await delay()
    const existing = itemsMap.get(listId) ?? []
    const maxPos = existing.reduce((m, i) => Math.max(m, i.position), 0)
    const item: ListItem = {
      id: crypto.randomUUID(),
      listId,
      description,
      value,
      position: maxPos + 1,
      createdAt: new Date().toISOString(),
    }
    itemsMap.set(listId, [...existing, item])
    return item
  },

  async updateItem(itemId, patch) {
    await delay()
    for (const [listId, items] of itemsMap.entries()) {
      const idx = items.findIndex(i => i.id === itemId)
      if (idx !== -1) {
        const updated = { ...items[idx], ...patch }
        const next = items.slice()
        next[idx] = updated
        itemsMap.set(listId, next)
        return updated
      }
    }
    throw new Error(`Item ${itemId} not found`)
  },

  async deleteItems(itemIds) {
    await delay()
    const idSet = new Set(itemIds)
    for (const [listId, items] of itemsMap.entries()) {
      itemsMap.set(listId, items.filter(i => !idSet.has(i.id)))
    }
  },
}
