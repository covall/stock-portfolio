import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions | Stock Portfolio',
  description: 'View and manage your stock transactions',
};

export default function TransactionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className='min-h-screen bg-gray-50'>{children}</div>;
}
