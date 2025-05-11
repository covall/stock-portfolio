import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TransactionsPage() {
  const supabase = await createClient();

  // Fetch all transactions
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
        <Link
          href='/'
          className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
        >
          Back to Dashboard
        </Link>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='bg-gray-50 rounded-lg p-8 text-center text-gray-500'>
          No transactions found
        </div>
      )}
    </div>
  );
}
