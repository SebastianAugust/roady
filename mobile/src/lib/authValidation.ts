/** Message under the "Konfirmasi Password" field, or undefined when it matches. The server never sees the confirmation. */
export function confirmPasswordError(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Ulangi password untuk konfirmasi.';
  if (confirm !== password) return 'Konfirmasi password tidak sama.';
  return undefined;
}
