const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const FEATURES = [
  {
    icon: '🔍',
    title: 'AI-Powered Reviews',
    desc: 'Every PR or file gets categorized, line-referenced feedback — bugs, security, performance, and quality.'
  },
  {
    icon: '📊',
    title: 'Clear Scoring',
    desc: 'Security, performance, and maintainability scores at a glance, no digging through walls of text.'
  },
  {
    icon: '🕘',
    title: 'Review History',
    desc: 'Every review is saved automatically — revisit past results anytime, for any repo or file.'
  }
];

export default function LandingPage() {
  return (
    <div className="landing-hero">
      <h1 className="landing-title">CodeLens</h1>
      <p className="landing-subtitle">
        AI-powered code review for your GitHub pull requests — and any file you paste in, no PR required.
      </p>
      <a href={`${API_BASE}/auth/github`}>
        <button className="btn">Sign in with GitHub</button>
      </a>

      <div className="landing-features">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}