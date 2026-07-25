import { useState, useEffect, useRef } from 'react'
import type { List } from '../types'
import { PencilIcon, Trash2Icon, XIcon, PlusIcon, ChevronDownIcon } from './icons'

interface Props {
  lists: List[]
  activeListId: string | null
  newListId: string | null
  onSelect: (id: string) => void
  onAddNew: () => Promise<List>
  onRename: (listId: string, name: string) => void
  onDeleteList: (listId: string) => void
}

export default function ListTabs({ lists, activeListId, newListId, onSelect, onAddNew, onRename, onDeleteList }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeList = lists.find(l => l.id === activeListId) ?? null

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showDropdown])

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
      setEditingId(list.id)
      setEditValue(list.name === 'Name Your List' ? '' : list.name)
    }
  }

  async function handleAddNew() {
    const list = await onAddNew()
    setEditingId(list.id)
    setEditValue('')
  }

  const deleteTarget = lists.find(l => l.id === deleteConfirmId)

  return (
    <>
      {/* ── Mobile: compact dropdown ── */}
      <div className="sm:hidden flex items-center gap-2 w-full max-w-[800px]">
        <div className="relative" ref={dropdownRef}>
          {editingId === activeListId ? (
            <div className="border-b border-line-strong px-3 py-1 rounded-t">
              <input
                ref={inputRef}
                className="outline-none bg-transparent text-ink text-base leading-[1.4] w-[160px] min-w-0"
                value={editValue}
                placeholder="Name your list"
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            </div>
          ) : (
            <button
              className="flex items-center gap-1 border-b border-line-strong px-3 py-1 rounded-t text-ink text-base leading-[1.4]"
              onClick={() => setShowDropdown(v => !v)}
            >
              <span>{activeList?.name ?? 'Select list'}</span>
              <ChevronDownIcon size={14} className="text-ink shrink-0" />
            </button>
          )}

          {showDropdown && (
            <div className="absolute top-full left-0 bg-white border border-line rounded-lg shadow-dialog mt-1 z-50 min-w-[180px] py-1">
              {/* List switcher */}
              {lists.map(list => (
                <button
                  key={list.id}
                  className={`w-full text-left px-4 py-2 text-base leading-[1.4] hover:bg-surface-neutral transition-colors ${
                    list.id === activeListId ? 'text-ink font-semibold' : 'text-ink-secondary'
                  }`}
                  onClick={() => { onSelect(list.id); setShowDropdown(false) }}
                >
                  {list.name}
                </button>
              ))}
              <div className="h-px bg-line mx-4 my-1" />
              {/* Edit Name */}
              <button
                className="w-full text-left px-4 py-2 text-base leading-[1.4] text-ink hover:bg-surface-neutral transition-colors"
                onClick={() => {
                  if (activeList) {
                    setEditingId(activeList.id)
                    setEditValue(activeList.name === 'Name Your List' ? '' : activeList.name)
                  }
                  setShowDropdown(false)
                }}
              >
                Edit Name
              </button>
              {/* Delete */}
              <button
                className="w-full text-left px-4 py-2 text-base leading-[1.4] text-[#e53935] hover:bg-surface-neutral transition-colors"
                onClick={() => {
                  if (activeListId) setDeleteConfirmId(activeListId)
                  setShowDropdown(false)
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* New List button */}
        <button
          className="flex items-center justify-center gap-2 h-[30px] p-2 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:bg-surface-neutral transition-colors"
          onClick={handleAddNew}
        >
          <PlusIcon size={16} className="text-ink shrink-0" />
          <span className="text-base leading-none text-ink whitespace-nowrap">New List</span>
        </button>
      </div>

      {/* ── Desktop: individual tabs ── */}
      <div className="hidden sm:flex items-start overflow-x-auto max-w-[800px]">
        {lists.map(list => {
          const isActive = list.id === activeListId
          const isEditing = editingId === list.id
          const isHovered = hoveredId === list.id

          return (
            <div
              key={list.id}
              className={`relative border-b px-3 py-1 rounded-t cursor-pointer shrink-0 ${
                isActive ? 'border-line-strong' : 'border-line-muted'
              }`}
              onClick={() => handleTabClick(list)}
              onMouseEnter={() => setHoveredId(list.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-1">
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

                {isHovered && !isEditing && (
                  <div className="flex items-center gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
                    <button
                      className="p-0.5 rounded hover:bg-surface-neutral transition-colors"
                      aria-label="Rename list"
                      onClick={() => {
                        setEditingId(list.id)
                        setEditValue(list.name === 'Name Your List' ? '' : list.name)
                        if (list.id !== activeListId) onSelect(list.id)
                      }}
                    >
                      <PencilIcon size={16} className="text-ink-secondary" />
                    </button>
                    <button
                      className="p-0.5 rounded hover:bg-surface-neutral transition-colors"
                      aria-label="Delete list"
                      onClick={() => setDeleteConfirmId(list.id)}
                    >
                      <Trash2Icon size={16} className="text-[#e53935]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* New List subtle button */}
        <button
          className="flex items-center justify-center gap-2 h-[30px] p-2 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:bg-surface-neutral transition-colors"
          onClick={handleAddNew}
        >
          <PlusIcon size={16} className="text-ink shrink-0" />
          <span className="text-base leading-none text-ink whitespace-nowrap">New List</span>
        </button>
      </div>

      {/* List delete confirmation dialog */}
      {deleteConfirmId && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white border border-line rounded-lg p-8 w-full max-w-[466px] shadow-dialog flex flex-col gap-6">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-surface-neutral transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
            <div className="flex flex-col gap-3 pr-6">
              <h2 className="text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
                Remove &ldquo;{deleteTarget.name}&rdquo;?
              </h2>
              <p className="text-base leading-[1.4] text-ink">
                Are you sure to remove this list along with all items within it?
                <br />
                All deletes are permanent.
              </p>
            </div>
            <div className="flex gap-4 items-center justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-3 bg-surface-neutral border border-[#767676] rounded-lg text-base leading-none text-ink"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteList(deleteConfirmId)
                  setDeleteConfirmId(null)
                  setHoveredId(null)
                }}
                className="px-3 py-3 bg-brand border border-brand rounded-lg text-base leading-none text-brand-on"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
