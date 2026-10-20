import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Keeps Tab focus inside `ref` while `active`, closes on Escape,
// and returns focus to `returnFocusRef` when deactivated.
export default function useFocusTrap(ref, active, onClose, returnFocusRef) {
  useEffect(() => {
    if (!active || !ref.current) return undefined
    const node = ref.current
    const returnTarget = returnFocusRef?.current
    const first = node.querySelector(FOCUSABLE)
    first?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(node.querySelectorAll(FOCUSABLE))
      if (!items.length) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      returnTarget?.focus()
    }
  }, [active, ref, onClose, returnFocusRef])
}
