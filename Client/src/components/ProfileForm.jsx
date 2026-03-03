import { useForm } from 'react-hook-form'
import CTAButton from './CTAButton'

export default function ProfileForm() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: 'SME Solutions',
      email: 'owner@sme.co.ke',
      phone: '+254712345678',
    }
  })

  const onSubmit = (data) => {
    console.log('Profile updated:', data)
    alert('Profile saved (demo)')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-textSecondary">Business Name</label>
        <input {...register('name')} className="w-full bg-primary p-2 rounded" />
      </div>
      <div>
        <label className="block text-textSecondary">Email</label>
        <input type="email" {...register('email')} className="w-full bg-primary p-2 rounded" />
      </div>
      <div>
        <label className="block text-textSecondary">Phone</label>
        <input {...register('phone')} className="w-full bg-primary p-2 rounded" />
      </div>
      <CTAButton type="submit">Save Changes</CTAButton>
    </form>
  )
}