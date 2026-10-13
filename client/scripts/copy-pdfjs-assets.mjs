import { cpSync, existsSync, mkdirSync } from 'node:fs';

const source = new URL('../node_modules/pdfjs-dist/', import.meta.url);
const target = new URL('../public/pdfjs/', import.meta.url);
mkdirSync(target, { recursive: true });

for (const dir of ['standard_fonts', 'cmaps']) {
  const from = new URL(`${dir}/`, source);
  if (!existsSync(from)) {
    console.warn(`[pdfjs] pdfjs-dist/${dir} not found, skipping`);
    continue;
  }
  cpSync(from, new URL(`${dir}/`, target), { recursive: true });
}