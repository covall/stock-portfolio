import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionForm from '@/components/transaction-form';
import { createClient } from '@/utils/supabase/server';
import { updateTransaction } from '../../actions';

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (!transaction) {
    notFound();
  }

  const updateWithId = updateTransaction.bind(null, transaction.id);

  return (
    <div className='container mx-auto py-8 px-4 max-w-lg'>
      <div className='mb-4'>
        <Link href='/transactions' className='text-sm text-gray-500 hover:text-gray-700'>
          ← Back to Transactions
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            action={updateWithId}
            defaultValues={{
              transaction_type: transaction.transaction_type,
              stock_symbol: transaction.stock_symbol,
              transaction_date: transaction.transaction_date.split('T')[0],
              quantity: transaction.quantity,
              price: transaction.price,
              currency: transaction.currency,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
