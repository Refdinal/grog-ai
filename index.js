const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const { askGroq } = require("./groqClient");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const app = express();

const sessions = {}; // <== simpan semua history berdasarkan user

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMsg = msg.text;

  if (!sessions[chatId]) {
    sessions[chatId] = []; // buat session baru kalau belum ada
  }

  // Tambahkan pesan user ke history
  sessions[chatId].push({ role: "user", content: userMsg });

  bot.sendMessage(chatId, "Sedang berpikir... 🧠");

  // Kirim semua riwayat chat ke Groq
  const aiReply = await askGroq(sessions[chatId]);

  // Tambahkan balasan AI ke history
  sessions[chatId].push({ role: "assistant", content: aiReply });

  bot.sendMessage(chatId, aiReply);
});

app.get("/", (req, res) => {
  res.send("Bot Telegram AI dengan context aktif.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready di http://localhost:${PORT}`));
