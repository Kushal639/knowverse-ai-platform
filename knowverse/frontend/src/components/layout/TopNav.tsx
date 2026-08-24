import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Menu, Bell, Search, Network, Database, FileText, CheckCircle2,
  Clock, ArrowRight, X, ExternalLink, Sun, Moon, Brain, Shield,
  Check, Trash2, Zap, AlertCircle, HelpCircle, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { graphApi } from '@/api/graph.api';
import { datasetsApi } from '@/api/datasets.api';
import { notificationsApi } from '@/api/index';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import TourGuide from '@/components/layout/TourGuide';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/datasets': 'Datasets',
  '/documents': 'Documents',
  '/nlp': 'NLP Workspace',
  '/graph': 'Knowledge Graph',
  '/analytics': 'Analytics & Clusters',
  '/students': 'Student Profiles',
  '/ai-assistant': 'AI Assistant',
  '/profile': 'Profile',
  '/feedback': 'Feedback',
  '/admin': 'Admin Overview',
  '/admin/users': 'User Management',
  '/admin/graph': 'Graph Administration',
  '/admin/feedback': 'Feedback Management',
  '/admin/audit-logs': 'Audit Logs',
};

interface Props {
  onMobileMenuClick: () => void;
}

export default function TopNav({ onMobileMenuClick }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Search queries
  const { data: entityResults } = useQuery({
    queryKey: ['global-search-entities', searchTerm],
    queryFn: () => graphApi.getEntities({ search: searchTerm, limit: 6 }),
    enabled: searchTerm.trim().length >= 2,
  });

  const { data: datasetResults } = useQuery({
    queryKey: ['global-search-datasets', searchTerm],
    queryFn: () => datasetsApi.list({ search: searchTerm }),
    enabled: searchTerm.trim().length >= 2,
  });

  // Dedicated Live Notifications query
  const { data: notifsData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(30),
    refetchInterval: 5000,
  });

  const notifications = notifsData?.data?.notifications || [];
  const unreadCount = notifsData?.data?.unreadCount || 0;

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const { mutate: clearAll } = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const entities = entityResults?.data?.entities || [];
  const datasets = datasetResults?.data?.datasets || [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchFocused(false);
    navigate(`/graph`);
  };

  const handleSelectEntity = (entityName: string) => {
    setSearchFocused(false);
    setSearchTerm('');
    navigate(`/graph`);
  };

  const handleSelectDataset = (datasetId: string) => {
    setSearchFocused(false);
    setSearchTerm('');
    navigate(`/datasets/${datasetId}`);
  };

  const handleNotificationClick = (notif: any) => {
    markRead(notif.id);
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const pageLabel = Object.entries(routeLabels)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'KnowVerse';

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-4 shrink-0 relative z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:block">KnowVerse</span>
        <span className="text-muted-foreground hidden sm:block">/</span>
        <span className="text-sm font-medium text-foreground">{pageLabel}</span>
      </div>

      <div className="flex-1" />

      {/* Interactive Global Search bar */}
      <div ref={searchRef} className="relative hidden md:block w-72">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search entities, datasets..."
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full text-foreground"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Search Results Dropdown */}
        {searchFocused && searchTerm.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto space-y-3">
            {/* Entities Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1">
                <Network className="w-3 h-3 text-primary" /> Graph Entities
              </p>
              {entities.length > 0 ? (
                <div className="space-y-1">
                  {entities.map((e: any) => (
                    <button
                      key={e.id}
                      onClick={() => handleSelectEntity(e.name)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-secondary flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-foreground truncate">{e.name}</span>
                      <span className="text-[10px] text-primary font-mono uppercase">{e.entityType || 'ENTITY'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground px-2 py-1">No matching entities</p>
              )}
            </div>

            {/* Datasets Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1">
                <Database className="w-3 h-3 text-purple-400" /> Datasets
              </p>
              {datasets.length > 0 ? (
                <div className="space-y-1">
                  {datasets.map((d: any) => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDataset(d.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-secondary flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-foreground truncate">{d.name}</span>
                      <span className="text-[10px] text-muted-foreground">{d.fileType || 'CSV'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground px-2 py-1">No datasets found</p>
              )}
            </div>

            <div className="border-t border-border/50 pt-1.5 px-2">
              <Link
                to="/graph"
                onClick={() => setSearchFocused(false)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Open in Knowledge Graph <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Live Activity & Notifications Center */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className={`relative p-2 rounded-lg border transition-colors ${
            notifOpen ? 'bg-primary/20 border-primary text-primary' : 'border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
          title="All Activity & Action Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Popover */}
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-84 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 z-50 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-primary" />
                <h4 className="font-semibold text-xs text-foreground">Action Notifications</h4>
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0">{unreadCount} new</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-[10px] text-primary hover:underline font-medium"
                    title="Mark all as read"
                  >
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearAll()}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
                    title="Clear notifications"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n: any) => {
                  const isExtraction = n.type === 'EXTRACTION';
                  const isGraph = n.type === 'GRAPH';

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                        !n.isRead
                          ? 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                          : 'bg-secondary/50 border-border/40 hover:bg-secondary text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {isExtraction ? (
                            <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          ) : isGraph ? (
                            <Network className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          <span className={`text-xs font-semibold truncate max-w-[170px] ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground shrink-0 font-mono">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                        {n.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
                <Bell className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                <p>No notifications yet</p>
                <p className="text-[10px] text-muted-foreground/70">Any action you perform across KnowVerse will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Platform Tour & Help Guide Button */}
      <button
        onClick={() => setTourOpen(true)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all"
        title="Interactive Platform Tour & Guide"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Take a Tour</span>
      </button>

      {/* Theme Toggle Button (Light/Dark Mode) */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        title={`Switch to ${theme === 'dark' ? 'Bright / Light' : 'Dark'} Mode`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-200" />
        )}
      </button>

      {/* User profile avatar */}
      {user && (
        <Link
          to="/profile"
          className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
          title={`Signed in as ${user.name} (${user.email})`}
        >
          {user.name.slice(0, 2).toUpperCase()}
        </Link>
      )}

      {/* Interactive Tour Guide Modal */}
      <TourGuide isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </header>
  );
}
