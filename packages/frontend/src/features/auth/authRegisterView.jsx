import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AuthRegisterView - Placeholder to fix build error
 */
const AuthRegisterView = () => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-on-surface">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold mb-4 text-primary">Join the Arena</h1>
        <p className="text-on-surface-variant mb-8">Register feature is coming soon to match the new Ethereal design.</p>
        <Link to="/" className="text-primary hover:underline">Return to Login</Link>
      </div>
    </div>
  );
};

export default AuthRegisterView;
