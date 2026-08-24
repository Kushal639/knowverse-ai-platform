import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search, Filter } from 'lucide-react';
import { adminApi } from '@/api/index';
import { Skeleton, EmptyState } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', search, page],
    queryFn: () => adminApi.getAuditLogs({ page, limit: 25, action: search || undefined }),
  });

  const logs = data?.data?.logs || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const actionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-400 bg-red-500/10';
    if (action.includes('CREATE') || action.includes('APPROVE')) return 'text-green-400 bg-green-500/10';
    if (action.includes('UPDATE') || action.includes('RENAME') || action.includes('MERGE')) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-blue-400 bg-blue-500/10';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">{total} total events recorded</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Filter by action (e.g. LOGIN, DELETE)..." className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Shield} title="No audit logs found" />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Action</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Entity</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">IP</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: { id: string; action: string; user?: { name: string }; entityType?: string; entityId?: string; ipAddress?: string; createdAt: string }) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{log.user?.name || '—'}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {log.entityType && <span>{log.entityType}</span>}
                    {log.entityId && <span className="ml-1 font-mono">#{log.entityId.slice(0, 8)}</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{log.ipAddress || '—'}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border border-border rounded-md disabled:opacity-50 hover:bg-accent">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border border-border rounded-md disabled:opacity-50 hover:bg-accent">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
