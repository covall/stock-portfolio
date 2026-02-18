import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionForm from '@/components/transaction-form';
import { createTransaction } from '../actions';

export default function NewTransactionPage() {
  return (
    <div className='container mx-auto py-8 px-4 max-w-lg'>
      <div className='mb-4'>
        <Link href='/transactions' className='text-sm text-gray-500 hover:text-gray-700'>
          ← Back to Transactions
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm action={createTransaction} />
        </CardContent>
      </Card>
    </div>
  );
}
