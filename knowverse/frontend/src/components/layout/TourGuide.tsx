import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Database, Brain, Network,
  BarChart2, GraduationCap, Bot, GitBranch,
  ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2,
  ExternalLink
} from 'lucide-react';

export interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  route: string;
  icon: any;
  tip: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: '1. Platform Dashboard',
    subtitle: 'High-level knowledge discovery overview',
    description: 'Monitor your total dataset files, active graph entities, approved relational triples, pending review queue, and real-time activity stream.',
    route: '/dashboard',
    icon: LayoutDashboard,
    tip: 'Check your quick statistics to gauge knowledge graph health at a glance.',
  },
  {
    title: '2. Datasets & Document Corpus',
    subtitle: 'Upload and manage source data',
    description: 'Upload CSV tables, student records, or unstructured text documents. KnowVerse parses schemas and stores documents ready for AI processing.',
    route: '/datasets',
    icon: Database,
    tip: 'Click on any dataset card to inspect raw documents and start extraction runs.',
  },
  {
    title: '3. NLP Extraction Workspace',
    subtitle: 'AI-driven entity & relation discovery',
    description: 'Run Hybrid spaCy and rule-based NLP extraction on documents. Inspect candidate Subject-Relation-Object triples with confidence scores and approve them into the verified Knowledge Graph.',
    route: '/nlp',
    icon: Brain,
    tip: 'Only approved triples enter the active graph. Green checkmark approves, Red X rejects.',
  },
  {
    title: '4. Knowledge Graph Explorer',
    subtitle: 'Interactive multi-hop visual exploration',
    description: 'Explore the full interactive canvas. Click on nodes to isolate 1-hop, 2-hop, or 3-hop neighborhoods. Click directed edges to view extraction provenance citations and source documents.',
    route: '/graph',
    icon: Network,
    tip: 'Use the top search bar to jump straight to any entity node.',
  },
  {
    title: '5. Analytics & Community Clusters',
    subtitle: 'Graph density, hubs & semantic domains',
    description: 'Inspect graph structural density, isolated nodes, top-degree hub rankings, and automatic semantic community clusters (AI/ML, CS Core, Student Network).',
    route: '/analytics',
    icon: BarChart2,
    tip: 'Click any community card to isolate that specific topic cluster on the graph canvas.',
  },
  {
    title: '6. Student Knowledge Profiles',
    subtitle: 'Mastery radars & career readiness',
    description: 'Inspect multi-domain mastery radar charts, evaluate target career readiness scores (MLE, Full-Stack, Data Science), and generate automated personalized learning pathways.',
    route: '/students',
    icon: GraduationCap,
    tip: 'Skill gaps are computed dynamically against industry benchmark curriculum paths.',
  },
  {
    title: '7. Grounded AI Assistant & Website Tutor',
    subtitle: 'Natural-language discovery & guidance',
    description: 'Ask questions about your data with strict zero-hallucination grounding. Also acts as an intelligent website tutor providing step-by-step guidance for every page.',
    route: '/ai-assistant',
    icon: Bot,
    tip: 'Toggle between Beginner and Expert modes or save valuable insights.',
  },
  {
    title: '8. Graph Admin & Undo Rollback',
    subtitle: 'Entity resolution, merge & revision control',
    description: 'Scan for candidate duplicate entities, execute transactional merges, and click "Undo Change" to instantly roll back any graph modification.',
    route: '/admin/graph',
    icon: GitBranch,
    tip: 'Every graph operation is snapshotted atomically in MySQL.',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TourGuide({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('knowverse_tour_completed', 'true');
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleJumpToFeature = () => {
    navigate(step.route);
    localStorage.setItem('knowverse_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Guided Platform Tour · Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('knowverse_tour_completed', 'true');
              onClose();
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-primary/90">{step.subtitle}</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{step.description}</p>

          <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border/60 text-xs flex items-start gap-2.5">
            <span className="text-primary font-bold text-sm">💡</span>
            <div>
              <span className="font-semibold text-foreground">Pro-Tip: </span>
              <span className="text-muted-foreground">{step.tip}</span>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToFeature}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition-all"
            >
              Open Page <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              {isLast ? (
                <>Finish Tour <CheckCircle2 className="w-3.5 h-3.5" /></>
              ) : (
                <>Next Step <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
