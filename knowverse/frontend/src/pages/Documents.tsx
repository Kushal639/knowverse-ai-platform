import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Search, Eye } from 'lucide-react';
import { documentsApi } from '@/api/index';
import { EmptyState, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { formatDate } from '@/lib/utils';

export default function Documents() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewDoc, setViewDoc] = useState<{ title: string; content: string } | null>(null);
  const [form, setForm] = useState({ title: '', content: '', datasetId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search],
    queryFn: () => documentsApi.list({}),
  });

  const { mutate: createDoc, isPending: creating } = useMutation({
    mutationFn: () => documentsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document created', variant: 'success' });
      setShowCreate(false); setForm({ title: '', content: '', datasetId: '' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const docs = (data?.data?.documents || []).filter((d: { title: string }) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Documents</h1><p className="text-muted-foreground">Text content for NLP extraction</p></div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> New Document</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold mb-4">Create Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Document title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Dataset ID (optional)</label>
                <input value={form.datasetId} onChange={e => setForm(f => ({ ...f, datasetId: e.target.value }))} className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="dataset-uuid" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={8} placeholder="Paste your text here..." />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
                <button onClick={() => createDoc()} disabled={!form.title || !form.content || creating} className="px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-60">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{viewDoc.title}</h2>
              <button onClick={() => setViewDoc(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 bg-secondary rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">{viewDoc.content}</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Create a document or upload files via Datasets." />
      ) : (
        <div className="space-y-2">
          {docs.map((doc: { id: string; title: string; source?: string; createdAt: string; content?: string; dataset?: { name: string } }) => (
            <div key={doc.id} className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.dataset?.name && <span className="mr-2">📁 {doc.dataset.name}</span>}
                  {formatDate(doc.createdAt)}
                </p>
              </div>
              <button onClick={() => setViewDoc({ title: doc.title, content: doc.content || '' })} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
