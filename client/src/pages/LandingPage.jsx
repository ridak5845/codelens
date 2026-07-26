const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function LandingPage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <h1 style={{ fontSize: '2.2rem' }}>CodeLens</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        AI-powered code review for your GitHub pull requests.
      </p>
      <a href={`${API_BASE}/auth/github`}>
        <button className="btn">Sign in with GitHub</button>
      </a>
    </div>
  );
}