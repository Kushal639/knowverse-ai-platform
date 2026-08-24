import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Brain, Clock } from 'lucide-react';
import { datasetsApi } from '@/api/datasets.api';
import { extractionsApi, documentsApi } from '@/api/index';
import { Badge, Skeleton, Spinner } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { formatDate, formatBytes } from '@/lib/utils';

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetsApi.getById(id!),
    enabled: !!id,
  });

  const { data: docsData } = useQuery({
    queryKey: ['documents', 'dataset', id],
    queryFn: () => documentsApi.list({ datasetId: id }),
    enabled: !!id,
  });

  const { mutate: startExtraction, isPending: extracting } = useMutation({
    mutationFn: (docId: string) => extractionsApi.start(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] });
      toast({ title: 'Extraction started!', description: 'Check the NLP Workspace for results.', variant: 'success' });
    },
    onError: (e: Error) => toast({ title: 'Failed to start extraction', description: e.message, variant: 'destructive' }),
  });

  const dataset = data?.data;
  const documents = docsData?.data?.documents || [];

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-48" /></div>;
  if (!dataset) return <p className="text-muted-foreground">Dataset not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/datasets" className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold">{dataset.name}</h1>
          <p className="text-muted-foreground text-sm">{dataset.description || 'No description'}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Status', value: <Badge variant={dataset.status === 'COMPLETED' ? 'success' : 'warning'}>{dataset.status}</Badge> },
          { label: 'Documents', value: dataset._count.documents },
          { label: 'File Size', value: dataset.fileSize ? formatBytes(dataset.fileSize) : 'N/A' },
          { label: 'Created', value: formatDate(dataset.createdAt) },
        ].map(m => (
          <div key={m.label} className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <div className="font-medium text-sm">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No documents yet. Upload a file to this dataset.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc: { id: string; title: string; source?: string; createdAt: string }) => (
              <div key={doc.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.source} · {formatDate(doc.createdAt)}</p>
                </div>
                <button
                  onClick={() => startExtraction(doc.id)}
                  disabled={extracting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-60"
                >
                  {extracting ? <Spinner className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                  Extract
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
