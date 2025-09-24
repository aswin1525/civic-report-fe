import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CreateIssuePage from './pages/CreateIssuePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import IssueDetailPage from './pages/IssueDetailPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Main />
      </HashRouter>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/" element={isAuthenticated ? <Layout><HomePage /></Layout> : <Navigate to="/auth" />} />
      <Route path="/create" element={isAuthenticated ? <Layout><CreateIssuePage /></Layout> : <Navigate to="/auth" />} />
      <Route path="/search" element={isAuthenticated ? <Layout><SearchPage /></Layout> : <Navigate to="/auth" />} />
      <Route path="/profile" element={isAuthenticated ? <Layout><ProfilePage /></Layout> : <Navigate to="/auth" />} />
      <Route path="/profile/:userId" element={isAuthenticated ? <Layout><ProfilePage /></Layout> : <Navigate to="/auth" />} />
      <Route path="/issue/:id" element={isAuthenticated ? <Layout><IssueDetailPage /></Layout> : <Navigate to="/auth" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth"} />} />
    </Routes>
  );
};

export default App;