/** Fires a short vibration on devices that support it. No-op elsewhere (e.g. iOS Safari, desktop). */
export function tick() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
  }
}
