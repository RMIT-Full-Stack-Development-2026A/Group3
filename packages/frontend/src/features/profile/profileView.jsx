import React, { useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProfileLogic } from './profileHook';
import Header from '../../components/layout/Header';
import BottomDock from '../../components/layout/BottomDock';

// Modular Components
import ProfileHeader from './components/ProfileHeader';
import StatsBoard from './components/StatsBoard';

const ProfileView = () => {
  const { user: authUser } = useAuthStore();
  const fileInputRef = useRef(null);
  
  // Sử dụng Hook Logic để lấy toàn bộ trạng thái và hành động
  const {
    profileData,
    matchHistory,
    loading,
    isEditing,
    setIsEditing,
    updating,
    editForm,
    setEditForm,
    handleUpdateProfile,
    handleAvatarUpload,
    getAvatarUrl
  } = useProfileLogic();

  // Xử lý khi nhấn vào Avatar để chọn file (nếu có logic upload)
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleAvatarUpload(file);
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-[#100b1f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { user, profile, stats } = profileData || {};

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary overflow-x-hidden">
      {/* Navbar chung */}
      <Header user={authUser} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Input ẩn để chọn file ảnh */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={onFileChange} 
        />

        {/* 1. Phần Đầu trang (Header) */}
        <ProfileHeader 
          user={user}
          profile={profile}
          stats={stats}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          updating={updating}
          onAvatarClick={handleAvatarClick}
          onEditToggle={setIsEditing}
          onSave={handleUpdateProfile}
          getAvatarUrl={getAvatarUrl}
        />

        {/* 2. Bảng Chỉ số (Stats Grid) */}
        <StatsBoard stats={stats} />
      </main>

      {/* Thanh công cụ dưới cùng (Mobile) */}
      <BottomDock />
    </div>
  );
};

export default ProfileView;
