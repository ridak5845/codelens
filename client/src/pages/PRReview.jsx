import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ScorePanel from '../components/ScorePanel';
import FindingsList from '../components/FindingsList';
import ErrorBanner from '../components/ErrorBanner';
import PublishButton from '../components/PublishButton';
import ComparisonSummary from '../components/ComparisonSummary';

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
      const message = err.response?.data?.error || 'Review failed — the AI service may be busy, try again in a moment.';
      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div>
      <Link to={`/repos/${owner}/${repo}/pulls`} className="back-link">&larr; Back to pull requests</Link>

      <h1 className="page-title">{owner}/{repo} — PR #{number}</h1>

      {loading && <p className="loading-state">Loading changed files...</p>}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && files.length === 0 && (
        <p className="empty-state">No changed files found for this pull request.</p>
      )}

      {!loading && !error && files.length > 0 && (
        <>
          <h2 className="section-title">Changed Files ({files.length})</h2>
          <div className="card-list">
            {files.map((file) => (
              <div key={file.filename} className="card" style={{ cursor: 'default' }}>
                <code style={{ fontSize: '0.85rem' }}>{file.filename}</code>
                <p className="card-meta">+{file.additions} / -{file.deletions} ({file.status})</p>
              </div>
            ))}
          </div>

          <button className="btn" onClick={runReview} disabled={reviewLoading} style={{ marginTop: '1.25rem' }}>
            {reviewLoading && <span className="spinner" />}
            {reviewLoading ? 'Running AI Review...' : 'Run AI Review'}
          </button>

          {reviewError && <ErrorBanner message={reviewError} />}

          {reviewResult && (
            <>
              {reviewResult.comparison && <ComparisonSummary comparison={reviewResult.comparison} />}
              <ScorePanel scores={reviewResult.scores} />
              <FindingsList findings={reviewResult.findings} files={files} />
              <div style={{ marginTop: '1rem' }}>
                <PublishButton reviewId={reviewResult.reviewId} alreadyPublished={false} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}