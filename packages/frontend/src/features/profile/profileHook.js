import { useState, useEffect, useCallback } from 'react';
import profileService from './profileService';
import profileModel from './profileModel';

export function useProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfileData(profileModel.formatProfile(data.data));
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvatar = useCallback(async (file) => {
    try {
      setUpdating(true);
      setError(null);
      
      // 1. Upload to Cloudinary
      const cloudinaryRes = await profileService.uploadToCloudinary(file);
      const secureUrl = cloudinaryRes.secure_url;

      // 2. Sync with Backend
      const res = await profileService.updateProfile({ avatarUrl: secureUrl });
      
      if (res.success) {
        setProfileData(profileModel.formatProfile(res.data));
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateProfileInfo = useCallback(async (formData) => {
    try {
      setUpdating(true);
      setError(null);
      
      const res = await profileService.updateProfile(formData);
      
      if (res.success) {
        setProfileData(profileModel.formatProfile(res.data));
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { 
    profileData, 
    loading, 
    updating, 
    error, 
    refresh: fetchProfile,
    updateAvatar,
    updateProfileInfo
  };
}
