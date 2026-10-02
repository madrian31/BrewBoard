/** Returns null kapag hindi dapat ipakita (hal. isinara lang ng user ang popup). */
export function describeAuthError(err: unknown): string | null {
  const code =
    typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Add it under Firebase Authentication, Settings, Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Turn it on under Firebase Authentication, Sign-in method.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}
