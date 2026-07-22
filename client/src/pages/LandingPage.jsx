export default function LandingPage() {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>CodeLens</h1>
      <p>AI-powered code review for your GitHub pull requests.</p>
      <a href="http://localhost:5000/api/auth/github">
        <button style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
          Sign in with GitHub
        </button>
      </a>
    </div>
  );
}