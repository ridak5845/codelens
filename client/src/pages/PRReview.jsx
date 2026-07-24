import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PRReview() {
  const { owner, repo, number } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/repos/${owner}/${repo}/pulls/${number}/files`)
      .then((res) => setFiles(res.data))
      .catch(() => setError('Could not load changed files. Please try again.'))
      .finally(() => setLoading(false));
  }, [owner, repo, number]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <Link to={`/repos/${owner}/${repo}/pulls`} style={{ color: 'inherit', opacity: 0.7 }}>
        &larr; Back to pull requests
      </Link>

      <h1 style={{ marginTop: '1rem' }}>{owner}/{repo} — PR #{number}</h1>

      {loading && <p>Loading changed files...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && files.length === 0 && (
        <p>No changed files found for this pull request.</p>
      )}

      {!loading && !error && files.length > 0 && (
        <>
          <h2>Changed Files ({files.length})</h2>
          <ul>
            {files.map((file) => (
              <li key={file.filename} style={{ marginBottom: '0.5rem' }}>
                <code>{file.filename}</code>
                <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', opacity: 0.6 }}>
                  +{file.additions} / -{file.deletions} ({file.status})
                </span>
              </li>
            ))}
          </ul>

          <button
            disabled
            title="Wired up on Day 5"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', marginTop: '1rem', cursor: 'not-allowed', opacity: 0.6 }}
          >
            Run AI Review
          </button>
        </>
      )}
    </div>
  );
}