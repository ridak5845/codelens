import { useState } from 'react';
import api from '../services/api';

export default function PublishButton({ reviewId, alreadyPublished, onPublished }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (alreadyPublished || result) {
    return (
      <p className="publish-success">
        ✅ Posted to GitHub as inline PR comments{result ? ` (${result.posted} comment${result.posted === 1 ? '' : 's'})` : ''}.
      </p>
    );
  }

  const publish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/review/${reviewId}/publish`, {});
      setResult(res.data);
      setConfirming(false);
      if (onPublished) onPublished();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not publish to GitHub. Please try again.');
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="publish-confirm">
        <p>This will post real comments on your actual GitHub pull request. Continue?</p>
        <div className="publish-confirm-actions">
          <button className="btn" onClick={publish} disabled={loading}>
            {loading ? 'Posting...' : 'Yes, post to GitHub'}
          </button>
          <button className="btn btn-secondary" onClick={() => setConfirming(false)} disabled={loading}>
            Cancel
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => setConfirming(true)}>
        Post to GitHub
      </button>
      {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}