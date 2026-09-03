import * as pdfjsLib from "./node_modules/pdfjs-dist/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./node_modules/pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

const canvas = document.getElementById("menuCanvas");
const toggleButton = document.getElementById("languageToggle");
const context = canvas.getContext("2d");

const languagePages = [
  { pageNumber: 1, button: "ქართული" },
  { pageNumber: 2, button: "English" },
];

let activeIndex = 0;
let rendering = false;

const pdfDocument = await pdfjsLib.getDocument("./assets/menu.pdf").promise;

async function renderPage(index) {
  if (rendering) return;
  rendering = true;

  const { pageNumber, button } = languagePages[index];
  toggleButton.textContent = button;

  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const frameWidth = canvas.parentElement.clientWidth;
  const scale = Math.min(1.6, frameWidth / viewport.width);
  const scaledViewport = page.getViewport({ scale });

  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(scaledViewport.width * devicePixelRatio);
  canvas.height = Math.floor(scaledViewport.height * devicePixelRatio);
  canvas.style.width = `${scaledViewport.width}px`;
  canvas.style.height = `${scaledViewport.height}px`;

  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  rendering = false;
}

toggleButton.addEventListener("click", async () => {
  activeIndex = activeIndex === 0 ? 1 : 0;
  await renderPage(activeIndex);
});

window.addEventListener("resize", async () => {
  await renderPage(activeIndex);
});

await renderPage(activeIndex);
