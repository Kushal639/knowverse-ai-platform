import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitBranch, Merge, Edit3, Plus, History, Sparkles,
  ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, Check,
  RotateCcw, Sliders, CheckCircle2
} from 'lucide-react';
import { graphApi } from '@/api/graph.api';
import { adminApi } from '@/api/index';
import { Spinner, Badge } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { formatDateTime } from '@/lib/utils';

export default function AdminGraph() {
  const qc = useQueryClient();
  const [renameId, setRenameId] = useState('');
  const [renameName, setRenameName] = useState('');
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [newEntityName, setNewEntityName] = useState('');
  const [newRelationName, setNewRelationName] = useState('');
  const [duplicateThreshold, setDuplicateThreshold] = useState(0.55);

  const { data: versionsData, refetch: refetchVersions } = useQuery({
    queryKey: ['admin', 'graph', 'versions'],
    queryFn: adminApi.getGraphVersions,
  });

  const { data: entitiesData, refetch: refetchEntities } = useQuery({
    queryKey: ['graph', 'entities', 'all'],
    queryFn: () => graphApi.getEntities({ limit: 300 }),
  });

  const { data: duplicatesData, isFetching: loadingDuplicates, refetch: refetchDuplicates } = useQuery({
    queryKey: ['graph-duplicates', duplicateThreshold],
    queryFn: () => graphApi.detectDuplicates(duplicateThreshold),
  });

  const entities = entitiesData?.data?.entities || [];
  const versions = versionsData?.data || [];
  const duplicates = duplicatesData?.data || [];

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['graph'] });
    qc.invalidateQueries({ queryKey: ['admin', 'graph', 'versions'] });
    qc.invalidateQueries({ queryKey: ['graph', 'entities', 'all'] });
    refetchVersions();
    refetchEntities();
    refetchDuplicates();
  };

  const handleScanDuplicates = async () => {
    const res = await refetchDuplicates();
    const count = res.data?.data?.length || 0;
    toast({
      title: 'Duplicate Scan Complete',
      description: count > 0 ? `Found ${count} candidate duplicate pair(s) at ${(duplicateThreshold * 100).toFixed(0)}% sensitivity.` : 'No duplicate candidates found at current sensitivity threshold.',
      variant: count > 0 ? 'default' : 'success',
    });
  };

  const { mutate: rollbackVersion, isPending: rollingBack } = useMutation({
    mutationFn: (id: string) => graphApi.rollbackVersion(id),
    onSuccess: (res: any) => {
      invalidateAll();
      toast({
        title: 'Change Undone Successfully',
        description: res?.message || 'Reverted graph modifications and recorded undo snapshot.',
        variant: 'success',
      });
    },
    onError: (e: Error) => toast({ title: 'Undo failed', description: e.message, variant: 'destructive' }),
  });

  const { mutate: renameEntity, isPending: renaming } = useMutation({
    mutationFn: () => graphApi.renameEntity(renameId, renameName),
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Entity renamed & version snapshot created', variant: 'success' });
      setRenameId('');
      setRenameName('');
    },
    onError: (e: Error) => toast({ title: 'Rename failed', description: e.message, variant: 'destructive' }),
  });

  const { mutate: mergeEntities, isPending: merging } = useMutation({
    mutationFn: (args?: { source?: string; target?: string }) => {
      const src = args?.source || mergeSource;
      const tgt = args?.target || mergeTarget;
      return graphApi.mergeEntities(src, tgt);
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Entities merged successfully', description: 'Triples redirected and version snapshot saved.', variant: 'success' });
      setMergeSource('');
      setMergeTarget('');
    },
    onError: (e: Error) => toast({ title: 'Merge failed', description: e.message, variant: 'destructive' }),
  });

  const { mutate: createEntity, isPending: creatingEntity } = useMutation({
    mutationFn: () => graphApi.createEntity({ name: newEntityName }),
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Entity created & snapshot recorded', variant: 'success' });
      setNewEntityName('');
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const { mutate: createRelation, isPending: creatingRelation } = useMutation({
    mutationFn: () => graphApi.createRelation({ name: newRelationName }),
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Relation created & snapshot recorded', variant: 'success' });
      setNewRelationName('');
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-primary" /> Graph Administration & Entity Resolution
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI duplicate detection workbench, entity merging, renaming, and instant change undo/rollback control.
        </p>
      </div>

      {/* AI Entity Resolution / Duplicate Detection Workbench */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Duplicate Detection & Entity Resolution Workbench
            </h3>
            <p className="text-xs text-muted-foreground">
              Scans aliases, acronyms, and string similarities to detect candidate duplicates across your graph.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-secondary/80 px-2 py-1 rounded-xl border border-border text-xs">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-[11px]">Match:</span>
              <select
                value={duplicateThreshold}
                onChange={e => setDuplicateThreshold(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
              >
                <option value="0.45" className="bg-card text-foreground">45% (Broad)</option>
                <option value="0.55" className="bg-card text-foreground">55% (Balanced)</option>
                <option value="0.70" className="bg-card text-foreground">70% (High)</option>
                <option value="0.85" className="bg-card text-foreground">85% (Strict)</option>
              </select>
            </div>

            <button
              onClick={handleScanDuplicates}
              disabled={loadingDuplicates}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDuplicates ? 'animate-spin' : ''}`} />
              Scan Duplicates
            </button>
          </div>
        </div>

        {loadingDuplicates ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Spinner className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Scanning database for entity duplicates...</span>
          </div>
        ) : duplicates.length === 0 ? (
          <div className="p-6 bg-secondary/40 rounded-xl text-center space-y-1">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">No Duplicate Candidates Detected</p>
            <p className="text-[11px] text-muted-foreground">
              No matching pairs found at {(duplicateThreshold * 100).toFixed(0)}% sensitivity. Try lowering the match threshold above to find broader variants.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {duplicates.map((c: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-secondary/60 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant={c.similarity >= 85 ? 'destructive' : 'warning'} className="text-[10px]">
                    {c.similarity}% Match
                  </Badge>
                  <span className="text-[10px] text-muted-foreground italic">{c.recommendation}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-card rounded-lg border border-border/50">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Entity A</span>
                    <strong className="text-foreground truncate block">{c.entityA.name}</strong>
                    <span className="text-[9px] text-muted-foreground font-mono">{c.entityA.entityType}</span>
                  </div>
                  <div className="p-2 bg-card rounded-lg border border-border/50">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Entity B</span>
                    <strong className="text-foreground truncate block">{c.entityB.name}</strong>
                    <span className="text-[9px] text-muted-foreground font-mono">{c.entityB.entityType}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (confirm(`Merge "${c.entityA.name}" into "${c.entityB.name}"?`)) {
                        mergeEntities({ source: c.entityA.id, target: c.entityB.id });
                      }
                    }}
                    disabled={merging}
                    className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Merge className="w-3 h-3" /> Merge A → B
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Merge "${c.entityB.name}" into "${c.entityA.name}"?`)) {
                        mergeEntities({ source: c.entityB.id, target: c.entityA.id });
                      }
                    }}
                    disabled={merging}
                    className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Merge className="w-3 h-3" /> Merge B → A
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rename entity */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-primary" /> Rename Entity
          </h2>
          <p className="text-xs text-muted-foreground">
            Updates entity name and automatically preserves previous name as alias.
          </p>
          <div className="space-y-2">
            <select
              value={renameId}
              onChange={e => setRenameId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select entity to rename...</option>
              {entities.map((e: any) => (
                <option key={e.id} value={e.id}>{e.name} ({e.entityType})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                value={renameName}
                onChange={e => setRenameName(e.target.value)}
                className="flex-1 px-3 py-2 bg-secondary rounded-lg border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="New name"
              />
              <button
                onClick={() => renameEntity()}
                disabled={!renameId || !renameName || renaming}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-primary/90"
              >
                {renaming ? <Spinner className="w-3.5 h-3.5" /> : 'Rename'}
              </button>
            </div>
          </div>
        </div>

        {/* Merge entities */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Merge className="w-4 h-4 text-primary" /> Merge Entities
          </h2>
          <p className="text-xs text-muted-foreground">
            Redirects all triples from Source into Target, preserves aliases, and removes redundant node.
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Source (will be removed):</label>
                <select
                  value={mergeSource}
                  onChange={e => setMergeSource(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Source entity...</option>
                  {entities.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Target (will be kept):</label>
                <select
                  value={mergeTarget}
                  onChange={e => setMergeTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Target entity...</option>
                  {entities.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Execute entity merge? All triples will be moved to the target entity.')) {
                  mergeEntities();
                }
              }}
              disabled={!mergeSource || !mergeTarget || mergeSource === mergeTarget || merging}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-primary/90"
            >
              {merging ? <Spinner className="w-3.5 h-3.5" /> : <Merge className="w-3.5 h-3.5" />} Execute Merge
            </button>
          </div>
        </div>

        {/* Create entity */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Create Entity
          </h2>
          <div className="flex gap-2">
            <input
              value={newEntityName}
              onChange={e => setNewEntityName(e.target.value)}
              className="flex-1 px-3 py-2 bg-secondary rounded-lg border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Entity name"
            />
            <button
              onClick={() => createEntity()}
              disabled={!newEntityName || creatingEntity}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-primary/90"
            >
              {creatingEntity ? <Spinner className="w-3.5 h-3.5" /> : 'Create'}
            </button>
          </div>
        </div>

        {/* Create relation */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" /> Create Relation Type
          </h2>
          <div className="flex gap-2">
            <input
              value={newRelationName}
              onChange={e => setNewRelationName(e.target.value)}
              className="flex-1 px-3 py-2 bg-secondary rounded-lg border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Relation name (e.g. 'studies')"
            />
            <button
              onClick={() => createRelation()}
              disabled={!newRelationName || creatingRelation}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-60 hover:bg-primary/90"
            >
              {creatingRelation ? <Spinner className="w-3.5 h-3.5" /> : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Version history & Undo / Rollback */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Graph Version History & Undo Rollback
            </h2>
            <p className="text-xs text-muted-foreground">
              Every graph change is atomically snapshotted. Click "Undo Change" to roll back any modification.
            </p>
          </div>
          <button
            onClick={() => refetchVersions()}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh History
          </button>
        </div>

        {versions.length === 0 ? (
          <p className="text-muted-foreground text-xs py-4 text-center">No graph changes recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.slice(0, 15).map((v: { id: string; name: string; createdBy: { name: string }; _count: { changes: number }; createdAt: string }) => {
              const isRevert = v.name.startsWith('Reverted');

              return (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 text-xs hover:bg-secondary transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isRevert ? 'text-amber-400' : 'text-foreground'}`}>
                        {v.name}
                      </p>
                      {isRevert && (
                        <Badge variant="warning" className="text-[9px] py-0">Rollback</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      by {v.createdBy?.name || 'Admin'} · {v._count?.changes || 1} change(s) · <span className="font-mono text-[10px]">{formatDateTime(v.createdAt)}</span>
                    </p>
                  </div>

                  {!isRevert && (
                    <button
                      onClick={() => {
                        if (confirm(`Undo and revert this change?\n\n"${v.name}"`)) {
                          rollbackVersion(v.id);
                        }
                      }}
                      disabled={rollingBack}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all shrink-0"
                      title="Undo this change"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Undo Change
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
