import { readFile, writeFile } from 'node:fs/promises';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  './node_modules/pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const pdfData = new Uint8Array(await readFile(new URL('./assets/menu.pdf', import.meta.url)));
const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;

for (let pageNumber = 1; pageNumber <= 2; pageNumber += 1) {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const pngBuffer = canvas.toBuffer('image/png');
  await writeFile(new URL(`./assets/menu-page-${pageNumber}.png`, import.meta.url), pngBuffer);
  console.log(`Saved menu-page-${pageNumber}.png`);
}
