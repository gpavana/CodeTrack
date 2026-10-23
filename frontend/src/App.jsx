import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemListPage } from './pages/ProblemListPage';
import { AddProblemPage } from './pages/AddProblemPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { EditProblemPage } from './pages/EditProblemPage';
import { RevisionCenterPage } from './pages/RevisionCenterPage';
import { TopicsProgressPage } from './pages/TopicsProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Layout for Unauthenticated Users */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated Layout */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/problems" element={<ProblemListPage />} />
              <Route path="/problems/new" element={<AddProblemPage />} />
              <Route path="/problems/:id" element={<ProblemDetailPage />} />
              <Route path="/problems/:id/edit" element={<EditProblemPage />} />
              <Route path="/revisions" element={<RevisionCenterPage />} />
              <Route path="/topics" element={<TopicsProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
