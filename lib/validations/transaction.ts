import { z } from 'zod';

export const transactionSchema = z.object({
  transaction_type: z.enum(['buy', 'sell']),
  stock_symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or fewer')
    .transform((v) => v.toUpperCase()),
  transaction_date: z
    .string()
    .min(1, 'Date is required')
    .refine((d) => new Date(d) <= new Date(), 'Date cannot be in the future'),
  quantity: z.number({ message: 'Quantity must be a valid number' }).positive('Quantity must be greater than 0'),
  price: z.number({ message: 'Price must be a valid number' }).positive('Price must be greater than 0'),
  currency: z.enum(['USD', 'EUR', 'PLN']),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
