/** Fires a short vibration on devices that support it. No-op elsewhere (e.g. iOS Safari, desktop). */
export function tick() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
  }
}

/** A little double-pulse for reward moments (task completed, point earned). */
export function celebrateTick() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([10, 40, 16])
  }
}
