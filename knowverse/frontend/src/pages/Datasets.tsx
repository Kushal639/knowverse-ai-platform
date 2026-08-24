import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Search, Trash2, FolderOpen, MoreVertical, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { datasetsApi } from '@/api/datasets.api';
import { Badge, EmptyState, Skeleton, Spinner } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { formatDate, formatBytes } from '@/lib/utils';
import { Dataset } from '@/types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  UPLOADED: 'secondary', VALIDATING: 'secondary', PROCESSING: 'warning',
  EXTRACTING: 'warning', REVIEWING: 'warning', COMPLETED: 'success', FAILED: 'destructive',
};

export default function Datasets() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [uploadDatasetId, setUploadDatasetId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['datasets', search],
    queryFn: () => datasetsApi.list({ search }),
  });

  const { mutate: createDataset, isPending: creating } = useMutation({
    mutationFn: () => datasetsApi.create({ name: newName, description: newDesc }),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['datasets'] });
      setShowCreate(false); setNewName(''); setNewDesc('');
      toast({ title: 'Dataset created', variant: 'success' });
      if (fileInputRef.current) { setUploadDatasetId(d.data.id); fileInputRef.current.click(); }
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const { mutate: deleteDataset } = useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['datasets'] }); toast({ title: 'Dataset deleted', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
  });

  const { mutate: uploadFile, isPending: uploading } = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      datasetsApi.uploadFile(id, file, setUploadProgress),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['datasets'] }); setUploadProgress(0); toast({ title: 'File uploaded', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Upload failed', description: e.message, variant: 'destructive' }),
  });

  const datasets: Dataset[] = data?.data?.datasets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Datasets</h1>
          <p className="text-muted-foreground">Manage your data sources</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New Dataset
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search datasets..."
          className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Create Dataset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="My dataset" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={3} placeholder="Optional description" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
                <button onClick={() => createDataset()} disabled={!newName.trim() || creating} className="px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-60 flex items-center gap-2">
                  {creating && <Spinner className="w-3 h-3" />} Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt,.pdf,.docx" className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && uploadDatasetId) uploadFile({ id: uploadDatasetId, file });
          e.target.value = '';
        }}
      />

      {/* Upload progress */}
      {uploading && (
        <div className="glass-card p-4">
          <p className="text-sm mb-2">Uploading... {uploadProgress}%</p>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Dataset list */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : datasets.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No datasets yet" description="Create a dataset and upload files to start extracting knowledge." action={<button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Create Dataset</button>} />
      ) : (
        <div className="space-y-3">
          {datasets.map(ds => (
            <div key={ds.id} className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link to={`/datasets/${ds.id}`} className="font-medium hover:text-primary transition-colors truncate">{ds.name}</Link>
                  <Badge variant={statusVariants[ds.status] || 'secondary'}>{ds.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{ds._count.documents} document{ds._count.documents !== 1 ? 's' : ''}</span>
                  {ds.fileSize && <span>{formatBytes(ds.fileSize)}</span>}
                  <span>Created {formatDate(ds.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setUploadDatasetId(ds.id); fileInputRef.current?.click(); }} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Upload file">
                  <Upload className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm('Delete this dataset?')) deleteDataset(ds.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
