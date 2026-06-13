export interface List {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ListItem {
  id: string
  listId: string
  description: string
  value: string
  position: number
  createdAt: string
}
