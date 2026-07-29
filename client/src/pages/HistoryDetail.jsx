import { useParams, Link } from 'react-router-dom';
import { useApiData } from '../hooks/useApiData';
import ScorePanel from '../components/ScorePanel';
import FindingsList from '../components/FindingsList';
import ErrorBanner from '../components/ErrorBanner';
import PublishButton from '../components/PublishButton';

export default function HistoryDetail() {
  const { id } = useParams();
  const { data: review, loading, error, refetch } = useApiData(
    `/review/history/${id}`,
    [id],
    'Could not load this review. Please try again.'
  );

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

          {review.source === 'pr' && (
            <div style={{ marginTop: '1rem' }}>
              <PublishButton reviewId={review._id} alreadyPublished={review.published} onPublished={refetch} />
            </div>
          )}
        </>
      )}
    </div>
  );
}