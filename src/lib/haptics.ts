/**
 * Haptic Vibration Feedback Utility for Mobile and Tactile Devices
 */

export function triggerHaptic(pattern: number | number[] = 15): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  
  try {
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported devices / strict permissions
  }
}

export const HAPTIC_PATTERNS = {
  click: 10,
  planchetteLetter: 16,
  planchetteWordEnd: [20, 30, 25],
  tarotCardFlip: [20, 25, 20],
  tarotShuffle: [10, 15, 10, 15, 20],
  revelationUnlock: [30, 40, 50, 20, 70],
  portalOpen: [15, 20, 15],
};
