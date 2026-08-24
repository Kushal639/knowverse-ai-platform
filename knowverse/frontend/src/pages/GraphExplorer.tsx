import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactFlow, {
  Node, Edge, Controls, MiniMap, Background, BackgroundVariant,
  useNodesState, useEdgesState, NodeProps, Handle, Position, MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Network, X, Filter, Search, RefreshCw, Layers, Database,
  Eye, Compass, Sparkles, BookOpen, Trash2, Download, Share2,
  Sliders, ShieldCheck, ArrowRight, CornerDownRight, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { graphApi } from '@/api/graph.api';
import { datasetsApi } from '@/api/datasets.api';
import { aiApi } from '@/api/index';
import { Spinner, Badge, Dialog } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { getEntityTypeColor, formatDate } from '@/lib/utils';
import { Entity, Triple, EntityDetail, Dataset } from '@/types';

// Custom colored entity node component
function EntityNode({ data }: NodeProps) {
  const color = getEntityTypeColor(data.entityType);
  const isSelected = data.isSelected;

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl border-2 text-xs font-semibold shadow-md dark:shadow-xl cursor-pointer transition-all duration-200 min-w-[110px] max-w-[200px] text-center bg-card text-foreground ${
        isSelected ? 'ring-4 ring-primary/40 scale-105 shadow-primary/20' : 'hover:scale-105'
      }`}
      style={{
        borderColor: color,
        boxShadow: isSelected ? `0 0 20px ${color}60` : `0 4px 14px ${color}20`,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-primary/80 !border-0" />
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-85 font-bold" style={{ color }}>
          {data.entityType || 'ENTITY'}
        </span>
      </div>
      <div className="font-semibold text-foreground truncate" title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary/80 !border-0" />
    </div>
  );
}

const nodeTypes = { entity: EntityNode };

export default function GraphExplorer() {
  const qc = useQueryClient();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEdgeData, setSelectedEdgeData] = useState<any | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [neighborhoodMode, setNeighborhoodMode] = useState(false);
  const [neighborhoodDepth, setNeighborhoodDepth] = useState<number>(2);

  // Multi-entity selection for explanation
  const [explainEntityIds, setExplainEntityIds] = useState<string[]>([]);
  const [explanationData, setExplanationData] = useState<{ explanation: string; paths: any[] } | null>(null);

  const [filters, setFilters] = useState({
    status: 'APPROVED',
    entityType: '',
    minConfidence: 0,
  });

  // 1. Fetch available datasets for the dropdown
  const { data: datasetsData } = useQuery({
    queryKey: ['datasets-list-graph'],
    queryFn: () => datasetsApi.list({ limit: 50 }),
  });
  const datasets: Dataset[] = datasetsData?.data?.datasets || [];

  // 2. Fetch knowledge graph data (full graph or neighborhood mode)
  const { data: fullGraphData, isLoading: fullLoading, isFetching: fullFetching, refetch: refetchFull } = useQuery({
    queryKey: ['graph', { ...filters, datasetId: selectedDatasetId, search: searchQuery }],
    queryFn: () => graphApi.getGraph({
      status: filters.status || undefined,
      entityType: filters.entityType || undefined,
      minConfidence: filters.minConfidence || undefined,
      datasetId: selectedDatasetId || undefined,
      search: searchQuery || undefined,
      limit: 500,
    }),
    enabled: !neighborhoodMode,
  });

  const { data: neighborhoodData, isLoading: neighLoading, refetch: refetchNeigh } = useQuery({
    queryKey: ['graph-neighborhood', selectedEntityId, neighborhoodDepth, filters],
    queryFn: () => graphApi.getNeighborhood(selectedEntityId!, neighborhoodDepth, {
      entityType: filters.entityType || undefined,
      minConfidence: filters.minConfidence || undefined,
    }),
    enabled: neighborhoodMode && !!selectedEntityId,
  });

  const currentGraph = neighborhoodMode ? neighborhoodData?.data : fullGraphData?.data;
  const isLoading = neighborhoodMode ? neighLoading : fullLoading;
  const isFetching = fullFetching;

  // 3. Fetch selected entity details
  const { data: entityData } = useQuery({
    queryKey: ['entity', selectedEntityId],
    queryFn: () => graphApi.getEntity(selectedEntityId!),
    enabled: !!selectedEntityId,
  });
  const entity: EntityDetail | undefined = entityData?.data;

  // Subgraph explanation mutation
  const { mutate: explainSubgraph, isPending: explaining } = useMutation({
    mutationFn: (ids: string[]) => aiApi.explainSubgraph(ids),
    onSuccess: (res) => {
      setExplanationData(res.data);
    },
    onError: (e: Error) => toast({ title: 'Explanation failed', description: e.message, variant: 'destructive' }),
  });

  // Clear Graph mutation
  const { mutate: clearGraph, isPending: clearingGraph } = useMutation({
    mutationFn: () => graphApi.clearGraph(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['graph'] });
      qc.invalidateQueries({ queryKey: ['datasets'] });
      refetchFull();
      toast({ title: 'Knowledge Graph Cleared', description: 'All triples and entities have been reset.', variant: 'default' });
    },
    onError: (e: Error) => toast({ title: 'Clear failed', description: e.message, variant: 'destructive' }),
  });

  // Convert graph data into layered React Flow nodes & directed edges
  useEffect(() => {
    if (!currentGraph) return;

    const entities: Entity[] = currentGraph.entities || [];
    const triples: Triple[] = currentGraph.triples || [];

    const layer1: Entity[] = [];
    const layer2: Entity[] = [];
    const layer3: Entity[] = [];
    const layer4: Entity[] = [];

    entities.forEach(e => {
      const type = (e.entityType || '').toUpperCase();
      if (type === 'PERSON' || type === 'STUDENT') {
        layer1.push(e);
      } else if (type === 'SUBJECT' || type === 'COURSE') {
        layer2.push(e);
      } else if (type === 'TOPIC' || type === 'SKILL') {
        layer3.push(e);
      } else {
        layer4.push(e);
      }
    });

    const flowNodes: Node[] = [];

    const arrangeLayer = (layerEntities: Entity[], xCoord: number, yStart = 60, yGap = 90) => {
      layerEntities.forEach((e, idx) => {
        flowNodes.push({
          id: e.id,
          type: 'entity',
          position: { x: xCoord, y: yStart + idx * yGap },
          data: {
            label: e.name,
            entityType: e.entityType,
            entity: e,
            isSelected: e.id === selectedEntityId || explainEntityIds.includes(e.id),
          },
        });
      });
    };

    if (layer1.length > 0 && (layer2.length > 0 || layer3.length > 0 || layer4.length > 0)) {
      arrangeLayer(layer1, 60, 60, 95);
      arrangeLayer(layer2, 380, 80, 110);
      arrangeLayer(layer3, 720, 60, 90);
      arrangeLayer(layer4, 1060, 100, 120);
    } else {
      const cols = Math.max(3, Math.ceil(Math.sqrt(entities.length)));
      entities.forEach((e, i) => {
        const x = (i % cols) * 260 + 60;
        const y = Math.floor(i / cols) * 140 + 60;
        flowNodes.push({
          id: e.id,
          type: 'entity',
          position: { x, y },
          data: {
            label: e.name,
            entityType: e.entityType,
            entity: e,
            isSelected: e.id === selectedEntityId || explainEntityIds.includes(e.id),
          },
        });
      });
    }

    const entityIds = new Set(entities.map(e => e.id));
    const flowEdges: Edge[] = triples
      .filter(t => t.subjectEntity?.id && t.objectEntity?.id && entityIds.has(t.subjectEntity.id) && entityIds.has(t.objectEntity.id))
      .map(t => ({
        id: t.id,
        source: t.subjectEntity.id,
        target: t.objectEntity.id,
        label: t.relation?.name,
        data: t,
        style: { stroke: isDark ? '#a855f7' : '#7c3aed', strokeWidth: 2 },
        labelStyle: { fill: isDark ? '#e9d5ff' : '#581c87', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' },
        labelBgStyle: {
          fill: isDark ? 'rgba(30, 27, 75, 0.95)' : 'rgba(245, 243, 255, 0.98)',
          fillOpacity: 0.98,
          stroke: isDark ? '#7c3aed' : '#c084fc',
          strokeWidth: 1,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [6, 3],
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: isDark ? '#a855f7' : '#7c3aed',
        },
      }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [currentGraph, selectedEntityId, explainEntityIds, isDark]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedEntityId(node.id);
    setSelectedEdgeData(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeData(edge.data);
  }, []);

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['graph'] });
    if (neighborhoodMode) refetchNeigh();
    else refetchFull();
    toast({ title: 'Graph Refreshed', description: 'Loaded latest entities & triples from MySQL', variant: 'success' });
  };

  const handleClearGraph = () => {
    if (window.confirm('Are you sure you want to clear all entities and triples from the Knowledge Graph? This cannot be undone.')) {
      clearGraph();
    }
  };

  const handleExportJSON = () => {
    if (!currentGraph) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentGraph, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `knowverse-knowledge-graph-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast({ title: 'Export Complete', description: 'Graph exported to JSON (Node-Link format)', variant: 'success' });
  };

  const handleExportCSV = () => {
    if (!currentGraph || !currentGraph.triples) return;
    let csv = 'Subject,Relation,Object,Confidence,Status\n';
    currentGraph.triples.forEach((t: any) => {
      csv += `"${t.subjectEntity?.name || ''}","${t.relation?.name || ''}","${t.objectEntity?.name || ''}",${t.confidence || 0},"${t.status || 'APPROVED'}"\n`;
    });
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `knowverse-triples-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast({ title: 'Export Complete', description: 'Triples exported to CSV format', variant: 'success' });
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link Copied', description: 'Shareable Knowledge Graph URL copied to clipboard', variant: 'default' });
  };

  const toggleEntityForExplanation = (id: string) => {
    setExplainEntityIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const entityCount = currentGraph?.entities?.length || 0;
  const edgeCount = currentGraph?.triples?.length || 0;

  return (
    <div className="space-y-4">
      {/* Top Header & Dataset Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Network className="w-6 h-6 text-primary" /> Interactive Knowledge Graph
            </h1>
            {neighborhoodMode && (
              <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/40">
                Neighborhood Mode ({neighborhoodDepth} Hops)
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            {entityCount} entities · {edgeCount} directed relationships
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {neighborhoodMode && (
            <button
              onClick={() => setNeighborhoodMode(false)}
              className="px-3 py-1.5 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold transition-all"
            >
              ← Back to Full Graph
            </button>
          )}

          {/* Dataset Selector */}
          {!neighborhoodMode && (
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedDatasetId}
                onChange={e => setSelectedDatasetId(e.target.value)}
                className="px-3 py-2 bg-secondary rounded-lg border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 font-medium text-foreground"
              >
                <option value="">🌐 All Datasets (Unified Graph)</option>
                {datasets.map(ds => (
                  <option key={ds.id} value={ds.id}>📁 {ds.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search entity..."
              className="pl-8 pr-3 py-2 bg-secondary rounded-lg border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 w-40 text-foreground"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs hover:bg-secondary text-foreground transition-colors disabled:opacity-50"
            title="Reload graph from MySQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export JSON / CSV Buttons */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-2 border border-border rounded-lg text-xs hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Export as JSON"
          >
            <Download className="w-3.5 h-3.5 text-primary" /> JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-2 border border-border rounded-lg text-xs hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Export Triples as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" /> CSV
          </button>

          {/* Share Link */}
          <button
            onClick={handleShareLink}
            className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Copy Shareable Graph Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear Graph Button */}
          {entityCount > 0 && !neighborhoodMode && (
            <button
              onClick={handleClearGraph}
              disabled={clearingGraph}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition-colors disabled:opacity-50"
              title="Clear all knowledge graph data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearingGraph ? 'Clearing...' : 'Clear'}
            </button>
          )}

          {/* Filters Toggle */}
          <button
            onClick={() => setFilterOpen(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs transition-colors ${
              filterOpen ? 'bg-primary text-white border-primary' : 'border-border hover:bg-secondary text-muted-foreground'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Multi-Entity Explain Banner */}
      {explainEntityIds.length >= 2 && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-semibold text-foreground">{explainEntityIds.length} Entities Selected for Path Explanation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => explainSubgraph(explainEntityIds)}
              disabled={explaining}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              {explaining ? 'Tracing Paths...' : 'Explain Connections'}
            </button>
            <button
              onClick={() => setExplainEntityIds([])}
              className="p-1.5 text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Graph Canvas */}
      <div className="relative" style={{ height: '70vh' }}>
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-border shadow-2xl bg-slate-100 dark:bg-slate-950 transition-colors">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Spinner className="w-8 h-8 text-primary" />
              <p className="text-sm text-muted-foreground">Loading Knowledge Graph from MySQL...</p>
            </div>
          ) : entityCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Network className="w-16 h-16 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-semibold text-foreground">No Entities Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                {selectedDatasetId
                  ? 'No approved triples found for this dataset. Go to NLP Workspace to extract and approve triples.'
                  : 'Your Knowledge Graph is currently empty. Run an extraction and approve candidate triples to populate the graph.'}
              </p>
              <Link
                to="/nlp"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to NLP Workspace
              </Link>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              className="bg-slate-100 dark:bg-slate-950"
              minZoom={0.2}
              maxZoom={2.5}
            >
              <Controls className="!bg-card !border-border [&_button]:!bg-secondary [&_button]:!text-foreground [&_button:hover]:!bg-accent" />
              <MiniMap
                className="!bg-card !border-border !rounded-lg"
                nodeColor={(n) => getEntityTypeColor(n.data?.entityType)}
                maskColor={isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(241, 245, 249, 0.75)'}
              />
              <Background variant={BackgroundVariant.Dots} color={isDark ? '#334155' : '#94a3b8'} gap={24} size={1.2} />
            </ReactFlow>
          )}
        </div>

        {/* Selected Entity Inspector Panel (Right Drawer) */}
        {selectedEntityId && entity && (
          <div className="absolute top-4 right-4 w-84 glass-card p-5 overflow-y-auto max-h-[calc(70vh-2rem)] z-10 rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold" style={{ color: getEntityTypeColor(entity.entityType) }}>
                  {entity.entityType}
                </span>
                <h3 className="font-bold text-base text-foreground truncate" title={entity.name}>
                  {entity.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntityId(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Multi-hop Neighborhood Trigger */}
            <div className="p-3 bg-secondary/80 rounded-xl border border-border/60 mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" /> Neighborhood Hops:
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      onClick={() => setNeighborhoodDepth(d)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        neighborhoodDepth === d ? 'bg-primary text-white' : 'bg-card text-muted-foreground'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setNeighborhoodMode(true)}
                className="w-full py-1.5 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Isolate Neighborhood Graph
              </button>
            </div>

            {/* Multi-Selection for Explanation */}
            <button
              onClick={() => toggleEntityForExplanation(entity.id)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border mb-3 flex items-center justify-center gap-1.5 transition-all ${
                explainEntityIds.includes(entity.id)
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                  : 'border-border hover:bg-secondary text-muted-foreground'
              }`}
            >
              {explainEntityIds.includes(entity.id) ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Selected for Multi-Entity Explanation
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Select for Path Explanation
                </>
              )}
            </button>

            {/* Outgoing Triples */}
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>Outgoing Relations ({entity.subjectTriples?.length || 0})</span>
                  <span className="text-[10px] text-primary">→ Source</span>
                </p>
                {entity.subjectTriples && entity.subjectTriples.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {entity.subjectTriples.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedEntityId(t.objectEntity.id)}
                        className="p-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 cursor-pointer transition-colors"
                      >
                        <span className="font-mono text-[10px] text-purple-400 font-semibold uppercase">{t.relation.name}</span>
                        <p className="font-medium text-foreground truncate mt-0.5">{t.objectEntity.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">No outgoing connections</p>
                )}
              </div>

              {/* Incoming Triples */}
              <div className="pt-2 border-t border-border/40">
                <p className="font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>Incoming Relations ({entity.objectTriples?.length || 0})</span>
                  <span className="text-[10px] text-blue-400">← Target</span>
                </p>
                {entity.objectTriples && entity.objectTriples.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {entity.objectTriples.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedEntityId(t.subjectEntity.id)}
                        className="p-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 cursor-pointer transition-colors"
                      >
                        <p className="font-medium text-foreground truncate">{t.subjectEntity.name}</p>
                        <span className="font-mono text-[10px] text-blue-400 font-semibold uppercase">↳ {t.relation.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">No incoming connections</p>
                )}
              </div>

              <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                Created on {formatDate(entity.createdAt)}
              </div>
            </div>
          </div>
        )}

        {/* Selected Edge Provenance Drawer */}
        {selectedEdgeData && (
          <div className="absolute top-4 left-4 w-84 glass-card p-5 overflow-y-auto max-h-[calc(70vh-2rem)] z-10 rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-3 border-b border-border/60 pb-2">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-primary">Knowledge Edge Provenance</span>
                <h4 className="font-bold text-sm text-foreground mt-0.5">
                  {selectedEdgeData.subjectEntity?.name} <span className="text-purple-400 font-mono">→ {selectedEdgeData.relation?.name} →</span> {selectedEdgeData.objectEntity?.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedEdgeData(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/60">
                <span className="text-muted-foreground">Confidence Score:</span>
                <span className="font-bold font-mono text-emerald-500">
                  {Math.round((selectedEdgeData.confidence || 0) * 100)}%
                </span>
              </div>

              <div className="p-2 rounded-lg bg-secondary/60 space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Source Document & Dataset:</span>
                <p className="font-semibold text-foreground truncate">
                  {selectedEdgeData.sourceDocument?.title || 'Direct Document'}
                </p>
              </div>

              {selectedEdgeData.sourceText && (
                <div className="p-2.5 rounded-lg bg-secondary/60 border border-border/40 space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">Source Snippet:</span>
                  <p className="italic text-foreground text-[11px] leading-relaxed">
                    "{selectedEdgeData.sourceText}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Status: <strong className="text-emerald-500 font-semibold">{selectedEdgeData.status || 'APPROVED'}</strong></span>
                <span>Model: <strong>{selectedEdgeData.extractionModel || 'Hybrid'}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanation Modal */}
      {explanationData && (
        <Dialog open={!!explanationData} onOpenChange={() => setExplanationData(null)}>
          <div className="p-6 space-y-4 max-w-lg">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Grounded Subgraph Explanation
            </h3>
            <div className="prose prose-invert text-xs space-y-3 text-foreground whitespace-pre-wrap">
              {explanationData.explanation}
            </div>
            <button
              onClick={() => setExplanationData(null)}
              className="w-full py-2 bg-primary text-white rounded-xl font-semibold text-xs hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </Dialog>
      )}

      {/* Legend Footer */}
      <div className="glass-card p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground font-medium">Entity Type Legend:</span>
        <div className="flex flex-wrap gap-4">
          {[
            ['PERSON / STUDENT', '#3b82f6'],
            ['SUBJECT / COURSE', '#8b5cf6'],
            ['TOPIC / CONCEPT', '#10b981'],
            ['DEPARTMENT / ORG', '#f59e0b'],
            ['ATTRIBUTE / GRADE', '#ec4899'],
            ['GENERAL ENTITY', '#64748b'],
          ].map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color as string }} />
              <span className="text-[11px] text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
