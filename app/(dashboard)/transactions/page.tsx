import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from './actions';

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Transactions</h1>
        <Button asChild>
          <Link href='/transactions/new'>Add Transaction</Link>
        </Button>
      </div>

      {error ? (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          Failed to load transactions
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white rounded-lg overflow-hidden'>
            <thead className='bg-gray-100 text-gray-800'>
              <tr>
                <th className='text-left py-3 px-4 font-semibold'>Date</th>
                <th className='text-left py-3 px-4 font-semibold'>Symbol</th>
                <th className='text-left py-3 px-4 font-semibold'>Type</th>
                <th className='text-right py-3 px-4 font-semibold'>Quantity</th>
                <th className='text-right py-3 px-4 font-semibold'>Price</th>
                <th className='text-right py-3 px-4 font-semibold'>Total</th>
                <th className='text-left py-3 px-4 font-semibold'>Currency</th>
                <th className='py-3 px-4'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {transactions.map((transaction) => {
                const total = transaction.price * transaction.quantity;

                return (
                  <tr key={transaction.id} className='hover:bg-gray-50'>
                    <td className='py-3 px-4'>
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className='py-3 px-4 font-medium'>{transaction.stock_symbol}</td>
                    <td className='py-3 px-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.transaction_type === 'buy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-right'>{transaction.quantity}</td>
                    <td className='py-3 px-4 text-right'>{transaction.price.toFixed(2)}</td>
                    <td className='py-3 px-4 text-right font-medium'>{total.toFixed(2)}</td>
                    <td className='py-3 px-4'>{transaction.currency}</td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center gap-2 justify-end'>
                        <Button asChild variant='outline' size='sm'>
                          <Link href={`/transactions/${transaction.id}/edit`}>Edit</Link>
                        </Button>
                        <form action={deleteTransaction.bind(null, transaction.id)}>
                          <Button
                            type='submit'
                            variant='outline'
                            size='sm'
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='bg-gray-50 rounded-lg p-8 text-center'>
          <p className='text-gray-500 mb-4'>No transactions found</p>
          <Button asChild>
            <Link href='/transactions/new'>Add your first transaction</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
