import { Link } from 'react-router-dom';
import { Network, Brain, Bot, Shield, Database, ArrowRight, Github } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">KnowVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link to="/register" className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-8">
          <span>✨</span>
          <span>AI-Powered Knowledge Graph Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Explore Knowledge with{' '}
          <span className="gradient-text">Artificial Intelligence</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Upload documents, extract knowledge triples automatically using NLP, visualize relationships as interactive graphs, and query your knowledge base with AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow"
          >
            Start Exploring <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-accent transition-colors"
          >
            Demo Login
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Demo: <code className="bg-secondary px-2 py-0.5 rounded text-xs">demo@knowverse.dev</code> / <code className="bg-secondary px-2 py-0.5 rounded text-xs">Demo@1234</code>
        </p>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Database, title: 'Dataset Management', desc: 'Upload CSV, TXT, PDF, DOCX files or paste text directly. Manage and version your data sources.', color: 'text-blue-400' },
            { icon: Brain, title: 'NLP Extraction', desc: 'Automatically extract entities, relations, and knowledge triples from your documents with review workflow.', color: 'text-purple-400' },
            { icon: Network, title: 'Knowledge Graph', desc: 'Interactive directed graph visualization with zoom, filtering, entity panels, and neighborhood exploration.', color: 'text-green-400' },
            { icon: Bot, title: 'AI Assistant', desc: 'Ask natural language questions about your knowledge graph. Get graph-grounded answers with source citations.', color: 'text-orange-400' },
          ].map((f) => (
            <div key={f.title} className="glass-card p-6 hover:border-primary/30 transition-colors">
              <div className={`w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center mb-4`} style={{ backgroundColor: `${f.color.includes('blue') ? '#3b82f620' : f.color.includes('purple') ? '#8b5cf620' : f.color.includes('green') ? '#10b98120' : '#f59e0b20'}` }}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            { icon: Shield, title: 'Security First', desc: 'JWT authentication, bcrypt passwords, RBAC, rate limiting, and audit logging. No plaintext secrets.' },
            { icon: Bot, title: 'Review Workflow', desc: 'Every AI extraction goes through human review before entering the trusted knowledge graph.' },
            { icon: Github, title: 'Open Architecture', desc: 'Modular backend, pluggable AI providers (Gemini, OpenAI, or none), and exportable graph data.' },
          ].map((f) => (
            <div key={f.title} className="glass-card p-6">
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>KnowVerse — AI-Powered Knowledge Explorer · Built for Infosys Springboard 6.0</p>
      </footer>
    </div>
  );
}
