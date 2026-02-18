import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { upsertCashBalance } from './actions';

const CURRENCIES = ['USD', 'EUR', 'PLN'] as const;
type Currency = (typeof CURRENCIES)[number];

export default async function CashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: rows } = await supabase
    .from('cash_balances')
    .select('currency, balance')
    .eq('user_id', user.id);

  const balances: Record<Currency, number> = { USD: 0, EUR: 0, PLN: 0 };
  for (const row of rows ?? []) {
    if (row.currency in balances) {
      balances[row.currency as Currency] = Number(row.balance);
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Cash Balances</h1>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {CURRENCIES.map((currency) => (
          <Card key={currency}>
            <CardHeader>
              <CardTitle>{currency}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={upsertCashBalance.bind(null, currency)}>
                <div className='flex flex-col gap-3'>
                  <Input
                    type='number'
                    name='balance'
                    step='0.01'
                    min='0'
                    defaultValue={balances[currency].toFixed(2)}
                    required
                  />
                  <Button type='submit'>Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
