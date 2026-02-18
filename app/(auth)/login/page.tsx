import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect('/login?error=' + encodeURIComponent(error.message));
    }

    redirect('/');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700'>
              {decodeURIComponent(error)}
            </div>
          )}
          <form action={login} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' name='email' type='email' placeholder='you@example.com' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' name='password' type='password' required />
            </div>
            <Button type='submit' className='w-full'>
              Sign in
            </Button>
          </form>
          <p className='mt-4 text-center text-sm text-gray-600'>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='font-medium text-blue-600 hover:underline'>
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
