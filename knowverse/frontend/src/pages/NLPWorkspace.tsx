import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Brain, Play, CheckCircle, XCircle, FileText, Database,
  Table, Sparkles, Filter, CheckCheck, XSquare, ArrowRight,
  HelpCircle, AlertCircle, Layers, Sliders, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { documentsApi, extractionsApi } from '@/api/index';
import { Badge, EmptyState, Skeleton, Spinner, StatCard } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { getConfidenceColor } from '@/lib/utils';
import {
  ExtractionRun, ExtractionResult, DocumentSchemaInfo,
  SemanticRole, ExtractionMetrics
} from '@/types';

const SEMANTIC_ROLES: { value: SemanticRole; label: string; desc: string }[] = [
  { value: 'ENTITY_NAME', label: 'Entity Name (Subject)', desc: 'Primary subject entity name (e.g. Student name)' },
  { value: 'ENTITY_ID', label: 'Entity ID', desc: 'Identifier or code' },
  { value: 'CATEGORY', label: 'Category / Department', desc: 'Department, org, or grouping' },
  { value: 'SUBJECT', label: 'Subject / Course', desc: 'Course or discipline' },
  { value: 'TOPIC', label: 'Topic / Concept', desc: 'Subtopic, skill, or concept' },
  { value: 'ATTRIBUTE', label: 'Attribute / Grade', desc: 'Property like grade, score, or level' },
  { value: 'TEXT_SOURCE', label: 'Text / NLP Source', desc: 'Descriptive sentence text for hybrid NLP' },
  { value: 'RELATION_SOURCE', label: 'Relation Source (Head)', desc: 'Head entity in explicit triple' },
  { value: 'RELATION', label: 'Relation Predicate', desc: 'Explicit relation name' },
  { value: 'RELATION_TARGET', label: 'Relation Target (Tail)', desc: 'Tail entity in explicit triple' },
  { value: 'IGNORE', label: 'Ignore Column', desc: 'Exclude from extraction' },
];

export default function NLPWorkspace() {
  const qc = useQueryClient();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [activeRunId, setActiveRunId] = useState('');
  const [extractionMode, setExtractionMode] = useState<'AUTO_DETECT' | 'STRUCTURED' | 'NATURAL_LANGUAGE' | 'HYBRID'>('AUTO_DETECT');
  const [autoApprove, setAutoApprove] = useState(true);
  const [columnMapping, setColumnMapping] = useState<Record<string, SemanticRole>>({});
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // 1. Fetch documents
  const { data: docsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list({ limit: 100 }),
  });
  const documents = docsData?.data?.documents || [];

  // 2. Fetch schema when document is selected
  const { data: schemaData } = useQuery({
    queryKey: ['document-schema', selectedDocId],
    queryFn: () => extractionsApi.getSchema(selectedDocId),
    enabled: !!selectedDocId,
  });

  useEffect(() => {
    if (schemaData?.success && schemaData?.data?.columns) {
      const initialMap: Record<string, SemanticRole> = {};
      for (const col of schemaData.data.columns) {
        initialMap[col.name] = col.inferredRole;
      }
      setColumnMapping(initialMap);
      setExtractionMode(schemaData.data.recommendedMode || 'AUTO_DETECT');
    }
  }, [schemaData]);

  const schemaInfo: DocumentSchemaInfo | undefined = schemaData?.data;

  // 3. Fetch active extraction run
  const { data: runData, refetch: refetchRun } = useQuery({
    queryKey: ['extraction', activeRunId],
    queryFn: () => extractionsApi.getById(activeRunId),
    enabled: !!activeRunId,
    refetchInterval: (query: any) => {
      const status = query.state.data?.data?.status;
      return status === 'RUNNING' || status === 'QUEUED' ? 1000 : false;
    },
  });

  // Start extraction mutation
  const { mutate: startExtraction, isPending: starting } = useMutation({
    mutationFn: () => extractionsApi.start(selectedDocId, {
      mode: extractionMode,
      columnMapping,
      model: 'spacy-en',
      autoApprove,
    }),
    onSuccess: (d) => {
      setActiveRunId(d.data.id);
      qc.invalidateQueries({ queryKey: ['extraction', d.data.id] });
      qc.invalidateQueries({ queryKey: ['graph'] });
      toast({
        title: 'Extraction Pipeline Started',
        description: autoApprove ? 'Extracting & committing directly to Knowledge Graph...' : `Processing in ${extractionMode.replace('_', ' ')} mode...`,
        variant: 'success',
      });
    },
    onError: (e: Error) => toast({ title: 'Extraction Failed', description: e.message, variant: 'destructive' }),
  });

  // Approve single result
  const { mutate: approveResult } = useMutation({
    mutationFn: (id: string) => extractionsApi.approve(id),
    onSuccess: () => {
      refetchRun();
      qc.invalidateQueries({ queryKey: ['graph'] });
      toast({ title: 'Triple Approved ✓', description: 'Committed to Knowledge Graph', variant: 'success' });
    },
    onError: (e: Error) => toast({ title: 'Approval Error', description: e.message, variant: 'destructive' }),
  });

  // Reject single result
  const { mutate: rejectResult } = useMutation({
    mutationFn: (id: string) => extractionsApi.reject(id),
    onSuccess: () => {
      refetchRun();
      toast({ title: 'Triple Rejected', variant: 'default' });
    },
  });

  // Bulk approve
  const { mutate: approveAll, isPending: approvingAll } = useMutation({
    mutationFn: () => extractionsApi.approveAll(activeRunId),
    onSuccess: (d) => {
      refetchRun();
      qc.invalidateQueries({ queryKey: ['graph'] });
      toast({ title: `Approved ${d.data.approvedCount} Triples ✓`, description: 'All added to Knowledge Graph', variant: 'success' });
    },
  });

  // Bulk reject
  const { mutate: rejectAll, isPending: rejectingAll } = useMutation({
    mutationFn: () => extractionsApi.rejectAll(activeRunId),
    onSuccess: () => {
      refetchRun();
      toast({ title: 'Rejected All Pending Triples', variant: 'default' });
    },
  });

  const run: ExtractionRun | undefined = runData?.data;
  const results: ExtractionResult[] = run?.results || [];
  const metrics: ExtractionMetrics | undefined = run?.metadata;

  // Filter results
  const filteredResults = results.filter(r => {
    const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;
    const methodMatch = methodFilter === 'ALL' || r.extractionMethod === methodFilter;
    return statusMatch && methodMatch;
  });

  const pendingCount = results.filter(r => r.status === 'PENDING').length;
  const approvedCount = results.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = results.filter(r => r.status === 'REJECTED').length;

  const structuredCount = results.filter(r => r.extractionMethod === 'STRUCTURED').length;
  const nlpCount = results.filter(r => r.extractionMethod === 'NLP' || r.extractionMethod === 'HYBRID').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">NLP & Structured Extraction Workspace</h1>
        <p className="text-muted-foreground text-sm">
          Extract, review, and commit knowledge triples from CSV, TSV, JSON, and unstructured text documents.
        </p>
      </div>

      {/* Step 1: Document Selection & Mode Config */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-semibold flex items-center gap-2 text-base">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
            Select Document & Configure Extraction
          </h2>
          {schemaInfo && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Detected:</span>
              <Badge variant="default" className="uppercase font-mono text-[11px]">{schemaInfo.documentType}</Badge>
              <Badge variant="secondary" className="text-[11px]">~{schemaInfo.totalRowsEstimate} rows</Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Document Dropdown */}
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document</label>
            <select
              value={selectedDocId}
              onChange={e => setSelectedDocId(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select a document to extract...</option>
              {documents.map((d: { id: string; title: string; dataset?: { name: string } }) => (
                <option key={d.id} value={d.id}>
                  {d.title} {d.dataset?.name ? `(${d.dataset.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Extraction Mode Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Extraction Mode</label>
            <select
              value={extractionMode}
              onChange={e => setExtractionMode(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            >
              <option value="AUTO_DETECT">⚡ Auto Detect (Recommended)</option>
              <option value="STRUCTURED">📊 Structured Dataset</option>
              <option value="HYBRID">🧬 Hybrid (Structured + NLP)</option>
              <option value="NATURAL_LANGUAGE">📝 Natural Language</option>
            </select>
          </div>

          {/* Run Extraction Button */}
          <div className="md:col-span-3 flex flex-col justify-end gap-1.5">
            <button
              onClick={() => startExtraction()}
              disabled={!selectedDocId || starting}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-all glow"
            >
              {starting ? <Spinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {starting ? 'Extracting...' : 'Start Extraction'}
            </button>
          </div>
        </div>

        {/* Auto-commit checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={e => setAutoApprove(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4 cursor-pointer"
            />
            <span className="font-medium text-foreground">⚡ Auto-commit triples directly to Knowledge Graph</span>
            <span className="text-muted-foreground text-[11px]">(automatically adds approved nodes and edges to MySQL)</span>
          </label>
        </div>

        {/* Column Mapping Section (for structured/CSV files) */}
        {schemaInfo && schemaInfo.columns.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setShowMappingConfig(v => !v)}
                className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showMappingConfig ? 'Hide Column Mapping' : `Review / Edit Column Mappings (${schemaInfo.columns.length} columns detected)`}
              </button>
              {showMappingConfig && (
                <button
                  type="button"
                  onClick={() => {
                    const reset: Record<string, SemanticRole> = {};
                    schemaInfo.columns.forEach(c => { reset[c.name] = c.inferredRole; });
                    setColumnMapping(reset);
                    toast({ title: 'Reset to auto-inferred mappings', variant: 'default' });
                  }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Defaults
                </button>
              )}
            </div>

            {showMappingConfig && (
              <div className="bg-secondary/40 rounded-xl p-4 border border-border space-y-3">
                <p className="text-xs text-muted-foreground">
                  Map each column to its semantic graph role. The pipeline will generate entities and directed relationships automatically.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {schemaInfo.columns.map(col => (
                    <div key={col.name} className="p-3 bg-card rounded-lg border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-foreground truncate" title={col.name}>{col.name}</span>
                        <span className="text-[10px] text-muted-foreground">{(col.confidence * 100).toFixed(0)}% match</span>
                      </div>
                      <select
                        value={columnMapping[col.name] || col.inferredRole}
                        onChange={e => setColumnMapping(prev => ({ ...prev, [col.name]: e.target.value as SemanticRole }))}
                        className="w-full px-2 py-1.5 bg-secondary rounded border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        {SEMANTIC_ROLES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      {col.sampleValues.length > 0 && (
                        <p className="text-[10px] text-muted-foreground truncate" title={col.sampleValues.join(', ')}>
                          e.g. {col.sampleValues.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extraction Run Status Banner */}
      {run && (
        <div className="glass-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Extraction Run: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">{run.id.slice(0, 8)}...</code>
              </p>
              <p className="text-xs text-muted-foreground">
                Document: <span className="text-foreground font-medium">{run.document?.title}</span> · Mode: <span className="font-mono uppercase">{run.extractionMode || 'AUTO'}</span>
              </p>
            </div>
          </div>
          <Badge variant={run.status === 'COMPLETED' ? 'success' : run.status === 'FAILED' ? 'destructive' : 'warning'}>
            {run.status === 'RUNNING' ? <><Spinner className="w-3 h-3 inline mr-1" /> Processing...</> : run.status}
          </Badge>
        </div>
      )}

      {/* Real Execution Metrics Cards */}
      {run && run.status === 'COMPLETED' && metrics && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Extraction Performance & Results Metrics
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              Avg. Confidence: {(metrics.confidenceAverage * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Rows Processed" value={metrics.totalRowsProcessed} icon={Table} iconColor="text-blue-400" />
            <StatCard title="Entities Detected" value={metrics.entitiesDetectedCount} icon={Database} iconColor="text-purple-400" />
            <StatCard title="Triples Generated" value={metrics.relationshipsExtractedCount} icon={Layers} iconColor="text-green-400" />
            <StatCard title="Duplicates Merged" value={metrics.duplicatesMergedCount} icon={RefreshCw} iconColor="text-cyan-400" />
            <StatCard title="Structured Triples" value={metrics.structuredTriplesCount} icon={Table} iconColor="text-indigo-400" />
            <StatCard title="NLP Triples" value={metrics.nlpTriplesCount} icon={Brain} iconColor="text-orange-400" />
          </div>
        </div>
      )}

      {/* Zero Result Diagnostic Notice */}
      {run && run.status === 'COMPLETED' && results.length === 0 && (
        <div className="glass-card p-6 border-yellow-500/30 bg-yellow-500/5 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-foreground">Extraction Finished (0 Triples Generated)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.zeroResultDiagnostics?.reason || 'No supported subject-verb-object relationships could be generated from the selected document and mapping.'}
              </p>
              <div className="mt-3 p-3 bg-secondary rounded-lg border border-border text-xs space-y-1">
                <p className="font-medium text-foreground">💡 Actionable Suggestion:</p>
                <p className="text-muted-foreground">
                  {metrics?.zeroResultDiagnostics?.suggestion || 'If this is a CSV dataset, expand "Review Column Mappings" and ensure an Entity Name column is mapped with Subject/Topic/Category columns, then run with Structured or Hybrid mode.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Triples Review Section */}
      {results.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                Human-in-the-Loop Review
                <span className="text-sm font-normal text-muted-foreground">({results.length} total triples)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review candidate facts before committing them to the MySQL Knowledge Graph.
              </p>
            </div>

            {/* Bulk Action Buttons */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => approveAll()}
                  disabled={approvingAll}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {approvingAll ? 'Approving...' : `Approve All Pending (${pendingCount})`}
                </button>
                <button
                  onClick={() => rejectAll()}
                  disabled={rejectingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                >
                  <XSquare className="w-3.5 h-3.5" />
                  Reject All
                </button>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { label: `Pending (${pendingCount})`, val: 'PENDING' },
                { label: `Approved (${approvedCount})`, val: 'APPROVED' },
                { label: `Rejected (${rejectedCount})`, val: 'REJECTED' },
                { label: `All (${results.length})`, val: 'ALL' },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setStatusFilter(f.val)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors font-medium ${statusFilter === f.val ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Method:</span>
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="px-2 py-1 bg-secondary rounded border border-border text-xs focus:outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="STRUCTURED">Structured ({structuredCount})</option>
                <option value="NLP">NLP ({nlpCount})</option>
              </select>
            </div>
          </div>

          {/* Review Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-secondary/60 border-b border-border">
                <tr>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Subject</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Relation</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Object</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Method</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Confidence</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Source / Provenance</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Status</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredResults.slice(0, 150).map(r => (
                  <tr key={r.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground max-w-[160px] truncate" title={r.subject}>
                      {r.subject}
                    </td>
                    <td className="py-2.5 px-3 max-w-[140px] truncate">
                      <span className="font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {r.relation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground max-w-[160px] truncate" title={r.object}>
                      {r.object}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${r.extractionMethod === 'STRUCTURED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {r.extractionMethod || 'NLP'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-semibold ${getConfidenceColor(r.confidence)}`}>
                        {(r.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[160px] truncate text-muted-foreground" title={r.sourceText}>
                      {r.sourceText || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      {r.status === 'PENDING' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveResult(r.id)}
                            className="p-1 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors"
                            title="Approve Triple"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectResult(r.id)}
                            className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Reject Triple"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground opacity-60">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length > 150 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Showing first 150 of {filteredResults.length} triples.
            </p>
          )}

          {/* Quick link to Knowledge Graph */}
          {approvedCount > 0 && (
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-between">
              <span className="text-xs text-primary font-medium">
                🎉 {approvedCount} triples are committed to your directed Knowledge Graph in MySQL.
              </span>
              <Link
                to="/graph"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all"
              >
                View Knowledge Graph <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State */}
      {!activeRunId && !starting && (
        <EmptyState
          icon={Brain}
          title="Ready to Extract Knowledge"
          description="Select any uploaded CSV, TSV, JSON, or text document above to configure columns and run the extraction engine."
        />
      )}
    </div>
  );
}
