import { useState, useEffect } from 'react';
import profileService from './profileService';
import profileModel from './profileModel';

export function useProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfileData(profileModel.formatProfile(data.data));
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profileData, loading, error, refresh: fetchProfile };
}
