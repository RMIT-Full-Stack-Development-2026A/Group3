import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/Input.jsx';
import { Button } from '../../components/Button.jsx';
import { useAuthStore } from '../../store/authStore.js';
import AuthService from './authService.js';
import { Card } from '../../components/Card.jsx';

/**
 * RegisterView - User entrance with real validation and API sync.
 * Implementation with Backend-Ready Logic and Password Strength Logic.
 */
export function RegisterView() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const validatePassword = (password) => {
    if (password.length < 8) return 0;
    if (password.length < 12) return 1;
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 2;
    return 2;
  };

  const passwordStrength = validatePassword(formData.password);
  const strengthColors = ['bg-coral', 'bg-[#FFB800]', 'bg-gold'];
  const strengthLabels = ['Weak', 'Medium', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);
    const newErrors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        // Real API Call (POST /api/v1/auth/register)
        await AuthService.register(formData);
        
        // Registration success - automatically login or redirect to login
        setGlobalError(null);
        navigate('/'); // Go to Login
      } catch (err) {
        setGlobalError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-page">
      <Card className="w-full max-w-md p-8 relative z-10 bg-surface border-border shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 text-gold-glow font-orbitron">
            TicTacToang
          </h1>
          <p className="text-text-secondary">Join the competition</p>
        </div>

        {globalError && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg text-center animate-shake">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              disabled={loading}
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded transition-colors ${
                        i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-surface-elevated'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-secondary">
                  Strength: {strengthLabels[passwordStrength]}
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            required
            disabled={loading}
          />

          <div>
            <label className="block mb-2 text-text-primary font-medium">Country</label>
            <select
              className="w-full px-4 py-3 bg-page border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Select your country</option>
              <option value="VN">Vietnam</option>
              <option value="SG">Singapore</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gold-gradient font-bold text-white hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Join Now'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Already have an account?{' '}
            <Link to="/" className="text-gold hover:text-gold-light transition-colors font-medium">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

