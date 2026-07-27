import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ScorePanel from '../components/ScorePanel';
import FindingsList from '../components/FindingsList';
import ErrorBanner from '../components/ErrorBanner';

export default function HistoryDetail() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/review/history/${id}`)
      .then((res) => setReview(res.data))
      .catch((err) => {
        const message = err.response?.status === 404
          ? 'This review could not be found.'
          : 'Could not load this review. Please try again.';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <Link to="/history" className="back-link">&larr; Back to history</Link>

      {loading && <p className="loading-state">Loading review...</p>}
      {error && <ErrorBanner message={error} />}

      {review && (
        <>
          <h1 className="page-title">
            {review.source === 'pr'
              ? `${review.repoOwner}/${review.repoName} — PR #${review.prNumber}`
              : review.fileName}
          </h1>
          <p className="card-meta" style={{ marginBottom: '1rem' }}>
            Reviewed on {new Date(review.createdAt).toLocaleString()}
          </p>

          <ScorePanel scores={review.scores} />
          <FindingsList findings={review.findings} files={[]} />
        </>
      )}
    </div>
  );
}