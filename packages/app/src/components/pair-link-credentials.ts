/** Clear a secret as soon as the pairing target changes. */
export function resetCredentialsForPairingTarget(
  previousUrl: string,
  nextUrl: string,
): { password: string; needsPassword: false } | null {
  return previousUrl === nextUrl ? null : { password: "", needsPassword: false };
}
