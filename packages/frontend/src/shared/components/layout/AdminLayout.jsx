import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomDock from './BottomDock';
import { useAuthUser } from '../../../app/store/authStore';

export default function AdminLayout() {
  const user = useAuthUser();

  return (
    <>
      <Header user={user} />
      <Outlet />
      <BottomDock />
    </>
  );
}
