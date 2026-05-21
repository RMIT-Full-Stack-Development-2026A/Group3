import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/RouteConfig';

/**
 * App Module - Core Application Component
 * Provides the router and global context/state providers.
 */
function App() {
  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
