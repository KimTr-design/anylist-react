import { useState, useRef, useEffect } from 'react'
import type { ListItem } from '../types'

interface Props {
  mode: 'add' | 'edit'
  item?: ListItem
  onDone: (description: string, value: string) => void
  onCancel: () => void
}

export default function AddEditForm({ mode, item, onDone, onCancel }: Props) {
  const [description, setDescription] = useState(item?.description ?? '')
  const [value, setValue] = useState(item?.value ?? '')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    if (mode === 'edit') nameRef.current?.select()
  }, [mode])

  function handleDone() {
    if (!description.trim()) {
      nameRef.current?.focus()
      return
    }
    onDone(description.trim(), value.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleDone()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-end px-4 w-full">
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <label className="text-base leading-[1.4] text-ink">Name</label>
        <input
          ref={nameRef}
          className="border border-line rounded-lg px-4 py-3 text-base text-ink placeholder-ink-tertiary shadow-input-inset outline-none focus:border-line-strong w-full transition-colors"
          placeholder="What is it?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <label className="text-base leading-[1.4] text-ink">Note</label>
        <input
          className="border border-line rounded-lg px-4 py-3 text-base text-ink placeholder-ink-tertiary shadow-input-inset outline-none focus:border-line-strong w-full transition-colors"
          placeholder="A description or anything"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button
        onClick={handleDone}
        className="w-full sm:w-auto sm:shrink-0 border border-[#767676] bg-surface-neutral text-ink rounded-lg px-3 py-3 text-base leading-none hover:bg-line transition-colors"
      >
        Done
      </button>
    </div>
  )
}
