import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot, Send, Plus, Database, Sparkles, ShieldCheck,
  ExternalLink, Layers, ArrowRight, BookOpen, Network,
  Cpu, Code2, Building2, HelpCircle, Bookmark, Copy,
  Check, Trash2, ArrowUpRight, Compass, Settings2,
  ListOrdered, HelpCircleIcon
} from 'lucide-react';
import { aiApi } from '@/api/index';
import { Spinner, Badge } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { AiConversation, AiMessage } from '@/types';
import TourGuide from '@/components/layout/TourGuide';

const CATEGORIES = [
  {
    id: 'graph',
    label: 'Knowledge Graph',
    icon: Network,
    prompts: [
      'Which students study Machine Learning?',
      'How is Rohan Desai connected to Classification?',
      'What are the most connected entities in this graph?',
      'Show all verified student knowledge relationships',
    ],
  },
  {
    id: 'guide',
    label: 'Website Guide',
    icon: Compass,
    prompts: [
      'How do I upload a dataset?',
      'How do I extract entities and approve relationships?',
      'How do I explore the knowledge graph?',
      'How do I merge duplicate entities and undo changes?',
    ],
  },
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    icon: Cpu,
    prompts: [
      'Explain Transformers and the Self-Attention mechanism',
      'What is the difference between CNN and RNN/LSTM?',
      'How does Gradient Descent and Backpropagation work?',
      'What are techniques to prevent Overfitting in Deep Learning?',
    ],
  },
  {
    id: 'dsa',
    label: 'Algorithms & Data Structures',
    icon: Code2,
    prompts: [
      "How does Dijkstra's shortest path algorithm work?",
      'Explain Graph Traversal: BFS vs DFS with time complexity',
      'What are Binary Search Trees (BST) and self-balancing trees?',
      'Explain Dynamic Programming: Memoization vs Tabulation',
    ],
  },
  {
    id: 'infosys',
    label: 'Infosys Milestones',
    icon: Building2,
    prompts: [
      'What are the key historical milestones of Infosys?',
      'Who founded Infosys and when was it established?',
      'What is the Infosys Global Delivery Model and Finacle?',
    ],
  },
];

export default function AIAssistant() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('graph');
  const [mode, setMode] = useState<'beginner' | 'expert'>('beginner');
  const [tourOpen, setTourOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: convsData } = useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: aiApi.getConversations,
  });
  const conversations: AiConversation[] = convsData?.data || [];

  const { data: insightsData, refetch: refetchInsights } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: aiApi.getSavedInsights,
  });
  const savedInsights = insightsData?.data || [];

  const { mutate: deleteConv } = useMutation({
    mutationFn: (id: string) => aiApi.deleteConversation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      if (convId) {
        setConvId(null);
        setMessages([]);
      }
      toast({ title: 'Conversation deleted', variant: 'success' });
    },
  });

  const { mutate: saveInsight, isPending: savingInsight } = useMutation({
    mutationFn: (args: { question: string; answer: string; sources?: any; metadata?: any }) =>
      aiApi.saveInsight(args),
    onSuccess: () => {
      refetchInsights();
      toast({ title: 'Insight saved to your library', variant: 'success' });
    },
  });

  const { mutate: deleteInsight } = useMutation({
    mutationFn: (id: string) => aiApi.deleteSavedInsight(id),
    onSuccess: () => {
      refetchInsights();
      toast({ title: 'Saved insight removed', variant: 'success' });
    },
  });

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: (msg: string) => aiApi.chat(msg, convId || undefined, location.pathname, mode),
    onSuccess: (data) => {
      const res = data.data;
      if (!convId) setConvId(res.conversationId);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ASSISTANT' as const,
          content: res.message,
          metadata: {
            answerType: res.answerType,
            confidence: res.confidence,
            confidenceScore: res.confidenceScore,
            graphContext: res.graphContext,
            sources: res.sources,
            directFacts: res.directFacts,
            graphPaths: res.graphPaths,
            groundedFacts: res.groundedFacts,
            suggestedQuestions: res.suggestedQuestions,
            actionButtons: res.actionButtons,
            steps: res.steps,
            relatedEntities: res.relatedEntities,
          },
          createdAt: new Date().toISOString(),
        }
      ]);
      qc.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
    onError: (e: Error) => toast({ title: 'Query Failed', description: e.message, variant: 'destructive' }),
  });

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || sending) return;
    const userMsg: AiMessage = {
      id: Date.now().toString(),
      role: 'USER',
      content: query,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    sendMessage(query);
    if (!textToSend) setInput('');
  };

  const loadConversation = async (id: string) => {
    const data = await aiApi.getConversation(id);
    setConvId(id);
    setMessages(data.data?.messages || []);
    setShowInsights(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Answer copied to clipboard', variant: 'success' });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const activeCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4 relative">
      <TourGuide isOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Conversation & Insights Sidebar */}
      <div className="w-64 shrink-0 flex flex-col glass-card">
        <div className="p-3 border-b border-border space-y-2">
          <button
            onClick={() => { setConvId(null); setMessages([]); setShowInsights(false); }}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => setShowInsights(false)}
              className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                !showInsights ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              Chats ({conversations.length})
            </button>
            <button
              onClick={() => setShowInsights(true)}
              className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                showInsights ? 'bg-secondary text-primary font-bold' : 'text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              <Bookmark className="w-3 h-3" /> Saved ({savedInsights.length})
            </button>
          </div>
        </div>

        {/* Sidebar list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {showInsights ? (
            savedInsights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                <Bookmark className="w-6 h-6 mx-auto opacity-40 mb-1" />
                <p>No saved insights</p>
                <p className="text-[10px] opacity-70">Click "Save Insight" on any answer to bookmark it here.</p>
              </div>
            ) : (
              savedInsights.map((insight: any) => (
                <div key={insight.id} className="p-2.5 rounded-xl bg-secondary/60 border border-border/50 text-xs space-y-1 group">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground truncate">{insight.question}</p>
                    <button
                      onClick={() => deleteInsight(insight.id)}
                      className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{insight.answer}</p>
                </div>
              ))
            )
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No previous chats</p>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group ${
                  convId === c.id
                    ? 'bg-primary/15 border border-primary/40 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <button
                  onClick={() => loadConversation(c.id)}
                  className="flex-1 text-left truncate mr-1.5"
                >
                  <p className="truncate">{c.title}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{c._count?.messages || 0} messages</p>
                </button>
                <button
                  onClick={() => deleteConv(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 p-1 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-border/80 flex items-center justify-between bg-card/60">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">KnowVerse Grounded AI Assistant</h2>
            <span className="text-[10px] text-muted-foreground">· Strict RAG + Website Guide</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Beginner / Expert Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary/80 px-2 py-1 rounded-xl border border-border text-[11px]">
              <Settings2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground text-[10px]">Mode:</span>
              <button
                onClick={() => setMode('beginner')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  mode === 'beginner' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setMode('expert')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  mode === 'expert' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Expert
              </button>
            </div>

            {/* Interactive Tour Button */}
            <button
              onClick={() => setTourOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3 h-3" /> Take a Tour
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3 shadow-lg shadow-primary/15">
                <Bot className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">How can I help you today?</h2>
              <p className="text-muted-foreground text-xs max-w-md mb-5">
                Ask questions about your MySQL Knowledge Graph, multi-hop paths, or get step-by-step guidance on using KnowVerse.
              </p>

              {/* Category selector pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Suggested Questions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {activeCategory.prompts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-left p-3 rounded-xl bg-secondary/60 border border-border/70 hover:border-primary/50 hover:bg-secondary text-xs text-foreground/90 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate mr-2 font-medium">{s}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, mIdx) => {
            const meta = msg.metadata || {};
            const isFact = meta.answerType === 'KNOWVERSE_FACT';
            const isGuide = meta.answerType === 'WEBSITE_GUIDE';
            const isUnknown = meta.answerType === 'UNKNOWN';

            return (
              <div key={msg.id || mIdx} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ASSISTANT' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4.5 space-y-3.5 shadow-sm ${
                  msg.role === 'USER'
                    ? 'bg-primary text-white ml-12 rounded-tr-sm'
                    : 'bg-card border border-border/80 text-foreground mr-12 rounded-tl-sm'
                }`}>
                  {/* Category / Confidence Header Badge for Assistant */}
                  {msg.role === 'ASSISTANT' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        {isFact ? (
                          <Badge variant="success" className="text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Grounded KnowVerse Fact
                          </Badge>
                        ) : isGuide ? (
                          <Badge variant="default" className="text-[10px] flex items-center gap-1">
                            <Compass className="w-3 h-3" /> Website Guide & Workflow
                          </Badge>
                        ) : isUnknown ? (
                          <Badge variant="warning" className="text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Zero-Hallucination Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> General CS / AI Knowledge
                          </Badge>
                        )}

                        {meta.confidence && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Confidence: <strong className="text-foreground">{meta.confidence}</strong>
                            {meta.confidenceScore ? ` (${meta.confidenceScore}%)` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id || mIdx.toString())}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Copy Answer"
                        >
                          {copiedId === (msg.id || mIdx.toString()) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const prevUserMsg = messages.slice(0, mIdx).filter(m => m.role === 'USER').pop()?.content || 'Insight';
                            saveInsight({
                              question: prevUserMsg,
                              answer: msg.content,
                              sources: meta.sources,
                              metadata: meta,
                            });
                          }}
                          disabled={savingInsight}
                          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                          title="Save Insight"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Step-by-Step Guidance List */}
                  {meta.steps && meta.steps.length > 0 && (
                    <div className="p-3 bg-secondary/60 rounded-xl border border-border/60 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5" /> Guided Action Steps:
                      </div>
                      <div className="space-y-1 text-xs">
                        {meta.steps.map((st: string, sIdx: number) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="text-foreground/90">{st.replace(/^\d+\.\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Navigation Buttons */}
                  {meta.actionButtons && meta.actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {meta.actionButtons.map((btn: any, bIdx: number) => (
                        <button
                          key={bIdx}
                          onClick={() => navigate(btn.route)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                        >
                          {btn.label} <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Direct Verified Triples Section */}
                  {meta.directFacts && meta.directFacts.length > 0 && (
                    <div className="p-3 bg-secondary/60 rounded-xl border border-border/60 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Network className="w-3 h-3 text-primary" /> Verified Grounded Triples
                        </span>
                        <button
                          onClick={() => navigate('/graph')}
                          className="text-primary hover:underline text-[10px] font-semibold flex items-center gap-0.5"
                        >
                          Open in Graph <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {meta.directFacts.map((f: any, fIdx: number) => (
                          <div key={fIdx} className="p-2 rounded-lg bg-card/80 border border-border/50 text-[11px] flex items-center justify-between">
                            <span className="truncate font-medium text-foreground">
                              {f.subject} <span className="text-primary font-mono font-semibold">→ {f.relation} →</span> {f.object}
                            </span>
                            <span className="text-[10px] text-emerald-500 font-mono font-bold shrink-0 ml-1.5">
                              {f.confidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source Citations Section */}
                  {meta.sources && meta.sources.length > 0 && (
                    <div className="pt-2 border-t border-border/50 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-primary" /> Source Provenance Citations:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meta.sources.map((s: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            onClick={() => navigate('/datasets')}
                            className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/60 text-[10px] space-y-0.5 max-w-[240px] cursor-pointer transition-colors"
                          >
                            <div className="font-semibold text-foreground truncate flex items-center justify-between">
                              <span className="truncate">{s.datasetName || 'Dataset'}</span>
                              <span className="text-emerald-500 font-mono ml-1">{s.confidence}%</span>
                            </div>
                            <p className="text-muted-foreground truncate">{s.documentTitle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Suggested Inquiries */}
                  {meta.suggestedQuestions && meta.suggestedQuestions.length > 0 && (
                    <div className="pt-2 border-t border-border/50 space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Suggested Follow-ups:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.suggestedQuestions.map((q: string, qIdx: number) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(q)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/15 hover:text-primary border border-border text-foreground/80 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
                <Spinner className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Querying Knowledge Graph & verifying provenance citations...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-border p-4 bg-card/50">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask KnowVerse anything about your knowledge graph, paths, or website guide... (Press Enter)`}
              className="flex-1 px-4 py-3 bg-secondary rounded-xl border border-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none max-h-32 text-foreground placeholder:text-muted-foreground"
              rows={2}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-primary/20 shrink-0"
            >
              {sending ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
