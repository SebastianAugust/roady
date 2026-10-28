/** Saves text as a file through a temporary link. The BOM makes Excel read the CSV as UTF-8. */
export function downloadText(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿', content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  // Revoke after the click has been handled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
