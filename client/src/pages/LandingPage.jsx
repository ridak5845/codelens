export default function LandingPage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <h1 style={{ fontSize: '2.2rem' }}>CodeLens</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        AI-powered code review for your GitHub pull requests.
      </p>
      <a href="http://localhost:5000/api/auth/github">
        <button className="btn">Sign in with GitHub</button>
      </a>
    </div>
  );
}