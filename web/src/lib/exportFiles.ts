// Builds XLSX and PDF files in the browser without a library. The API answers CSV only (API-013); the Ekspor page
// parses that CSV and writes the other formats from the same rows, so no column outside the allowlist can appear.
// Keep this file free of imports and of enums so `node --test` can load it as it is (exportFiles.test.mjs).

/** Reads RFC 4180 CSV (as written by csv.ts) into rows of cells. A leading BOM is ignored. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.startsWith('﻿') ? text.slice(1) : text;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** csv.ts prefixes cells that start with = + - @ with ' against formula injection; XLSX and PDF show text, so drop it again. */
const plain = (s: string) => (/^'[=+\-@]/.test(s) ? s.slice(1) : s);

// ---------------------------------------------------------------------------------------------------------- XLSX

const encoder = new TextEncoder();

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** A ZIP archive with every entry stored (no compression), which every XLSX reader accepts. */
export function zipStore(entries: { name: string; data: Uint8Array }[]): Uint8Array<ArrayBuffer> {
  const DOS_DATE = (46 << 9) | (1 << 5) | 1; // 2026-01-01; the time is 00:00
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = encoder.encode(name);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // file names are UTF-8
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, 0, true);
    local.setUint16(12, DOS_DATE, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true); // version made by
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, 0, true);
    entry.setUint16(12, 0, true);
    entry.setUint16(14, DOS_DATE, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, nameBytes.length, true);
    // extra, comment, disk number and attributes stay 0
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), nameBytes);

    offset += 30 + nameBytes.length + data.length;
  }
  const centralSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const xmlText = (s: string) =>
  // eslint-disable-next-line no-control-regex -- control characters other than tab and line breaks are not allowed in XML
  s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A1, B1, ... Z1, AA1 */
function columnName(index: number) {
  let n = index + 1;
  let name = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    name = String.fromCharCode(65 + r) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

/** Plain numbers become number cells; ids with a leading zero and everything else stay text. */
const NUMBER = /^-?(0|[1-9]\d{0,14})(\.\d+)?$/;

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const DOC_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

/** One-sheet workbook. The first row is the header: bold and frozen. */
export function buildXlsx(rows: string[][], sheetName = 'Data'): Uint8Array<ArrayBuffer> {
  const width = rows.reduce((n, r) => Math.max(n, r.length), 0);
  const cols = Array.from({ length: width }, (_, c) => {
    const longest = rows.slice(0, 200).reduce((n, r) => Math.max(n, (r[c] ?? '').length), 0);
    return `<col min="${c + 1}" max="${c + 1}" width="${Math.min(Math.max(longest + 2, 8), 48)}" customWidth="1"/>`;
  }).join('');

  const sheetRows = rows
    .map((row, r) => {
      const cells = row
        .map((raw, c) => {
          const ref = `${columnName(c)}${r + 1}`;
          const value = plain(raw);
          if (value === '') return '';
          if (r > 0 && NUMBER.test(value)) return `<c r="${ref}"><v>${value}</v></c>`;
          const style = r === 0 ? ' s="1"' : '';
          return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xmlText(value)}</t></is></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join('');

  const sheet =
    `${XML_HEAD}<worksheet xmlns="${NS}">` +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `<cols>${cols}</cols><sheetData>${sheetRows}</sheetData></worksheet>`;

  const safeName = xmlText(sheetName.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)) || 'Data';
  const files: Record<string, string> = {
    '[Content_Types].xml':
      `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '</Types>',
    '_rels/.rels':
      `${XML_HEAD}<Relationships xmlns="${REL_NS}">` +
      `<Relationship Id="rId1" Type="${DOC_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml':
      `${XML_HEAD}<workbook xmlns="${NS}" xmlns:r="${DOC_REL}">` +
      `<sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels':
      `${XML_HEAD}<Relationships xmlns="${REL_NS}">` +
      `<Relationship Id="rId1" Type="${DOC_REL}/worksheet" Target="worksheets/sheet1.xml"/>` +
      `<Relationship Id="rId2" Type="${DOC_REL}/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml':
      `${XML_HEAD}<styleSheet xmlns="${NS}">` +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml': sheet,
  };
  return zipStore(Object.entries(files).map(([name, text]) => ({ name, data: encoder.encode(text) })));
}

// ------------------------------------------------------------------------------------------------------------ PDF

const PAGE_W = 842; // A4 landscape, points
const PAGE_H = 595;
const MARGIN = 36;
const FONT_SIZE = 6.5;
const ROW_H = 10;
const AVG_CHAR = FONT_SIZE * 0.56; // Helvetica averages about 0.5 em; a little extra keeps text inside its column

/** The built-in Helvetica font reads WinAnsi (Latin-1 range); anything else becomes "?". */
const latin1 = (s: string) => s.replace(/[\r\n\t]+/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
const pdfString = (s: string) => `(${latin1(s).replace(/[\\()]/g, '\\$&')})`;

function fit(text: string, chars: number) {
  const s = latin1(plain(text));
  return s.length <= chars ? s : `${s.slice(0, Math.max(chars - 2, 1))}..`;
}

/**
 * A table PDF (A4 landscape, header repeated on every page). Cells are cut to their column, so very long text such as a
 * description is shortened here; CSV and XLSX keep the full text.
 */
export function buildPdf(title: string, subtitle: string, rows: string[][]): Uint8Array<ArrayBuffer> {
  const [header = [], ...body] = rows;
  const usable = PAGE_W - MARGIN * 2;
  const weights = header.map((h, c) => {
    const longest = body.slice(0, 200).reduce((n, r) => Math.max(n, (r[c] ?? '').length), h.length);
    return Math.min(Math.max(longest, 6), 34);
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const widths = weights.map((w) => (w / total) * usable);
  const xs = widths.map((_, c) => MARGIN + widths.slice(0, c).reduce((a, b) => a + b, 0));
  const chars = widths.map((w) => Math.max(Math.floor((w - 4) / AVG_CHAR), 2));

  const firstTop = PAGE_H - MARGIN - 40; // the title block sits above the first table
  const laterTop = PAGE_H - MARGIN;
  const perPage = (top: number) => Math.floor((top - MARGIN - 14) / ROW_H) - 1; // minus the header row and the footer
  const pages: string[][][] = [];
  let at = 0;
  do {
    const take = perPage(pages.length === 0 ? firstTop : laterTop);
    pages.push(body.slice(at, at + take));
    at += take;
  } while (at < body.length);

  const text = (font: 'F1' | 'F2', size: number, x: number, y: number, value: string) =>
    `BT /${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td ${pdfString(value)} Tj ET\n`;

  const streams = pages.map((pageRows, p) => {
    let out = '';
    let y = PAGE_H - MARGIN;
    if (p === 0) {
      out += text('F2', 14, MARGIN, y - 12, title);
      out += text('F1', 8, MARGIN, y - 26, subtitle);
      y -= 40;
    }
    header.forEach((h, c) => {
      out += text('F2', FONT_SIZE, xs[c] + 2, y - 8, fit(h, chars[c]));
    });
    out += `0.5 w ${MARGIN} ${(y - ROW_H + 1).toFixed(2)} m ${PAGE_W - MARGIN} ${(y - ROW_H + 1).toFixed(2)} l S\n`;
    y -= ROW_H;
    for (const row of pageRows) {
      row.forEach((cell, c) => {
        if (c < header.length) out += text('F1', FONT_SIZE, xs[c] + 2, y - 8, fit(cell, chars[c]));
      });
      y -= ROW_H;
    }
    out += text('F1', 7, PAGE_W - MARGIN - 60, MARGIN - 18, `Halaman ${p + 1} dari ${pages.length}`);
    return out;
  });

  // Objects: 1 catalog, 2 page tree, 3 and 4 fonts, then a page and its content stream per page.
  const kids = pages.map((_, p) => `${5 + p * 2} 0 R`).join(' ');
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];
  streams.forEach((s, p) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + p * 2} 0 R >>`,
      `<< /Length ${s.length} >>\nstream\n${s}endstream`,
    );
  });

  // Every character is in the Latin-1 range, so a string index equals a byte offset.
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}
