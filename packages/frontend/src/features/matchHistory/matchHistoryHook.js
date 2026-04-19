import { useState, useEffect } from 'react';
import matchHistoryService from './matchHistoryService';
import matchHistoryModel from './matchHistoryModel';

export function useMatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await matchHistoryService.getHistory();
      setHistory(matchHistoryModel.formatHistory(data.data));
    } catch (err) {
      setError(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, loading, error, refresh: fetchHistory };
}
