import { useAuthStore } from '@/store/authStore';
import { User, Mail, Shield, Calendar, Database } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate, getInitials } from '@/lib/utils';

export default function Profile() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Profile</h1><p className="text-muted-foreground">Your account information</p></div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="mt-1">{user.role}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: User, label: 'Full Name', value: user.name },
            { icon: Mail, label: 'Email', value: user.email },
            { icon: Shield, label: 'Role', value: user.role },
            { icon: Calendar, label: 'Member Since', value: formatDate(user.createdAt) },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <item.icon className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
