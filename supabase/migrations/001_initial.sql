-- =============================================
-- Shopee Video Downloader — Schema inicial
-- =============================================

-- Extensão para UUID
create extension if not exists "pgcrypto";

-- =============================================
-- subscriptions
-- =============================================
create table if not exists subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan        text not null default 'free' check (plan in ('free', 'premium')),
  premium_until timestamptz,
  mp_payment_id text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

-- =============================================
-- usage_logs
-- =============================================
create table if not exists usage_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  date           date not null default current_date,
  download_count integer not null default 0,
  created_at     timestamptz not null default now(),
  unique (user_id, date)
);

-- =============================================
-- download_history
-- =============================================
create table if not exists download_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  original_url text not null,
  video_url    text not null,
  cover        text,
  caption      text,
  created_at   timestamptz not null default now()
);

-- =============================================
-- payments
-- =============================================
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  mp_payment_id text not null unique,
  status        text not null default 'pending',
  amount        numeric(10,2) not null,
  created_at    timestamptz not null default now()
);

-- =============================================
-- Índices de performance
-- =============================================
create index if not exists idx_usage_logs_user_date      on usage_logs(user_id, date);
create index if not exists idx_download_history_user     on download_history(user_id, created_at desc);
create index if not exists idx_subscriptions_user        on subscriptions(user_id);
create index if not exists idx_payments_user             on payments(user_id);
create index if not exists idx_payments_mp_id            on payments(mp_payment_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table subscriptions     enable row level security;
alter table usage_logs        enable row level security;
alter table download_history  enable row level security;
alter table payments          enable row level security;

-- Policies: cada usuário só acessa seus próprios dados
create policy "subscriptions: own"     on subscriptions    for all using (auth.uid() = user_id);
create policy "usage_logs: own"        on usage_logs       for all using (auth.uid() = user_id);
create policy "download_history: own"  on download_history for all using (auth.uid() = user_id);
create policy "payments: own"          on payments         for all using (auth.uid() = user_id);

-- Service role bypass (para webhooks server-side)
-- O service role ignora RLS por padrão no Supabase.

-- =============================================
-- Trigger: inserir subscription free no signup
-- =============================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
