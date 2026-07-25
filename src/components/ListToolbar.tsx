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
    <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between sm:pl-4 w-full gap-2">
      {/* Action buttons — vertical column on mobile (centered/hugged), horizontal row on desktop */}
      <div className="flex flex-col items-center sm:flex-row gap-2 sm:items-center sm:order-2">
        {isSelecting && (
          <button
            onClick={onRemove}
            className="flex items-center gap-2 px-3 py-3 border border-[#767676] text-ink rounded-lg text-base leading-none hover:bg-surface-neutral transition-colors sm:border-0"
          >
            <Trash2Icon />
            Remove
          </button>
        )}
        {hasItems && (
          <button
            onClick={onRoulette}
            className={`flex items-center gap-2 px-3 py-3 border rounded-lg text-base leading-none transition-colors border-[#767676] text-ink hover:bg-surface-neutral ${
              isSelecting ? 'sm:hidden' : 'sm:bg-brand sm:text-brand-on sm:border-brand'
            }`}
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
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add another thing</span>
        </button>
      </div>

      {/* Select All — below on mobile, left on desktop */}
      <div className="sm:order-1">
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
    </div>
  )
}
