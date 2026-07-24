import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PRReview() {
  const { owner, repo, number } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/repos/${owner}/${repo}/pulls/${number}/files`)
      .then((res) => setFiles(res.data))
      .catch(() => setError('Could not load changed files. Please try again.'))
      .finally(() => setLoading(false));
  }, [owner, repo, number]);

  const runReview = async () => {
    setReviewLoading(true);
    setReviewError(null);
    setReviewResult(null);
    try {
      const res = await api.post('/review/pr', { owner, repo, prNumber: Number(number) });
      setReviewResult(res.data);
    } catch (err) {
      const message = err.response?.data?.error || 'Review failed. Please try again.';
      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  };

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
            onClick={runReview}
            disabled={reviewLoading}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', marginTop: '1rem', cursor: reviewLoading ? 'wait' : 'pointer' }}
          >
            {reviewLoading ? 'Running AI Review...' : 'Run AI Review'}
          </button>

          {reviewLoading && (
            <p style={{ marginTop: '1rem', opacity: 0.7 }}>
              Analyzing {files.length} file(s) with Gemini — this usually takes a few seconds...
            </p>
          )}

          {reviewError && (
            <p style={{ color: 'crimson', marginTop: '1rem' }}>{reviewError}</p>
          )}

          {reviewResult && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2>Raw Review Result (temporary — Day 6 builds the real dashboard)</h2>
              <pre style={{
                background: '#111',
                color: '#0f0',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                fontSize: '0.85rem'
              }}>
                {JSON.stringify(reviewResult, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}