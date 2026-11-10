# KINETIA — сайт

Структура: `index.html` (сайт целиком), `site.config.js` (контакты), `api/lead.js` (серверная отправка в Telegram), `.env.example`.

## Подключение Telegram
1. В Telegram откройте @BotFather → `/newbot` → получите токен.
2. Напишите своему боту любое сообщение. Откройте `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `chat.id` — это CHAT_ID.
3. Задеплойте папку на Vercel (`vercel` или импорт из Git). В Settings → Environment Variables добавьте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`. Токен хранится только на сервере.
4. Перезапустите деплой и отправьте тестовую заявку.

Локально: `npm i -g vercel`, скопируйте `.env.example` в `.env`, запустите `vercel dev`.
