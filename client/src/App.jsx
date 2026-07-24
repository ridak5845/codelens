import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Repos from './pages/Repos';
import PullRequests from './pages/PullRequests';
import PRReview from './pages/PRReview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Repos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repos/:owner/:repo/pulls"
            element={
              <ProtectedRoute>
                <PullRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repos/:owner/:repo/pulls/:number"
            element={
              <ProtectedRoute>
                <PRReview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;