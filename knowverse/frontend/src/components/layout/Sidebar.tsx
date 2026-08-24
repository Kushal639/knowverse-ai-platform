import { NavLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  LayoutDashboard, Database, Brain, Network, Bot,
  MessageSquare, User, Shield, Users, GitBranch,
  FileText, ClipboardList, LogOut, ChevronLeft,
  ChevronRight, X, BarChart2, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Datasets', icon: Database, to: '/datasets' },
  { label: 'NLP Extraction', icon: Brain, to: '/nlp' },
  { label: 'Knowledge Graph', icon: Network, to: '/graph' },
  { label: 'Analytics & Clusters', icon: BarChart2, to: '/analytics' },
  { label: 'Student Profiles', icon: GraduationCap, to: '/students' },
  { label: 'AI Assistant', icon: Bot, to: '/ai-assistant' },
  { label: 'Feedback', icon: MessageSquare, to: '/feedback' },
  { label: 'Profile', icon: User, to: '/profile' },
];

const adminItems = [
  { label: 'Admin Overview', icon: Shield, to: '/admin' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Graph Admin & Resolution', icon: GitBranch, to: '/admin/graph' },
  { label: 'Feedback', icon: FileText, to: '/admin/feedback' },
  { label: 'Audit Logs', icon: ClipboardList, to: '/admin/audit-logs' },
];

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onMobileClose }: Props) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: logout } = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => { clearAuth(); navigate('/login'); },
  });

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      // Mobile
      'md:relative md:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    )}>
      {/* Header */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">KnowVerse</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button onClick={onMobileClose} className="md:hidden p-1.5 rounded-md hover:bg-accent">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className={cn('pt-4 pb-2 px-3', collapsed && 'px-1')}>
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
              )}
              {collapsed && <div className="border-t border-border" />}
            </div>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={onMobileClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className={cn('border-t border-border p-4', collapsed && 'p-2')}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
