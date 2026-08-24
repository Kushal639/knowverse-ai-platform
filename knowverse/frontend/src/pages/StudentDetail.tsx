import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap, ArrowLeft, Building, Target, CheckCircle2,
  AlertCircle, ArrowRight, BookOpen, Award, Sparkles, Compass
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { studentsApi } from '@/api/index';
import { Spinner, Badge } from '@/components/ui';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedRole, setSelectedRole] = useState('ml-engineer');

  const { data, isLoading } = useQuery({
    queryKey: ['student-profile', id, selectedRole],
    queryFn: () => studentsApi.getProfile(id!, selectedRole),
    enabled: !!id,
  });

  const profile = data?.data;
  const student = profile?.student;
  const mastery = profile?.knowledgeMastery || [];
  const skillGap = profile?.skillGap;
  const availableRoles = profile?.availableRoles || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-sm text-muted-foreground">Calculating student knowledge mastery & skill gap analysis...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">Student Not Found</h3>
        <Link to="/students" className="text-xs text-primary hover:underline">← Back to Students Directory</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Student Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to="/students" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Students
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-base">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-primary" /> {student.department} · {student.totalTriples} Verified Knowledge Triples
              </span>
            </div>
          </div>
        </div>

        {/* Target Role Selector for Gap Analysis */}
        <div className="p-3 bg-secondary/80 rounded-2xl border border-border/80 space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3 text-primary" /> Target Career Role:
          </label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 bg-card rounded-lg border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            {availableRoles.map((r: any) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mastery Radar & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Area Radar Chart */}
        <div className="glass-card p-6 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" /> Multi-Domain Knowledge Mastery
            </h3>
            <Badge variant="default" className="text-[10px]">Graph Derived</Badge>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={mastery}>
                <PolarGrid stroke="#334155" opacity={0.3} />
                <PolarAngleAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="Mastery %" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Analysis Card */}
        <div className="glass-card p-6 space-y-4 rounded-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Skill Gap Analysis: {skillGap?.targetRole}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{skillGap?.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-400">{skillGap?.readinessScore}%</span>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Role Readiness</p>
              </div>
            </div>

            {/* Acquired Skills */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Acquired Graph Competencies ({skillGap?.acquiredSkills?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.acquiredSkills?.map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-1.5 pt-2 border-t border-border/40">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Missing Prerequisites to Acquire ({skillGap?.missingSkills?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.missingSkills?.map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold text-xs border border-amber-500/20">
                    ! {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Learning Path */}
      {skillGap?.learningPath && skillGap.learningPath.length > 0 && (
        <div className="glass-card p-6 space-y-4 rounded-2xl">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Recommended Next Learning Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {skillGap.learningPath.map((step: any) => (
              <div key={step.step} className="p-4 rounded-xl bg-secondary/60 border border-border/70 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    {step.step}
                  </span>
                  <h4 className="font-bold text-xs text-foreground">{step.skill}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
