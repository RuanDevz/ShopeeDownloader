# Guia de Setup — Shopee Video Downloader

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (apenas para Auth)
- Conta no [Mercado Pago](https://www.mercadopago.com.br/developers)

---

## 1. Supabase (Auth only)

1. Crie um novo projeto em supabase.com
2. Em **Project Settings → API**, copie:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Em **Authentication → URL Configuration**, adicione:
   - Site URL: `https://seudominio.com.br`
   - Redirect URLs: `https://seudominio.com.br/auth/callback`
4. Em **Project Settings → Database**, copie a **Connection string** (Transaction mode porta 6543 para `DATABASE_URL`)

---

## 2. Prisma — Banco de Dados

O projeto usa **Prisma ORM** para gerenciar todos os dados (subscriptions, downloads, pagamentos).

1. Preencha as variáveis no `.env`:
```
DATABASE_URL=postgresql://postgres:[SENHA]@db.[REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres
```

2. Rode a migration para criar as tabelas:
```bash
npx prisma migrate dev --name init
```

3. (Opcional) Visualize o banco:
```bash
npx prisma studio
```

> **Em produção**: use `npx prisma migrate deploy` no CI/CD.

---

## 3. Mercado Pago PIX

1. Acesse: mercadopago.com.br/developers/pt/docs
2. Crie um app e obtenha o **Access Token de produção** (começa com `APP_USR-`)
3. Configure o webhook:
   - URL: `https://seudominio.com.br/api/webhook`
   - Eventos: `payment`
   - Copie o **secret** gerado para `MP_WEBHOOK_SECRET`

> Em desenvolvimento, use o Access Token de **teste** (`TEST-...`) e simule pagamentos no painel MP.

---

## 3. Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
MP_ACCESS_TOKEN=APP_USR-xxxxx
MP_WEBHOOK_SECRET=seu-secret
NEXT_PUBLIC_APP_URL=https://seudominio.com.br
```

---

## 4. Instalar e Rodar

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # produção
npm start
```

---

## 5. Deploy (Vercel recomendado)

1. Push para GitHub
2. Conecte no Vercel
3. Adicione todas as env vars no painel
4. Deploy automático

---

## Segurança

| Proteção | Implementação |
|---|---|
| Autenticação | Supabase Auth em todas as rotas |
| SSRF | Blocklist de IPs internos |
| Rate limit | 10 req/min por IP |
| Validação | Zod — somente URLs Shopee |
| Proxy CDN | Vídeos proxiados — CDN nunca exposto |
| Webhook | Assinatura HMAC-SHA256 MP |
| RLS | Row Level Security no Supabase |
| Limites | 5 downloads/dia (free) |
