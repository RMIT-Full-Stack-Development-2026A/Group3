import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// pages
import router from './router/RouteConfig';
import { RouterProvider } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary overflow-hidden h-screen w-screen flex flex-col">
        <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);
