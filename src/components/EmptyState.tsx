import { PlusIcon } from './icons'

interface Props {
  onAdd: () => void
}

export default function EmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center py-8">
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-3 bg-brand text-brand-on border border-brand rounded-lg text-base leading-none"
      >
        <PlusIcon />
        Add a thing
      </button>
    </div>
  )
}
