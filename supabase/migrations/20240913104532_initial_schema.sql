-- Migration: initial_schema
-- Description: Creates the initial database schema for stock portfolio tracking
-- Created at: 2024-09-13T10:45:32Z

-- Enable PostgreSQL extensions
create extension if not exists "uuid-ossp";

-- Create ENUM types
create type transaction_type as enum ('buy', 'sell');
create type currency_code as enum ('USD', 'EUR', 'PLN');

-- Transactions table
create table transactions (
    id serial primary key,
    user_id uuid not null references auth.users(id),
    transaction_date timestamptz not null check (transaction_date <= current_timestamp),
    transaction_type transaction_type not null,
    stock_symbol varchar(10) not null,
    quantity numeric(15,4) not null check (quantity > 0),
    price numeric(15,4) not null check (price > 0),
    currency currency_code not null,
    created_at timestamptz not null default now()
);

-- Cash balances table
create table cash_balances (
    user_id uuid not null references auth.users(id),
    currency currency_code not null,
    balance numeric(15,4) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, currency)
);

-- Exchange rates table
create table exchange_rates (
    id serial primary key,
    base_currency varchar(3) not null,
    target_currency varchar(3) not null,
    rate numeric(15,4) not null,
    timestamp timestamptz not null,
    created_at timestamptz not null default now()
);

-- Stock prices table
create table stock_prices (
    id serial primary key,
    stock_symbol varchar(10) not null,
    price numeric(15,4) not null,
    timestamp timestamptz not null,
    created_at timestamptz not null default now()
);

-- Create indexes for performance
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_transaction_date on transactions(transaction_date);
create index idx_transactions_stock_symbol on transactions(stock_symbol);
create index idx_exchange_rates_timestamp on exchange_rates(timestamp);
create index idx_stock_prices_timestamp on stock_prices(timestamp);
create index idx_stock_prices_symbol on stock_prices(stock_symbol);

-- Disable Row Level Security (RLS) for development
alter table transactions disable row level security;
alter table cash_balances disable row level security;
alter table exchange_rates disable row level security;
alter table stock_prices disable row level security;

-- Add a trigger function to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add the trigger to cash_balances table
create trigger update_cash_balances_updated_at
before update on cash_balances
for each row
execute function update_updated_at_column();