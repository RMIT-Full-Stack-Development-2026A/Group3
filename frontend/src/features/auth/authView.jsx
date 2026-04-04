import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useMemo } from 'react'
import countryList from 'react-select-country-list'
import './auth.css';

const AuthView = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countries = useMemo(() => countryList().getData(), []);


  const validateForm = () => {
    let tempErrors = {};
    if (!formData.username.trim()) tempErrors.username = "Username is required";
    else if (formData.username.length < 3) tempErrors.username = "Username must be at least 3 characters";

    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid email format";

    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword) tempErrors.confirmPassword = "Confirm Password is required";
    else if (formData.confirmPassword !== formData.password) tempErrors.confirmPassword = "Passwords do not match";

    if (!formData.country) tempErrors.country = "Please select a country";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          country: formData.country
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.message || 'Registration failed'}`);
        setIsSuccess(false);
      } else {
        setMessage('Registration successful!');
        setIsSuccess(true);

        setFormData({ username: '', email: '', password: '', confirmPassword: '', country: '' });
      }
    } catch (error) {
      console.error('Server is No Good', error);
      setMessage('You sure the API is correct and server running broski?');
      setIsSuccess(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Create an Account</h2>
      
      {message && (
        <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
          />
          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Password:</label>
          <div className="input-group">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              style={{ borderRight: 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password:</label>
          <div className="input-group">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              style={{ borderRight: 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-btn"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Country:</label>
          <select 
            name="country" 
            value={formData.country} 
            onChange={handleChange}
            className={`form-select ${errors.country ? 'is-invalid' : ''}`}
          >
            <option value="">Select your country</option>
            {countries.map((c) => (
              <option key={c.value} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.country && <div className="invalid-feedback">{errors.country}</div>}
        </div>

        <button type="submit" className="btn btn-dark w-100">Register</button>
      </form>
    </div>
  );
};

export default AuthView;