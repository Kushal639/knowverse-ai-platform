import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/Toaster';

// Public Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Protected Pages
import Dashboard from '@/pages/Dashboard';
import Datasets from '@/pages/Datasets';
import DatasetDetail from '@/pages/DatasetDetail';
import Documents from '@/pages/Documents';
import NLPWorkspace from '@/pages/NLPWorkspace';
import GraphExplorer from '@/pages/GraphExplorer';
import AIAssistant from '@/pages/AIAssistant';
import Analytics from '@/pages/Analytics';
import Students from '@/pages/Students';
import StudentDetail from '@/pages/StudentDetail';
import Profile from '@/pages/Profile';
import Feedback from '@/pages/Feedback';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminGraph from '@/pages/admin/AdminGraph';
import AdminFeedback from '@/pages/admin/AdminFeedback';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';

// Auth components
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AppInitializer() {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const { data, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (data?.success) {
      setAuth(data.data, useAuthStore.getState().token || '');
    }
  }, [data, setAuth]);

  useEffect(() => {
    if (isError) {
      clearAuth();
    }
  }, [isError, clearAuth]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes inside AppLayout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/datasets/:id" element={<DatasetDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/nlp" element={<NLPWorkspace />} />
          <Route path="/graph" element={<GraphExplorer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/graph" element={<ProtectedRoute adminOnly><AdminGraph /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute adminOnly><AdminFeedback /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute adminOnly><AdminAuditLogs /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
