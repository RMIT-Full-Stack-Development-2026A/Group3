import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/Input.jsx';
import { Button } from '../../components/Button.jsx';
import { useAuthStore } from '../../store/auth.store.js';
import { Card } from '../../components/Card.jsx';
import AuthService from './auth.service.js';

/**
 * LoginView - The entrance to TicTacToang Arena.
 * Implementation with Real Auth Logic & Layer 5 Middleware Interceptors.
 */
export function LoginView() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Real API Call (POST /api/v1/auth/login)
      await AuthService.login(formData);
      navigate('/dashboard'); // Success!
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-page">
      <Card className="w-full max-w-md p-8 relative z-10 border-border bg-surface shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 text-gold-glow font-orbitron">
            TicTacToang
          </h1>
          <p className="text-text-secondary">Welcome back to the arena</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email or Username"
            type="text"
            placeholder="Enter your email or username"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
          />

          <Button 
            type="submit" 
            className="w-full bg-gold-gradient hover:opacity-90 transition-all font-bold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
              Register
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
