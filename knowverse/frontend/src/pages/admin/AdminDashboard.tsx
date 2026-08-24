import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Database, Network, GitBranch, Clock, MessageSquare, ArrowRight, Shield } from 'lucide-react';
import { adminApi } from '@/api/index';
import { StatCard, Skeleton } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.getStats });
  const stats = data?.data;

  const quickLinks = [
    { icon: Users, label: 'Manage Users', to: '/admin/users', desc: 'User accounts and roles' },
    { icon: GitBranch, label: 'Graph Admin', to: '/admin/graph', desc: 'Merge, rename, manage entities' },
    { icon: MessageSquare, label: 'Feedback', to: '/admin/feedback', desc: 'Review user feedback' },
    { icon: Shield, label: 'Audit Logs', to: '/admin/audit-logs', desc: 'Security activity logs' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Users" value={stats?.users || 0} icon={Users} iconColor="text-blue-400" />
          <StatCard title="Active Users" value={stats?.activeUsers || 0} icon={Users} iconColor="text-green-400" />
          <StatCard title="Datasets" value={stats?.datasets || 0} icon={Database} iconColor="text-purple-400" />
          <StatCard title="Entities" value={stats?.entities || 0} icon={Network} iconColor="text-orange-400" />
          <StatCard title="Pending Extractions" value={stats?.pendingTriples || 0} icon={Clock} iconColor="text-yellow-400" />
          <StatCard title="Open Feedback" value={stats?.openFeedback || 0} icon={MessageSquare} iconColor="text-cyan-400" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} className="glass-card p-5 hover:border-primary/30 transition-colors group">
            <l.icon className="w-8 h-8 text-primary mb-3" />
            <p className="font-semibold">{l.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
            <ArrowRight className="w-4 h-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {stats.recentActivity.map((log: { id: string; action: string; user?: { name: string }; createdAt: string }) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</span>
                  {log.user && <span className="text-xs text-muted-foreground">by {log.user.name}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
