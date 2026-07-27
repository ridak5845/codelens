import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Repos() {
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
    <div>
      <h1 className="page-title">Your Repositories</h1>

      {loading && <p className="loading-state">Loading repositories...</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && repos.length === 0 && (
        <p className="empty-state">No public repositories found on your GitHub account.</p>
      )}

      <div className="card-list">
        {repos.map((repo) => (
          <Link key={repo.id} to={`/repos/${repo.owner}/${repo.name}/pulls`} className="card">
            <div className="card-title">{repo.fullName}</div>
            <p className="card-subtitle">{repo.description || 'No description'}</p>
            <p className="card-meta">Updated {new Date(repo.updatedAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}