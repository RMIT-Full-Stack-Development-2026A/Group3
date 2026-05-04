import axios from 'axios';
import { API_CONFIG } from '../../configs/api.config';

export const fetchReplaySession = async (gameId, token) => {
  const normalizedGameId = String(gameId || '').trim();

  if (!normalizedGameId) {
    throw new Error('Game ID is required.');
  }

  try {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/game/${normalizedGameId}/replay`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    const payload = response.data;

    if (!payload || payload.success !== true || !payload.data) {
      throw new Error('Invalid replay response from server.');
    }

    return payload.data;
  } catch (error) {
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch replay session.';

    throw new Error(message);
  }
};
