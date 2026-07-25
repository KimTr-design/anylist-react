import { useState, useEffect } from 'react'
import type { List } from './types'
import { dataStore } from './dataStore'
import AppHeader from './components/AppHeader'
import ListTabs from './components/ListTabs'
import ListScreen from './components/ListScreen'

export default function App() {
  const [lists, setLists] = useState<List[]>([])
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [newListId, setNewListId] = useState<string | null>(null)

  useEffect(() => {
    dataStore.listLists().then(data => {
      setLists(data)
      if (data.length > 0) setActiveListId(data[0].id)
    })
  }, [])

  async function handleAddNew() {
    const list = await dataStore.createList()
    setLists(prev => [...prev, list])
    setActiveListId(list.id)
    setNewListId(list.id)
    return list
  }

  async function handleRename(listId: string, name: string) {
    const updated = await dataStore.renameList(listId, name)
    setLists(prev => prev.map(l => (l.id === listId ? updated : l)))
    setNewListId(null)
  }

  async function handleDeleteList(listId: string) {
    await dataStore.deleteList(listId)
    setLists(prev => {
      const next = prev.filter(l => l.id !== listId)
      if (activeListId === listId) {
        setActiveListId(next.length > 0 ? next[0].id : null)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center gap-6 sm:gap-12 py-12 sm:py-[100px] px-4 sm:px-0">
        <AppHeader />
        <ListTabs
          lists={lists}
          activeListId={activeListId}
          newListId={newListId}
          onSelect={id => { setActiveListId(id); setNewListId(null) }}
          onAddNew={handleAddNew}
          onRename={handleRename}
          onDeleteList={handleDeleteList}
        />
        {activeListId && (
          <ListScreen key={activeListId} listId={activeListId} />
        )}
      </div>
    </div>
  )
}
