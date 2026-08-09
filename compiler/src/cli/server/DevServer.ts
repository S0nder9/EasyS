import http from "http";
import fs from "fs";
import path from "path";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export function startServer(distDir: string, port = 3000) {
  const server = http.createServer((req, res) => {
    const urlPath = (req.url || "/").split("?")[0];

    let relative =
      urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");

    let full = path.join(distDir, relative);

    // SPA fallback for client routes
    if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      full = path.join(distDir, "index.html");
    }

    if (!fs.existsSync(full)) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const ext = path.extname(full);
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.end(fs.readFileSync(full));
  });

  server.listen(port, () => {
    console.log(`EasyS running at http://localhost:${port}`);
  });

  return server;
}
