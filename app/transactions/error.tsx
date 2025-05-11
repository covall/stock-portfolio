'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function TransactionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Transactions page error:', error);
  }, [error]);

  return (
    <div className='container mx-auto py-20 px-4 text-center'>
      <h1 className='text-2xl font-bold text-red-600 mb-4'>Something went wrong!</h1>
      <p className='text-gray-600 mb-8'>There was an error loading the transactions.</p>
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <button
          onClick={reset}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          Try again
        </button>
        <Link
          href='/'
          className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
