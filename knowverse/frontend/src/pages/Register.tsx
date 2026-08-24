import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Network } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { toast } from '@/components/ui/Toaster';
import { Spinner } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required')
    .regex(/[^A-Za-z0-9]/, 'One special character required'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate: doRegister, isPending: isLoading } = useMutation({
    mutationFn: (d: Omit<FormData, 'confirmPassword'>) => authApi.register(d),
    onSuccess: () => {
      toast({ title: 'Account created!', description: 'You can now sign in.', variant: 'success' });
      navigate('/login');
    },
    onError: (err: Error) => toast({ title: 'Registration failed', description: err.message, variant: 'destructive' }),
  });

  const onSubmit = ({ name, email, password }: FormData) => doRegister({ name, email, password });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <Network className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground mt-1">Start exploring knowledge</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name' as const, label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••' },
              { name: 'confirmPassword' as const, label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                <input
                  {...register(f.name)}
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors[f.name] && <p className="text-destructive text-xs mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {isLoading ? <><Spinner className="w-4 h-4" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
