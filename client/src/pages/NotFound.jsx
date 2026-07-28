import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/dashboard" className="btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
        Back to Repos
      </Link>
    </div>
  );
}