import { PlusIcon, SunIcon, Trash2Icon, CheckIcon, MinusIcon } from './icons'

interface Props {
  mode: 'default' | 'selecting'
  itemCount: number
  selectedCount: number
  allSelected: boolean
  onRoulette: () => void
  onAddAnother: () => void
  onRemove: () => void
  onSelectAll: () => void
}

export default function ListToolbar({
  mode,
  itemCount,
  selectedCount,
  allSelected,
  onRoulette,
  onAddAnother,
  onRemove,
  onSelectAll,
}: Props) {
  const hasItems = itemCount > 0
  const isSelecting = mode === 'selecting'
  const isPartial = isSelecting && !allSelected

  return (
    <div className="flex items-end justify-between pl-4 w-full">
      {/* Left — select all / selection state */}
      <div>
        {hasItems && (
          <button
            onClick={onSelectAll}
            className="flex gap-3 items-center"
          >
            <div
              className={`size-4 rounded border flex items-center justify-center transition-colors ${
                isSelecting
                  ? 'bg-brand border-brand'
                  : 'bg-white border-[#757575] shadow-input-inset'
              }`}
            >
              {isSelecting && (
                isPartial
                  ? <MinusIcon className="text-white" />
                  : <CheckIcon className="text-white" />
              )}
            </div>
            <span className="text-base leading-[1.4] text-ink whitespace-nowrap">
              {isSelecting
                ? `Selected (${selectedCount}/${itemCount})`
                : `Select All (${itemCount})`}
            </span>
          </button>
        )}
      </div>

      {/* Right — action buttons */}
      <div className="flex gap-2 items-center">
        {!isSelecting && hasItems && (
          <button
            onClick={onRoulette}
            className="flex items-center gap-2 px-3 py-3 bg-brand text-brand-on border border-brand rounded-lg text-base leading-none"
          >
            <SunIcon />
            Roulette
          </button>
        )}
        <button
          onClick={onAddAnother}
          className="flex items-center gap-2 px-3 py-3 bg-brand text-brand-on border border-brand rounded-lg text-base leading-none"
        >
          <PlusIcon />
          Add another thing
        </button>
        {isSelecting && (
          <button
            onClick={onRemove}
            className="flex items-center gap-2 px-3 py-3 text-line-strong rounded-lg text-base leading-none hover:bg-surface-neutral transition-colors"
          >
            <Trash2Icon />
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
