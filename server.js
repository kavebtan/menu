import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = 3000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".pdf": "application/pdf",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  if (!existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  try {
    const fileStats = await stat(filePath);

    if (fileStats.isDirectory()) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "Content-Length": fileStats.size,
      "Cache-Control": "no-store",
    });

    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
}).listen(port, () => {
  console.log(`Menu site running at http://localhost:${port}`);
});
