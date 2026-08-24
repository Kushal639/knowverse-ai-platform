import { useQuery } from '@tanstack/react-query';
import {
  BarChart2, Network, GitCommit, Layers, Users, Zap,
  TrendingUp, Compass, PieChart as PieIcon, ShieldAlert, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import { graphApi } from '@/api/graph.api';
import { Spinner, Badge, StatCard } from '@/components/ui';
import { getEntityTypeColor } from '@/lib/utils';

export default function Analytics() {
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['graph-analytics'],
    queryFn: graphApi.getAnalytics,
  });

  const { data: clustersData, isLoading: loadingClusters } = useQuery({
    queryKey: ['graph-clusters'],
    queryFn: graphApi.getClusters,
  });

  const analytics = analyticsData?.data;
  const clusters = clustersData?.data || [];
  const metrics = analytics?.metrics;

  if (loadingAnalytics || loadingClusters) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-sm text-muted-foreground">Calculating graph analytics & community clusters...</p>
      </div>
    );
  }

  const typeData = analytics?.entityTypeDistribution || [];
  const topRelations = analytics?.topRelations || [];
  const topEntities = analytics?.topEntities || [];
  const confData = analytics?.confidenceDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <BarChart2 className="w-6 h-6 text-primary" /> Knowledge Graph Analytics & Clustering
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time topological metrics, semantic community detection, and relationship distribution.
          </p>
        </div>

        <Link
          to="/graph"
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 w-fit"
        >
          <Network className="w-4 h-4" /> Open Graph Explorer
        </Link>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Entities"
          value={metrics?.totalEntities || 0}
          icon={Users}
          description="Nodes in database"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Total Relations"
          value={metrics?.totalRelations || 0}
          icon={GitCommit}
          description="Distinct predicates"
          iconColor="text-purple-400"
        />
        <StatCard
          title="Approved Triples"
          value={metrics?.approvedTriples || 0}
          icon={Network}
          description="Active directed edges"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Average Degree"
          value={metrics?.averageDegree || 0}
          icon={TrendingUp}
          description="Edges per entity"
          iconColor="text-amber-400"
        />
        <StatCard
          title="Graph Density"
          value={metrics?.density || 0}
          icon={Zap}
          description="Connectivity index"
          iconColor="text-pink-400"
        />
        <StatCard
          title="Isolated Entities"
          value={metrics?.isolatedEntities || 0}
          icon={ShieldAlert}
          description="Degree = 0"
          iconColor="text-slate-400"
        />
      </div>

      {/* Community Clusters Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" /> Semantic Community Detection (Clusters)
            </h3>
            <p className="text-xs text-muted-foreground">
              Modular subgraphs partitioned by semantic domains and high co-occurrence density.
            </p>
          </div>
          <Badge variant="secondary">{clusters.length} Active Communities</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clusters.map((c: any) => (
            <div key={c.id} className="p-4 rounded-2xl bg-secondary/60 border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-foreground truncate">{c.name}</h4>
                <Badge variant="default" className="text-[10px]">{c.entityCount} Nodes</Badge>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Core Members:</span>
                <div className="flex flex-wrap gap-1">
                  {c.entities.slice(0, 5).map((e: any) => (
                    <span
                      key={e.id}
                      className="px-2 py-0.5 rounded text-[10px] bg-card border border-border/60 font-medium text-foreground truncate max-w-[120px]"
                    >
                      {e.name}
                    </span>
                  ))}
                  {c.entities.length > 5 && (
                    <span className="text-[10px] text-muted-foreground self-center">+{c.entities.length - 5} more</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/40">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Key Relations:</span>
                <div className="flex flex-wrap gap-1">
                  {c.commonRelations.map((rel: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                      {rel}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to={`/graph?search=${encodeURIComponent(c.name.split(' ')[0])}`}
                className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
              >
                Isolate in Graph <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Type Distribution */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-primary" /> Entity Type Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Most Connected Entities */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Top Most Connected Entities (Hubs)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEntities.slice(0, 7)} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="degree" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
