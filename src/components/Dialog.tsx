import type { ListItem } from '../types'
import { XIcon } from './icons'

interface ConfirmRemoveProps {
  variant: 'confirm-remove'
  selectedCount: number
  onCancel: () => void
  onConfirm: () => void
}

interface RouletteResultProps {
  variant: 'roulette-result'
  winner: ListItem
  onClose: () => void
  onSpinAgain: () => void
}

type Props = ConfirmRemoveProps | RouletteResultProps

export default function Dialog(props: Props) {
  const onDismiss = props.variant === 'confirm-remove' ? props.onCancel : props.onClose

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop — no dark fill, just blocks clicks */}
      <div className="absolute inset-0" onClick={onDismiss} />

      <div className="relative bg-white border border-line rounded-lg p-8 w-[466px] shadow-dialog flex flex-col gap-6">
        {/* Close X */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-surface-neutral transition-colors"
          aria-label="Close"
        >
          <XIcon />
        </button>

        {props.variant === 'confirm-remove' ? (
          <>
            <div className="flex flex-col gap-3 pr-6">
              <h2 className="text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
                {props.selectedCount === 1
                  ? 'Remove this item?'
                  : `Remove ${props.selectedCount} items?`}
              </h2>
              <p className="text-base leading-[1.4] text-ink">
                Are you sure you want to remove{' '}
                {props.selectedCount === 1 ? 'this item' : `these ${props.selectedCount} items`}?
                <br />
                All deletes are permanent.
              </p>
            </div>
            <div className="flex gap-4 items-center justify-end">
              <button
                onClick={props.onCancel}
                className="px-3 py-3 bg-surface-neutral border border-[#767676] rounded-lg text-base leading-none text-ink"
              >
                Cancel
              </button>
              <button
                onClick={props.onConfirm}
                className="px-3 py-3 bg-brand border border-brand rounded-lg text-base leading-none text-brand-on"
              >
                Yes, delete
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 pr-6">
              <h2 className="text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
                🎉🎊✨
              </h2>
              <div className="text-base leading-[1.4] text-ink">
                <span>Your winner:</span>
                <br />
                <strong className="font-semibold">{props.winner.description}</strong>
                {props.winner.value && (
                  <>
                    <br />
                    <span className="text-ink-secondary text-sm">{props.winner.value}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4 items-center justify-end">
              <button
                onClick={props.onClose}
                className="px-3 py-3 bg-surface-neutral border border-[#767676] rounded-lg text-base leading-none text-ink"
              >
                Close
              </button>
              <button
                onClick={props.onSpinAgain}
                className="px-3 py-3 bg-brand border border-brand rounded-lg text-base leading-none text-brand-on"
              >
                Spin Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
