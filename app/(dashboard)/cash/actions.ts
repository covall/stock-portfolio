'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function upsertCashBalance(
  currency: 'USD' | 'EUR' | 'PLN',
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const balance = parseFloat(formData.get('balance') as string);

  const { error } = await supabase
    .from('cash_balances')
    .upsert({ user_id: user.id, currency, balance }, { onConflict: 'user_id,currency' });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/cash');
}
