'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

export default function Navbar({ user }: { user: User }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className='border-b bg-white'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='text-lg font-semibold'>
            Stock Portfolio
          </Link>
          <nav className='flex items-center gap-4 text-sm'>
            <Link href='/' className='text-gray-600 hover:text-gray-900 transition-colors'>
              Dashboard
            </Link>
            <Link
              href='/transactions'
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              Transactions
            </Link>
            <Link href='/cash' className='text-gray-600 hover:text-gray-900 transition-colors'>
              Cash
            </Link>
          </nav>
        </div>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray-600'>{user.email}</span>
          <Button variant='outline' size='sm' onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
