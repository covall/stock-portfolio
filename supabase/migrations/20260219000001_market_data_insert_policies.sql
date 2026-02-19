-- Allow authenticated users to insert market data (exchange rates & stock prices)
-- These tables are shared/service data with no user_id column.
-- The initial enable_rls migration defined only SELECT policies, blocking all inserts.

CREATE POLICY "exchange_rates_insert" ON exchange_rates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "stock_prices_insert" ON stock_prices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
