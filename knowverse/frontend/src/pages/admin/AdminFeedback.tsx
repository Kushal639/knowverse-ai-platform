import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Star, Send } from 'lucide-react';
import { feedbackApi } from '@/api/index';
import { Badge, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { formatDate } from '@/lib/utils';

export default function AdminFeedback() {
  const qc = useQueryClient();
  const [responding, setResponding] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['feedback', 'all'], queryFn: () => feedbackApi.list({ limit: 50 }) });
  const { data: statsData } = useQuery({ queryKey: ['feedback', 'stats'], queryFn: feedbackApi.getStats });

  const feedbacks = data?.data?.feedback || [];
  const stats = statsData?.data;

  const { mutate: respond, isPending: submitting } = useMutation({
    mutationFn: ({ id, adminResponse }: { id: string; adminResponse: string }) => feedbackApi.respond(id, adminResponse),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feedback'] }); toast({ title: 'Response sent', variant: 'success' }); setResponding(null); setResponse(''); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Feedback Management</h1><p className="text-muted-foreground">Review and respond to user feedback</p></div>

      {stats && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold gradient-text">{(stats.averageRating || 0).toFixed(1)}</p>
              <p className="text-sm text-muted-foreground mt-1">Avg Rating</p>
              <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />)}</div>
            </div>
            <div className="flex gap-6">
              {(stats.byRating || []).map((r: { rating: number; count: number }) => (
                <div key={r.rating} className="text-center">
                  <p className="text-xl font-bold">{r.count}</p>
                  <p className="text-xs text-muted-foreground">{r.rating}★</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f: { id: string; user?: { name: string; email: string }; rating: number; comment?: string; status: string; adminResponse?: string; createdAt: string }) => (
            <div key={f.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{f.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">{f.user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />)}</div>
                  <Badge variant={f.status === 'REVIEWED' ? 'success' : 'secondary'}>{f.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                </div>
              </div>
              {f.comment && <p className="text-sm text-muted-foreground mb-3">"{f.comment}"</p>}
              {f.adminResponse && (
                <div className="border-l-2 border-primary/50 pl-3 mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Your response:</p>
                  <p className="text-sm text-primary">{f.adminResponse}</p>
                </div>
              )}
              {responding === f.id ? (
                <div className="flex gap-3">
                  <textarea value={response} onChange={e => setResponse(e.target.value)} className="flex-1 px-3 py-2 bg-secondary rounded-lg border border-border text-sm resize-none" rows={2} placeholder="Write your response..." />
                  <div className="flex flex-col gap-2">
                    <button onClick={() => respond({ id: f.id, adminResponse: response })} disabled={!response || submitting} className="px-3 py-2 bg-primary text-white rounded-lg text-xs">Send</button>
                    <button onClick={() => setResponding(null)} className="px-3 py-2 border border-border rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setResponding(f.id); setResponse(f.adminResponse || ''); }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Send className="w-3 h-3" /> {f.adminResponse ? 'Edit response' : 'Respond'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
