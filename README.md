# Sakura Land V3

نسخة v3 احترافية كأساس إنتاجي، مبنية لتغطي:
- Telegram Bot
- Salla OAuth + API
- PostgreSQL + Prisma
- Redis anti-spam / rate limit
- Steam Guard generation via shared secret
- Order binding to first user
- Daily usage limit
- Admin commands
- Admin web panel
- Reviews
- Security logs
- Generation logs
- Salla webhook endpoint

## الخطوات
1. انسخ `.env.example` إلى `.env`
2. انسخ `config/app.config.example.json` إلى `config/app.config.json`
3. انسخ `config/steamAccounts.example.json` إلى `config/steamAccounts.json`
4. ضع بياناتك الحقيقية
5. نفذ:
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm start

## Render
Build Command:
`npm install && npx prisma generate && npx prisma migrate deploy`

Start Command:
`node src/server.js`
