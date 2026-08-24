import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Database, FileText, Network, GitBranch, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import { graphApi } from '@/api/graph.api';
import { adminApi } from '@/api/index';
import { StatCard, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['graph', 'stats'],
    queryFn: graphApi.getStats,
  });

  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
    enabled: isAdmin,
  });

  const stats = statsData?.data;
  const adminStats = adminData?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your knowledge universe</p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Entities" value={stats?.totalEntities || 0} icon={Network} iconColor="text-purple-400" />
          <StatCard title="Relations" value={stats?.totalRelations || 0} icon={GitBranch} iconColor="text-blue-400" />
          <StatCard title="Approved Triples" value={stats?.approvedTriples || 0} icon={CheckCircle} iconColor="text-green-400" />
          <StatCard title="Pending Review" value={stats?.pendingTriples || 0} icon={Clock} iconColor="text-yellow-400" />
          {isAdmin && adminStats && (
            <>
              <StatCard title="Total Users" value={adminStats.users || 0} icon={Database} iconColor="text-orange-400" />
              <StatCard title="Datasets" value={adminStats.datasets || 0} icon={FileText} iconColor="text-cyan-400" />
            </>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Plus, label: 'Upload Dataset', desc: 'Add new data sources', to: '/datasets', color: 'from-purple-600/20 to-purple-800/10' },
          { icon: Network, label: 'View Knowledge Graph', desc: 'Explore entity relationships', to: '/graph', color: 'from-blue-600/20 to-blue-800/10' },
          { icon: FileText, label: 'Start Extraction', desc: 'Run NLP on documents', to: '/nlp', color: 'from-green-600/20 to-green-800/10' },
        ].map(a => (
          <Link key={a.to} to={a.to} className={`glass-card p-6 bg-gradient-to-br ${a.color} hover:border-primary/30 transition-all group`}>
            <a.icon className="w-8 h-8 text-primary mb-3" />
            <p className="font-semibold mb-1">{a.label}</p>
            <p className="text-sm text-muted-foreground">{a.desc}</p>
            <ArrowRight className="w-4 h-4 mt-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Top Entities */}
      {stats?.topEntities && stats.topEntities.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Most Connected Entities</h2>
          <div className="space-y-2">
            {stats.topEntities.slice(0, 8).map((e: { id: string; name: string; entityType: string; degree: number }, i: number) => (
              <div key={e.id} className="flex items-center gap-3 py-2">
                <span className="text-muted-foreground text-sm w-5 text-right">{i + 1}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-medium text-sm">{e.name}</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{e.entityType}</span>
                </div>
                <span className="text-sm text-muted-foreground">{e.degree} connections</span>
              </div>
            ))}
          </div>
          <Link to="/graph" className="flex items-center gap-1 text-sm text-primary mt-4 hover:underline">
            View full graph <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent Activity (admin) */}
      {isAdmin && adminStats?.recentActivity && adminStats.recentActivity.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {adminStats.recentActivity.slice(0, 6).map((log: { id: string; action: string; user?: { name: string }; createdAt: string }) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <span className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</span>
                  {log.user && <span className="text-xs text-muted-foreground ml-2">by {log.user.name}</span>}
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
