import { useState, useEffect, useCallback } from 'react';
import ProfileService from './profileService';
import ProfileModel from './profileModel';

export const useProfileLogic = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', country: '' });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await ProfileService.getProfile();

      if (profileRes.success) {
        const formattedData = ProfileModel.formatProfileData(profileRes.data);
        setProfileData(formattedData);
        setEditForm({
          username: formattedData.user.username,
          country: formattedData.profile.country
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const res = await ProfileService.updateProfile(editForm);
      if (res.success) {
        const formattedData = ProfileModel.formatProfileData(res.data);
        setProfileData(formattedData);
        setIsEditing(false);
      }
    } catch (error) {
       console.error('Profile Update Error:', error);
       alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setUpdating(true);
    try {
      const cloudinaryRes = await ProfileService.uploadToCloudinary(file);
      const secureUrl = cloudinaryRes.secure_url;

      const res = await ProfileService.updateProfile({ avatarUrl: secureUrl });
      
      if (res.success) {
        const formattedData = ProfileModel.formatProfileData(res.data);
        setProfileData(formattedData);
      }
    } catch (error) {
       console.error('Avatar Upload Error:', error);
       alert('Failed to upload/update avatar: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
    
    if (url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face,q_auto,f_auto/');
    }
    
    if (url.startsWith('http')) return url;
    return `http://localhost:5001${url}`;
  };

  return {
    profileData,
    loading,
    isEditing,
    setIsEditing,
    updating,
    editForm,
    setEditForm,
    handleUpdateProfile,
    handleAvatarUpload,
    getAvatarUrl,
    refreshData: fetchAllData
  };
};
