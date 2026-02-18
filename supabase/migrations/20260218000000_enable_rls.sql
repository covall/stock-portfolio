-- Enable RLS on all tables

-- transactions (user-owned)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- cash_balances (user-owned)
ALTER TABLE cash_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_balances_select" ON cash_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cash_balances_insert" ON cash_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cash_balances_update" ON cash_balances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cash_balances_delete" ON cash_balances
  FOR DELETE USING (auth.uid() = user_id);

-- exchange_rates (shared/service data — authenticated read-only)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exchange_rates_select" ON exchange_rates
  FOR SELECT USING (auth.role() = 'authenticated');

-- stock_prices (shared/service data — authenticated read-only)
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_prices_select" ON stock_prices
  FOR SELECT USING (auth.role() = 'authenticated');
