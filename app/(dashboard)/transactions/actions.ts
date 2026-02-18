'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import type { TransactionFormValues } from '@/lib/validations/transaction';

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return { supabase, user };
}

export async function createTransaction(values: TransactionFormValues) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase.from('transactions').insert({
    ...values,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect('/transactions');
}

export async function updateTransaction(id: number, values: TransactionFormValues) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from('transactions')
    .update(values)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect('/transactions');
}

export async function deleteTransaction(id: number) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/transactions');
}
