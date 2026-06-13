import type { ListItem } from '../types'
import { PencilIcon, CheckIcon } from './icons'

interface Props {
  item: ListItem
  selected: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
}

export default function ItemRow({ item, selected, onSelect, onEdit }: Props) {
  return (
    <div className="flex gap-3 items-center px-4 w-full min-h-[44px]">
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex gap-3 items-center">
          <button
            onClick={() => onSelect(item.id)}
            className={`shrink-0 size-4 rounded border flex items-center justify-center transition-colors ${
              selected
                ? 'bg-brand border-brand'
                : 'bg-white border-[#757575] shadow-input-inset'
            }`}
            role="checkbox"
            aria-checked={selected}
            aria-label={`Select ${item.description}`}
          >
            {selected && <CheckIcon className="text-white" />}
          </button>
          <span className="text-base leading-[1.4] text-ink flex-1 min-w-0 break-words">
            {item.description}
          </span>
        </div>
        {item.value && (
          <div className="flex gap-3 items-center pl-7">
            <span className="text-base leading-[1.4] text-ink-secondary flex-1 min-w-0 break-words">
              {item.value}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={() => onEdit(item.id)}
        className="shrink-0 size-6 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
        aria-label={`Edit ${item.description}`}
      >
        <PencilIcon size={16} />
      </button>
    </div>
  )
}
