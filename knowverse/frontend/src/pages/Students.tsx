import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap, Search, ArrowRight, UserCheck, BookOpen,
  Award, Sparkles, Building, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentsApi } from '@/api/index';
import { Spinner, Badge, StatCard } from '@/components/ui';

export default function Students() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students-list', search],
    queryFn: () => studentsApi.list(search || undefined),
  });

  const students = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <GraduationCap className="w-6 h-6 text-primary" /> Student Knowledge Profiles
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Knowledge mastery, enrolled subjects, mastered topics, and AI skill gap analysis.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student by name..."
            className="pl-9 pr-4 py-2 bg-secondary rounded-xl border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 w-full text-foreground"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Spinner className="w-8 h-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading student knowledge graph profiles...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3 rounded-2xl">
          <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Student Records Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Upload student datasets (such as CSVs with student, subject, topic, grade) and run extraction in the NLP Workspace.
          </p>
          <Link
            to="/nlp"
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all inline-block"
          >
            Go to NLP Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((st: any) => (
            <div
              key={st.id}
              className="glass-card p-5 rounded-2xl space-y-4 hover:border-primary/50 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-sm">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {st.name}
                      </h3>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3" /> {st.department}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {st.totalRelations} Facts
                  </Badge>
                </div>

                {/* Enrolled Subjects */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Subjects / Courses:</span>
                  <div className="flex flex-wrap gap-1">
                    {st.subjects.slice(0, 3).map((sub: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                        {sub}
                      </span>
                    ))}
                    {st.subjects.length > 3 && (
                      <span className="text-[10px] text-muted-foreground self-center">+{st.subjects.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Mastered Topics */}
                {st.topics.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Topics & Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {st.topics.slice(0, 3).map((top: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          {top}
                        </span>
                      ))}
                      {st.topics.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">+{st.topics.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/students/${st.id}`}
                className="w-full py-2 bg-secondary hover:bg-primary hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all mt-2 text-foreground"
              >
                <span>View Knowledge Profile & Skill Gap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
