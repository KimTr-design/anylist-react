import { useState, useEffect, useRef } from 'react'
import type { ListItem } from '../types'
import { dataStore } from '../dataStore'
import ListToolbar from './ListToolbar'
import ItemRow from './ItemRow'
import AddEditForm from './AddEditForm'
import EmptyState from './EmptyState'
import Dialog from './Dialog'
import Separator from './Separator'

interface Props {
  listId: string
}

export default function ListScreen({ listId }: Props) {
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [rouletteWinner, setRouletteWinner] = useState<ListItem | null>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    setSelectedIds(new Set())
    setIsAdding(false)
    setEditingItemId(null)
    setShowConfirmRemove(false)
    setRouletteWinner(null)
    dataStore.listItems(listId).then(data => {
      setItems(data)
      setLoading(false)
    })
  }, [listId])

  const isEmpty = items.length === 0
  const isSelecting = selectedIds.size > 0
  const allSelected = items.length > 0 && selectedIds.size === items.length
  const toolbarMode: 'default' | 'selecting' = isSelecting ? 'selecting' : 'default'
  // Toolbar is shown unless EMPTY and not adding
  const showToolbar = !isEmpty || isAdding

  function scrollToEnd() {
    setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 60)
  }

  // --- Add ---
  function handleStartAdd() {
    setEditingItemId(null)
    setIsAdding(true)
  }

  async function handleAddDone(description: string, value: string) {
    const item = await dataStore.addItem(listId, description, value)
    setItems(prev => [...prev, item])
    setIsAdding(false)
    scrollToEnd()
  }

  function handleAddCancel() {
    setIsAdding(false)
  }

  // --- Edit ---
  function handleStartEdit(itemId: string) {
    setIsAdding(false)
    setEditingItemId(itemId)
  }

  async function handleEditDone(description: string, value: string) {
    if (!editingItemId) return
    const updated = await dataStore.updateItem(listId, editingItemId, { description, value })
    setItems(prev => prev.map(i => (i.id === editingItemId ? updated : i)))
    setEditingItemId(null)
  }

  function handleEditCancel() {
    setEditingItemId(null)
  }

  // --- Select ---
  function handleSelectItem(id: string) {
    setIsAdding(false)
    setEditingItemId(null)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }

  // --- Remove ---
  function handleRemove() {
    setShowConfirmRemove(true)
  }

  async function handleConfirmRemove() {
    const ids = Array.from(selectedIds)
    await dataStore.deleteItems(listId, ids)
    setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
    setSelectedIds(new Set())
    setShowConfirmRemove(false)
  }

  function handleCancelRemove() {
    setShowConfirmRemove(false)
  }

  // --- Roulette ---
  function pickWinner() {
    if (items.length === 0) return null
    return items[Math.floor(Math.random() * items.length)]
  }

  function handleRoulette() {
    const winner = pickWinner()
    if (winner) setRouletteWinner(winner)
  }

  function handleRouletteClose() {
    setRouletteWinner(null)
  }

  function handleSpinAgain() {
    const winner = pickWinner()
    if (winner) setRouletteWinner(winner)
  }

  if (loading) return null

  return (
    <div className="relative w-full max-w-[640px]">
      {/* Toolbar — flows naturally on mobile, absolute on desktop */}
      {showToolbar && (
        <div className="sm:absolute sm:top-0 sm:left-0 sm:right-0 sm:flex sm:items-end sm:h-[40px] w-full">
          <ListToolbar
            mode={toolbarMode}
            itemCount={items.length}
            selectedCount={selectedIds.size}
            allSelected={allSelected}
            onRoulette={handleRoulette}
            onAddAnother={handleStartAdd}
            onRemove={handleRemove}
            onSelectAll={handleSelectAll}
          />
        </div>
      )}

      {/* Content — only needs top offset on desktop where toolbar is absolute */}
      <div className={`flex flex-col gap-3 ${showToolbar ? 'sm:pt-[52px]' : ''}`}>
        {isEmpty && !isAdding ? (
          <EmptyState onAdd={handleStartAdd} />
        ) : (
          <>
            <Separator />
            {items.map((item, i) => (
              <div key={item.id}>
                {editingItemId === item.id ? (
                  <AddEditForm
                    mode="edit"
                    item={item}
                    onDone={handleEditDone}
                    onCancel={handleEditCancel}
                  />
                ) : (
                  <ItemRow
                    item={item}
                    selected={selectedIds.has(item.id)}
                    onSelect={handleSelectItem}
                    onEdit={handleStartEdit}
                  />
                )}
                {/* Separator between items, and before the add form */}
                {(i < items.length - 1 || isAdding) && <Separator />}
              </div>
            ))}
            {isAdding && (
              <AddEditForm
                mode="add"
                onDone={handleAddDone}
                onCancel={handleAddCancel}
              />
            )}
          </>
        )}
        <div ref={listEndRef} />
      </div>

      {/* Modals */}
      {showConfirmRemove && (
        <Dialog
          variant="confirm-remove"
          selectedCount={selectedIds.size}
          onCancel={handleCancelRemove}
          onConfirm={handleConfirmRemove}
        />
      )}
      {rouletteWinner && (
        <Dialog
          variant="roulette-result"
          winner={rouletteWinner}
          onClose={handleRouletteClose}
          onSpinAgain={handleSpinAgain}
        />
      )}
    </div>
  )
}
