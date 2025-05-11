-- Migration: initial_schema_down
-- Description: Removes the initial database schema for stock portfolio tracking
-- Created at: 2024-09-13T10:45:33Z

-- Drop triggers
drop trigger if exists update_cash_balances_updated_at on cash_balances;

-- Drop functions
drop function if exists update_updated_at_column();

-- Drop RLS policies for transactions table
drop policy if exists "Users can view their own transactions" on transactions;
drop policy if exists "Users can insert their own transactions" on transactions;
drop policy if exists "Users can update their own transactions" on transactions;
drop policy if exists "Users can delete their own transactions" on transactions;

-- Drop RLS policies for cash_balances table
drop policy if exists "Users can view their own cash balances" on cash_balances;
drop policy if exists "Users can insert their own cash balances" on cash_balances;
drop policy if exists "Users can update their own cash balances" on cash_balances;

-- Drop RLS policies for exchange_rates table
drop policy if exists "Public read access to exchange rates" on exchange_rates;

-- Drop RLS policies for stock_prices table
drop policy if exists "Public read access to stock prices" on stock_prices;

-- Drop indexes
drop index if exists idx_transactions_user_id;
drop index if exists idx_transactions_transaction_date;
drop index if exists idx_transactions_stock_symbol;
drop index if exists idx_exchange_rates_timestamp;
drop index if exists idx_stock_prices_timestamp;
drop index if exists idx_stock_prices_symbol;

-- Drop tables (in correct order to avoid foreign key constraints)
drop table if exists transactions;
drop table if exists cash_balances;
drop table if exists exchange_rates;
drop table if exists stock_prices;

-- Drop custom types
drop type if exists transaction_type;
drop type if exists currency_code;