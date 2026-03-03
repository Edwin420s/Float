import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PAYMENT_METHODS } from '../utils/constants'
import CTAButton from './CTAButton'

const schema = z.object({
  to: z.string().min(1, 'Recipient is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.string().min(1),
})

export default function PaymentForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">New Payment</h2>
      <div>
        <label className="block text-textSecondary mb-1">To</label>
        <input {...register('to')} className="w-full bg-primary p-2 rounded" />
        {errors.to && <p className="text-error text-sm">{errors.to.message}</p>}
      </div>
      <div>
        <label className="block text-textSecondary mb-1">Amount (USD)</label>
        <input type="number" {...register('amount', { valueAsNumber: true })} className="w-full bg-primary p-2 rounded" />
        {errors.amount && <p className="text-error text-sm">{errors.amount.message}</p>}
      </div>
      <div>
        <label className="block text-textSecondary mb-1">Payment Method</label>
        <select {...register('method')} className="w-full bg-primary p-2 rounded">
          {PAYMENT_METHODS.map(m => (
            <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
          ))}
        </select>
      </div>
      <CTAButton type="submit">Pay Now</CTAButton>
    </form>
  )
}