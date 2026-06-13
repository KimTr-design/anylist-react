import { useState, useEffect, useRef } from 'react'
import type { List } from '../types'

interface Props {
  lists: List[]
  activeListId: string | null
  newListId: string | null
  onSelect: (id: string) => void
  onAddNew: () => Promise<List>
  onRename: (listId: string, name: string) => void
}

export default function ListTabs({ lists, activeListId, newListId, onSelect, onAddNew, onRename }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-enter edit mode when a new list is created
  useEffect(() => {
    if (newListId) {
      setEditingId(newListId)
      setEditValue('')
    }
  }, [newListId])

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  function commitEdit() {
    if (!editingId) return
    const name = editValue.trim() || 'Name Your List'
    onRename(editingId, name)
    setEditingId(null)
  }

  function handleTabClick(list: List) {
    if (list.id !== activeListId) {
      onSelect(list.id)
      setEditingId(null)
    } else if (editingId !== list.id) {
      // Click active tab → edit its name
      setEditingId(list.id)
      setEditValue(list.name === 'Name Your List' ? '' : list.name)
    }
  }

  async function handleAddNew() {
    const list = await onAddNew()
    // newListId prop will trigger the edit via useEffect
    setEditingId(list.id)
    setEditValue('')
  }

  return (
    <div className="flex items-start overflow-x-auto max-w-[800px]">
      {lists.map(list => {
        const isActive = list.id === activeListId
        const isEditing = editingId === list.id

        return (
          <div
            key={list.id}
            className={`border-b px-3 py-1 rounded-t cursor-pointer shrink-0 ${
              isActive ? 'border-line-strong' : 'border-line-muted'
            }`}
            onClick={() => handleTabClick(list)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className="outline-none bg-transparent text-ink text-base leading-[1.4] w-[120px] min-w-0"
                value={editValue}
                placeholder="Name your list"
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className={`text-base leading-[1.4] whitespace-nowrap ${
                  isActive ? 'text-line-strong' : 'text-[#767676]'
                }`}
              >
                {list.name}
              </span>
            )}
          </div>
        )
      })}

      {/* Add New tab */}
      <div
        className="border-b border-line-muted px-3 py-1 rounded-t cursor-pointer shrink-0"
        onClick={handleAddNew}
      >
        <span className="text-base leading-[1.4] text-[#767676] whitespace-nowrap">+ Add New</span>
      </div>
    </div>
  )
}
