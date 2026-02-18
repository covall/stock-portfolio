import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value</CardTitle>
            <CardDescription>Total current value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-gray-400'>Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total P&amp;L</CardTitle>
            <CardDescription>Unrealized profit / loss</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-gray-400'>Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cash Balance</CardTitle>
            <CardDescription>Available cash across currencies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-gray-400'>Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
