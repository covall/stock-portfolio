import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  async function register(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      redirect('/register?error=' + encodeURIComponent(error.message));
    }

    redirect('/register?message=' + encodeURIComponent('Check your email to confirm your account'));
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Create account</CardTitle>
          <CardDescription>Sign up to start tracking your stock portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700'>
              {decodeURIComponent(error)}
            </div>
          )}
          {message && (
            <div className='mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700'>
              {decodeURIComponent(message)}
            </div>
          )}
          <form action={register} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' name='email' type='email' placeholder='you@example.com' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' name='password' type='password' minLength={6} required />
            </div>
            <Button type='submit' className='w-full'>
              Create account
            </Button>
          </form>
          <p className='mt-4 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <Link href='/login' className='font-medium text-blue-600 hover:underline'>
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
