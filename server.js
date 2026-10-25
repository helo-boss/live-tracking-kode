const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT || 3000);
const pagePath = path.join(__dirname, "live-tracking-kecil.html");

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10000) {
        reject(new Error("Request too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

async function sendTelegram(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    sendJson(response, 500, { error: "Telegram belum dikonfigurasi." });
    return;
  }

  try {
    const body = await readJson(request);
    const trackingCode = typeof body.trackingCode === "string" ? body.trackingCode.trim() : "";
    if (!trackingCode || trackingCode.length > 500) {
      sendJson(response, 400, { error: "Data formulir tidak valid." });
      return;
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Data Live Tracking baru:\n\n${trackingCode}`,
      }),
    });

    if (!telegramResponse.ok) {
      sendJson(response, 502, { error: "Pesan tidak dapat dikirim ke Telegram." });
      return;
    }

    sendJson(response, 200, { ok: true });
  } catch {
    sendJson(response, 400, { error: "Permintaan tidak valid." });
  }
}

const server = http.createServer((request, response) => {
  if (request.url === "/api/send-telegram") {
    sendTelegram(request, response);
    return;
  }

  if (request.method === "GET" && (request.url === "/" || request.url === "/live-tracking-kecil.html")) {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fs.readFileSync(pagePath));
    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Live Tracking preview listening on ${port}`);
});
