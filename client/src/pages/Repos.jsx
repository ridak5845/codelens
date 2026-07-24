import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Repos() {
  const { user, logout } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/repos')
      .then((res) => setRepos(res.data))
      .catch(() => setError('Could not load repositories. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>CodeLens</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>{user?.username}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </div>

      <h2>Your Repositories</h2>

      {loading && <p>Loading repositories...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && repos.length === 0 && (
        <p>No public repositories found on your GitHub account.</p>
      )}

      <div>
        {repos.map((repo) => (
          <Link
            key={repo.id}
            to={`/repos/${repo.owner}/${repo.name}/pulls`}
            style={{
              display: 'block',
              padding: '1rem',
              marginBottom: '0.5rem',
              border: '1px solid #333',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <strong>{repo.fullName}</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
              {repo.description || 'No description'}
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.5 }}>
              Updated {new Date(repo.updatedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}