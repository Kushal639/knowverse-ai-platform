import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Network, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toaster';
import { Spinner } from '@/components/ui';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.success) {
        setAuth(data.data.user, data.data.token);
        toast({ title: 'Welcome back!', variant: 'success', description: `Hello, ${data.data.user.name}` });
        navigate('/dashboard');
      }
    },
    onError: (err: Error) => {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <Network className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Sign in to KnowVerse</h1>
          <p className="text-muted-foreground mt-1">Welcome back</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(d => login(d))} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? <><Spinner className="w-4 h-4" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">🧪 Demo credentials:</p>
            <p>User: <code>demo@knowverse.dev</code> / <code>Demo@1234</code></p>
            <p>Admin: <code>admin@knowverse.dev</code> / <code>Admin@1234</code></p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
