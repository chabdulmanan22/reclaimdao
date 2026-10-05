import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OwnerAuthProvider } from './contexts/OwnerAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contribute from './pages/Contribute';
import Voting from './pages/Voting';
import Referral from './pages/Referral';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ContactUs from './pages/ContactUs';
import WhitePaper from './pages/WhitePaper';
import ArticleDetail from './pages/ArticleDetail';
import ScamAlertsResourcePage from './pages/resources/ScamAlertsResourcePage';
import RefundProgramsResourcePage from './pages/resources/RefundProgramsResourcePage';
import HowRefundsResourcePage from './pages/resources/HowRefundsResourcePage';
import JoinNotice from './pages/JoinNotice';
import JoinDetails from './pages/JoinDetails';
import JoinContact from './pages/JoinContact';
import JoinLoss from './pages/JoinLoss';
import JoinThankYou from './pages/JoinThankYou';
import JoinSubmitted from './pages/JoinSubmitted';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

import OwnerLogin from './pages/admin/OwnerLogin';
import OwnerControlPanel from './pages/admin/OwnerControlPanel';
import OwnerProtectedRoute from './components/OwnerProtectedRoute';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import './index.css';

// Protected Route Component (for regular users)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#fcb420] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#fcb420] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    const search = location.state?.from?.search || "";
    return <Navigate to={`${from}${search}`} replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navbar />
      <main className="pt-20 flex-1">
        <div className="w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};




const FaviconSetter = () => {
  React.useEffect(() => {
    document.title = "ReclaimDAO - Reclaim What Is Rightfully Yours together";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = 'image/png';
    link.href = '/images/favicon.png?v=' + Date.now();
  }, []);
  return null;
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
};

const ReferralTracker = () => {
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('landingReferralCode', ref);
    }
  }, [location]);
  return null;
};

function App() {
  return (
    <OwnerAuthProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <WebSocketProvider>
            <Router>
              <FaviconSetter />
              <ScrollToTop />
              <ReferralTracker />
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/home"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Layout>
                          <Login />
                        </Layout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/privacy"
                    element={
                      <Layout>
                        <PrivacyPolicy />
                      </Layout>
                    }
                  />
                  <Route
                    path="/whitepaper"
                    element={<Navigate to="/" replace />}
                  />

                  <Route
                    path="/articles/:slug"
                    element={
                      <Layout>
                        <ArticleDetail />
                      </Layout>
                    }
                  />
                  <Route
                    path="/resources/scam-alerts"
                    element={
                      <Layout>
                        <ScamAlertsResourcePage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/resources/refund-programs"
                    element={
                      <Layout>
                        <RefundProgramsResourcePage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/resources/how-refunds-work"
                    element={
                      <Layout>
                        <HowRefundsResourcePage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/terms"
                    element={
                      <Layout>
                        <Terms />
                      </Layout>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <Layout>
                        <ContactUs />
                      </Layout>
                    }
                  />
                  <Route
                    path="/join-notice"
                    element={
                      <Layout>
                        <JoinNotice />
                      </Layout>
                    }
                  />
                  <Route
                    path="/join-details"
                    element={
                      <Layout>
                        <JoinDetails />
                      </Layout>
                    }
                  />
                  <Route
                    path="/join-contact"
                    element={
                      <Layout>
                        <JoinContact />
                      </Layout>
                    }
                  />
                  <Route
                    path="/join-loss"
                    element={
                      <Layout>
                        <JoinLoss />
                      </Layout>
                    }
                  />
                  <Route
                    path="/join-thanks"
                    element={
                      <Layout>
                        <JoinThankYou />
                      </Layout>
                    }
                  />
                  <Route
                    path="/join-submitted"
                    element={
                      <Layout>
                        <JoinSubmitted />
                      </Layout>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <Layout>
                        <Register />
                      </Layout>
                    }
                  />
                  <Route
                    path="/verify-email/:token"
                    element={
                      <Layout>
                        <VerifyEmail />
                      </Layout>
                    }
                  />
                  <Route
                    path="/reset-password/:token"
                    element={
                      <Layout>
                        <ResetPassword />
                      </Layout>
                    }
                  />

                  {/* Protected User Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  {/* Map legacy /vote route to the live Voting page to avoid static/demo mismatch */}
                  <Route
                    path="/vote"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Voting />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contribute"
                    element={
                      <Layout>
                        <Contribute />
                      </Layout>
                    }
                  />
                  <Route
                    path="/referral"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Referral />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/voting"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Voting />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Leaderboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />



                  {/* Owner Admin Routes */}
                  <Route
                    path="/admin/login"
                    element={<OwnerLogin />}
                  />
                  <Route
                    path="/admin/owner"
                    element={
                      <OwnerProtectedRoute>
                        <OwnerControlPanel />
                      </OwnerProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/:section" element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } />

                  {/* Catch all route - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(17, 24, 39, 0.9)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </WebSocketProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </OwnerAuthProvider>
  );
}

export default App;
