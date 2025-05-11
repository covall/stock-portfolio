export default function TransactionsLoading() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='flex justify-between items-center mb-6'>
        <div className='h-8 w-48 bg-gray-200 rounded animate-pulse'></div>
        <div className='h-10 w-32 bg-gray-200 rounded animate-pulse'></div>
      </div>

      <div className='overflow-x-auto'>
        <div className='min-w-full bg-white rounded-lg overflow-hidden'>
          <div className='bg-gray-100 py-3 px-4'>
            <div className='grid grid-cols-7 gap-4'>
              {[...Array(7)].map((_, index) => (
                <div key={index} className='h-6 bg-gray-200 rounded animate-pulse'></div>
              ))}
            </div>
          </div>

          <div className='divide-y divide-gray-200'>
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className='py-3 px-4'>
                <div className='grid grid-cols-7 gap-4'>
                  {[...Array(7)].map((_, colIndex) => (
                    <div key={colIndex} className='h-6 bg-gray-200 rounded animate-pulse'></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
