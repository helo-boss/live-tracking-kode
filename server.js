const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT || 3000);
const page = fs.readFileSync(path.join(__dirname, "live-tracking-kecil.html"));

const server = http.createServer((request, response) => {
  if (request.method === "GET" && (request.url === "/" || request.url === "/live-tracking-kecil.html")) {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(page);
    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Live Tracking preview listening on ${port}`);
});
