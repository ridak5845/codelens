import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Repos from './pages/Repos';
import PullRequests from './pages/PullRequests';
import PRReview from './pages/PRReview';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import FileReview from './pages/FileReview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <NavBar />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Repos /></ProtectedRoute>} />
              <Route path="/repos/:owner/:repo/pulls" element={<ProtectedRoute><PullRequests /></ProtectedRoute>} />
              <Route path="/repos/:owner/:repo/pulls/:number" element={<ProtectedRoute><PRReview /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/history/:id" element={<ProtectedRoute><HistoryDetail /></ProtectedRoute>} />
              <Route path="/file-review" element={<ProtectedRoute><FileReview /></ProtectedRoute>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;