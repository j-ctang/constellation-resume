export const ONBOARD_KEY = 'constellation-resume:onboarded'

export function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

export function writeFlag(key: string): void {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // Storage blocked (private mode). Dismissal lasts for this page view only.
  }
}
