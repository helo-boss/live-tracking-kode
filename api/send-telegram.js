export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return response.status(500).json({ error: "Telegram belum dikonfigurasi." });
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const trackingCode = typeof body?.trackingCode === "string" ? body.trackingCode.trim() : "";

    if (!trackingCode || trackingCode.length > 500) {
      return response.status(400).json({ error: "Data formulir tidak valid." });
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
      return response.status(502).json({ error: "Pesan tidak dapat dikirim ke Telegram." });
    }

    return response.status(200).json({ ok: true });
  } catch (_) {
    return response.status(400).json({ error: "Permintaan tidak valid." });
  }
}
