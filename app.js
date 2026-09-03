import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

const canvas = document.getElementById("menuCanvas");
const stage = document.getElementById("menuStage");
const toggleButton = document.getElementById("languageToggle");
const context = canvas.getContext("2d");

const languagePages = [
  { pageNumber: 1, label: "English menu", button: "ქართული" },
  { pageNumber: 2, label: "ქართული მენიუ", button: "English" },
];

let activeIndex = 0;
let rendering = false;
let pdfDocument = null;

async function loadPdf() {
  pdfDocument = await pdfjsLib.getDocument("./assets/menu.pdf").promise;
}

async function renderPage(index) {
  if (!pdfDocument || rendering) return;
  rendering = true;

  try {
    const { pageNumber, label, button } = languagePages[index];
    canvas.setAttribute("aria-label", label);
    toggleButton.textContent = button;

    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const frameWidth = stage.clientWidth || window.innerWidth;
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
  } finally {
    rendering = false;
  }
}

toggleButton.addEventListener("click", async () => {
  activeIndex = activeIndex === 0 ? 1 : 0;
  await renderPage(activeIndex);
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderPage(activeIndex);
  }, 150);
});

try {
  await loadPdf();
  await renderPage(activeIndex);
} catch (error) {
  console.error("Failed to load menu:", error);
  stage.innerHTML = "<p class=\"menu-error\">Menu failed to load. Please refresh.</p>";
}
