import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import LandingPage from './pages/LandingPage';
import Repos from './pages/Repos';
import PullRequests from './pages/PullRequests';
import PRReview from './pages/PRReview';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import FileReview from './pages/FileReview';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="app-shell">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <NavBar />
            <OfflineBanner />
            <div className="app-content" id="main-content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Repos /></ProtectedRoute>} />
                <Route path="/repos/:owner/:repo/pulls" element={<ProtectedRoute><PullRequests /></ProtectedRoute>} />
                <Route path="/repos/:owner/:repo/pulls/:number" element={<ProtectedRoute><PRReview /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/history/:id" element={<ProtectedRoute><HistoryDetail /></ProtectedRoute>} />
                <Route path="/file-review" element={<ProtectedRoute><FileReview /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;