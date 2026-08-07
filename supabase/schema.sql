-- Run this once in Supabase's SQL editor (Project -> SQL Editor -> New query).
--
-- Design notes:
-- * spins_earned / spins_used / pending balances are never stored as
--   mutable counters -- they're always derived (COUNT/SUM) from two
--   append-only ledger tables. That removes an entire class of
--   "counter drifted out of sync" bugs.
-- * claimed_transactions.tx_hash is a primary key, so claiming the same
--   on-chain transaction twice (from two browsers, two devices, whatever)
--   is impossible at the database level -- first successful insert wins.
-- * All writes go through the RPC functions below rather than raw
--   table INSERT/UPDATE from the client. record_spin() takes an
--   advisory lock per-address so two rapid clicks (or two tabs) can't
--   both spend the same spin credit.
--
-- KNOWN GAP: these functions trust the `p_address` argument as given.
-- The Next.js app only calls them after the user enters a private key
-- client-side, but that check lives in the browser, not the database --
-- someone calling the Supabase REST API directly, bypassing the app,
-- isn't stopped by anything here. Closing that fully needs a signature
-- challenge verified server-side (e.g. in a Supabase Edge Function)
-- before these RPCs run. Not implemented yet -- ask if you want it built.

create extension if not exists pgcrypto;

create table if not exists airdrop_accounts (
  address text primary key,
  withdraw_evm_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists claimed_transactions (
  tx_hash text primary key,
  address text not null references airdrop_accounts(address),
  amount numeric not null,
  block_index bigint,
  claimed_at timestamptz not null default now()
);
create index if not exists claimed_transactions_address_idx
  on claimed_transactions(address);

create table if not exists spin_history (
  id uuid primary key default gen_random_uuid(),
  address text not null references airdrop_accounts(address),
  tier_id text not null,
  label text not null,
  amount numeric,
  token text,
  created_at timestamptz not null default now()
);
create index if not exists spin_history_address_idx
  on spin_history(address);

alter table airdrop_accounts enable row level security;
alter table claimed_transactions enable row level security;
alter table spin_history enable row level security;

-- Reads are open: qualifying-tx history is public on-chain data anyway,
-- and spin/reward history isn't sensitive. Writes only happen through
-- the RPC functions (marked security definer below), never via raw
-- table INSERT/UPDATE, so no direct-write policies are granted here.
create policy "public read: accounts" on airdrop_accounts
  for select using (true);
create policy "public read: claimed_transactions" on claimed_transactions
  for select using (true);
create policy "public read: spin_history" on spin_history
  for select using (true);

-- Ensures an airdrop_accounts row exists for an address, no-op otherwise.
create or replace function ensure_account(p_address text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into airdrop_accounts (address)
  values (lower(p_address))
  on conflict (address) do nothing;
end;
$$;

-- Claims a confirmed qualifying transaction as a spin credit. Returns
-- true if this call is the one that actually claimed it (i.e. a new
-- spin was earned), false if it was already claimed before.
create or replace function claim_reward_tx(
  p_address text,
  p_tx_hash text,
  p_amount numeric,
  p_block_index bigint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted boolean;
begin
  perform ensure_account(p_address);

  insert into claimed_transactions (tx_hash, address, amount, block_index)
  values (p_tx_hash, lower(p_address), p_amount, p_block_index)
  on conflict (tx_hash) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted > 0;
end;
$$;

-- Spends one spin credit and records the outcome, atomically per address
-- (the advisory lock serializes concurrent calls for the same address so
-- two simultaneous spins can't both succeed on the last available credit).
create or replace function record_spin(
  p_address text,
  p_tier_id text,
  p_label text,
  p_amount numeric,
  p_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_earned integer;
  v_used integer;
begin
  perform pg_advisory_xact_lock(hashtext(lower(p_address)));
  perform ensure_account(p_address);

  select count(*) into v_earned from claimed_transactions where address = lower(p_address);
  select count(*) into v_used from spin_history where address = lower(p_address);

  if v_used >= v_earned then
    return false;
  end if;

  insert into spin_history (address, tier_id, label, amount, token)
  values (lower(p_address), p_tier_id, p_label, p_amount, p_token);

  return true;
end;
$$;

create or replace function set_withdraw_method(
  p_address text,
  p_evm_address text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform ensure_account(p_address);
  update airdrop_accounts
  set withdraw_evm_address = p_evm_address, updated_at = now()
  where address = lower(p_address);
end;
$$;
