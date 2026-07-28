import { Link } from 'react-router-dom';
import { useApiData } from '../hooks/useApiData';

function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function averageScore(scores) {
  return Math.round((scores.security + scores.performance + scores.maintainability) / 3);
}

export default function History() {
  const { data: reviews, loading, error } = useApiData('/review/history', [], 'Could not load review history. Please try again.');

  return (
    <div>
      <h1 className="page-title">Review History</h1>

      {loading && <p className="loading-state">Loading history...</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && reviews?.length === 0 && (
        <p className="empty-state">
          No reviews yet. Run a review from a pull request or the File Review page to see it here.
        </p>
      )}

      <div className="card-list">
        {reviews?.map((review) => {
          const avg = averageScore(review.scores);
          const title = review.source === 'pr'
            ? `${review.repoOwner}/${review.repoName} — PR #${review.prNumber}`
            : review.fileName;

          return (
            <Link key={review._id} to={`/history/${review._id}`} className="card history-card">
              <div className="history-card-main">
                <span className={`source-badge source-${review.source}`}>
                  {review.source === 'pr' ? 'PR' : 'File'}
                </span>
                <div>
                  <div className="card-title">{title}</div>
                  <p className="card-meta">{new Date(review.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="history-score" style={{ color: scoreColor(avg) }}>
                {avg}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}