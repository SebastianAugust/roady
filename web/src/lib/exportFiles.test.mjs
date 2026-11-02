// Run from web/: npm test (node --test; Node strips the TypeScript types by itself).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toCsv } from './csv.ts';
import { buildPdf, buildXlsx, parseCsv, zipStore } from './exportFiles.ts';

/** Reads a stored ZIP back through its central directory, checking each entry's CRC. */
function unzip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = bytes.length - 22;
  assert.equal(view.getUint32(eocd, true), 0x06054b50);
  const count = view.getUint16(eocd + 10, true);
  let at = view.getUint32(eocd + 16, true);
  const files = {};
  for (let i = 0; i < count; i++) {
    assert.equal(view.getUint32(at, true), 0x02014b50);
    const crc = view.getUint32(at + 16, true);
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const local = view.getUint32(at + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength));
    assert.equal(view.getUint32(local, true), 0x04034b50);
    const start = local + 30 + view.getUint16(local + 26, true);
    const data = bytes.subarray(start, start + size);
    let c = 0xffffffff;
    for (const b of data) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    assert.equal((c ^ 0xffffffff) >>> 0, crc, `crc of ${name}`);
    files[name] = new TextDecoder().decode(data);
    at += 46 + nameLength;
  }
  return files;
}

const ROWS = [
  { id: 1, alamat: 'Jl. "Asia", Afrika', catatan: '=1+1', negatif: -6.9 },
  { id: 2, alamat: 'Baris\nbaru', catatan: null, negatif: 107.6 },
];
const COLUMNS = ['id', 'alamat', 'catatan', 'negatif'];

test('parseCsv reads back what toCsv wrote (quotes, commas, line breaks, empty cells)', () => {
  const parsed = parseCsv(toCsv(ROWS, COLUMNS));
  assert.deepEqual(parsed, [
    ['id', 'alamat', 'catatan', 'negatif'],
    ['1', 'Jl. "Asia", Afrika', "'=1+1", '-6.9'],
    ['2', 'Baris\nbaru', '', '107.6'],
  ]);
});

test('parseCsv ignores a BOM and a missing final line break', () => {
  assert.deepEqual(parseCsv('﻿a,b\r\n1,2'), [
    ['a', 'b'],
    ['1', '2'],
  ]);
});

test('zipStore writes entries whose names and CRCs read back', () => {
  const zip = zipStore([
    { name: 'a.txt', data: new TextEncoder().encode('halo') },
    { name: 'dir/b.txt', data: new TextEncoder().encode('') },
  ]);
  assert.deepEqual(unzip(zip), { 'a.txt': 'halo', 'dir/b.txt': '' });
});

test('buildXlsx: package parts, header row, numbers as numbers, text escaped, formula prefix dropped', () => {
  const files = unzip(buildXlsx(parseCsv(toCsv(ROWS, COLUMNS)), 'Data Zona'));
  assert.deepEqual(Object.keys(files).sort(), [
    '[Content_Types].xml',
    '_rels/.rels',
    'xl/_rels/workbook.xml.rels',
    'xl/styles.xml',
    'xl/workbook.xml',
    'xl/worksheets/sheet1.xml',
  ]);
  assert.match(files['xl/workbook.xml'], /name="Data Zona"/);
  const sheet = files['xl/worksheets/sheet1.xml'];
  assert.match(sheet, /<c r="A1" s="1" t="inlineStr">/); // bold header
  assert.match(sheet, /<c r="A2"><v>1<\/v><\/c>/); // number
  assert.match(sheet, /<c r="D2"><v>-6\.9<\/v><\/c>/);
  assert.match(sheet, /Jl\. "Asia", Afrika/);
  assert.match(sheet, /<t xml:space="preserve">=1\+1<\/t>/); // text, so Excel never evaluates it; the ' prefix is gone
  assert.doesNotMatch(sheet, /r="C3"/); // empty cell is skipped
  for (const xml of Object.values(files)) assert.match(xml, /^<\?xml/);
});

test('buildXlsx keeps an id with a leading zero as text and escapes markup', () => {
  const sheet = unzip(buildXlsx([['kode'], ['007'], ['a<b&c']]))['xl/worksheets/sheet1.xml'];
  assert.match(sheet, /<c r="A2" t="inlineStr"><is><t xml:space="preserve">007<\/t>/);
  assert.match(sheet, /a&lt;b&amp;c/);
});

test('buildPdf: valid structure, one page per ~50 rows, xref offsets point at their objects', () => {
  const rows = [['id', 'teks']];
  for (let i = 1; i <= 130; i++) rows.push([String(i), `Baris ke-${i} (uji) \\ ${'x'.repeat(i % 60)}`]);
  const bytes = buildPdf('Data Laporan', 'Dibuat uji', rows);
  const pdf = new TextDecoder('latin1').decode(bytes);
  assert.ok(pdf.startsWith('%PDF-1.4'));
  assert.ok(pdf.trimEnd().endsWith('%%EOF'));
  const pages = Number(/\/Count (\d+)/.exec(pdf)[1]);
  assert.ok(pages >= 3 && pages <= 4, `pages: ${pages}`);
  const startxref = Number(/startxref\n(\d+)/.exec(pdf)[1]);
  assert.ok(pdf.slice(startxref).startsWith('xref'));
  const entries = [...pdf.slice(startxref).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
  entries.forEach((offset, i) => assert.ok(pdf.slice(offset).startsWith(`${i + 1} 0 obj`), `object ${i + 1}`));
  // Each stream's /Length matches its text.
  for (const m of pdf.matchAll(/\/Length (\d+) >>\nstream\n([\s\S]*?)endstream/g)) assert.equal(Number(m[1]), m[2].length);
  assert.match(pdf, /Halaman 1 dari \d+/);
  assert.match(pdf, /\\\(uji\\\)/); // parentheses escaped
});

test('buildPdf with no rows still makes one page; characters outside Latin-1 become ?', () => {
  const pdf = new TextDecoder('latin1').decode(buildPdf('Kosong', 'tanpa baris', [['a', 'b'], ['中', 'ok']]));
  assert.match(pdf, /\/Count 1/);
  assert.match(pdf, /\(\?\)/);
});
