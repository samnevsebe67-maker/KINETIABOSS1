// Vercel Serverless Function: POST /api/lead  (Frontend -> API -> Telegram Bot API)
const hits = new Map(); // базовый rate-limit (на инстанс)
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const clip = (s, n) => String(s ?? '').trim().slice(0, n);
const OK_SERVICES = ['Разработка сайта','CRM','Автоматизация','Лидогенерация','Реклама и трафик','Комплексное продвижение','Пока не знаю, нужна консультация'];
const OK_BUDGET = ['До $500','$500–1000','$1000–3000','$3000+','Пока не определился'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(500).json({ ok: false, error: 'config' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 600000);
  if (recent.length >= 3) return res.status(429).json({ ok: false, error: 'rate' });
  hits.set(ip, [...recent, now]);

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.website_hp) return res.status(200).json({ ok: true }); // honeypot: тихо игнорируем ботов
  const d = {
    name: clip(b.name, 100), company: clip(b.company, 150), contact: clip(b.contact, 120),
    site: clip(b.site, 200), message: clip(b.message, 2000),
    services: (Array.isArray(b.services) ? b.services : []).filter(s => OK_SERVICES.includes(s)),
    budget: OK_BUDGET.includes(b.budget) ? b.budget : ''
  };
  if (d.name.length < 2 || d.contact.length < 3) return res.status(400).json({ ok: false, error: 'validation' });

  const text = `🚀 <b>НОВАЯ ЗАЯВКА — KINETIA</b>\n\n👤 Имя: ${esc(d.name)}\n\n🏢 Компания: ${esc(d.company || '—')}\n\n📞 Контакт: ${esc(d.contact)}\n\n🌐 Сайт: ${esc(d.site || '—')}\n\n🎯 Интересующие услуги:\n${esc(d.services.join(', ') || '—')}\n\n💰 Бюджет: ${esc(d.budget || '—')}\n\n📝 Описание задачи:\n${esc(d.message || '—')}\n\n━━━━━━━━━━━━━━\n\nИсточник: Сайт KINETIA`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    const j = await r.json();
    if (!j.ok) { console.error('Telegram error', j.description); return res.status(502).json({ ok: false }); }
    return res.status(200).json({ ok: true });
  } catch (e) { console.error(e); return res.status(502).json({ ok: false }); }
}
