import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Shared data-fetching hook: consolidates the loading/error/data pattern
 * previously duplicated across Repos, PullRequests, History, and HistoryDetail.
 * @param {string|null} url - API path to GET. Pass null to skip fetching (e.g. waiting on a param).
 * @param {Array} deps - dependency array, same role as useEffect's second argument.
 * @param {string} errorMessage - user-facing message shown on failure.
 */
export function useApiData(url, deps, errorMessage = 'Could not load data. Please try again.') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.get(url)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.error || errorMessage);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}