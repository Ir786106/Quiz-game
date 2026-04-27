const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 4173);
const root = process.cwd();
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

http.createServer((request, response) => {
  let requestPath = decodeURIComponent(request.url.split("?")[0]);

  if (requestPath === "/" || requestPath === "") {
    requestPath = "/index.html";
  }

  const filePath = path.normalize(path.join(root, requestPath));

  if (!filePath.toLowerCase().startsWith(root.toLowerCase())) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }

        response.setHeader("Content-Type", types[".html"]);
        response.end(fallback);
      });
      return;
    }

    response.setHeader("Content-Type", types[path.extname(filePath)] || "application/octet-stream");
    response.end(content);
  });
}).listen(port, "127.0.0.1");

