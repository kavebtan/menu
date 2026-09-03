import * as pdfjsLib from "./node_modules/pdfjs-dist/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./node_modules/pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

const canvas = document.getElementById("menuCanvas");
const toggleButton = document.getElementById("languageToggle");
const pageLabel = document.getElementById("pageLabel");
const loadingState = document.getElementById("loadingState");
const context = canvas.getContext("2d");

const languagePages = [
  { pageNumber: 1, label: "English menu", button: "ქართული" },
  { pageNumber: 2, label: "ქართული მენიუ", button: "English" },
];

let activeIndex = 0;
let rendering = false;

const pdfDocument = await pdfjsLib.getDocument("./assets/menu.pdf").promise;

async function renderPage(index) {
  if (rendering) return;
  rendering = true;

  const { pageNumber, label, button } = languagePages[index];
  pageLabel.textContent = label;
  toggleButton.textContent = button;
  loadingState.classList.remove("hidden");
  canvas.classList.remove("ready");

  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const frameWidth = canvas.parentElement.clientWidth;
  const scale = frameWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(scaledViewport.width * devicePixelRatio);
  canvas.height = Math.floor(scaledViewport.height * devicePixelRatio);
  canvas.style.width = `${scaledViewport.width}px`;
  canvas.style.height = `${scaledViewport.height}px`;

  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  loadingState.classList.add("hidden");
  canvas.classList.add("ready");
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
