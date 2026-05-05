import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from './authService';
import { useAuthStore } from '../../app/store/authStore';

export function useLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const setAuth = useAuthStore((state) => state.actions.setAuth);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const tempErrors = {};
        if (!formData.identifier.trim()) tempErrors.identifier = "Username or email is required";
        if (!formData.password) tempErrors.password = "Password is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await authService.login(formData.identifier, formData.password);
            const { user, token } = response.data || {};

            if (!user || !token) {
                throw new Error('Invalid login response');
            }

            setAuth(user, token);

            setMessage("Login successful");
            setIsSuccess(true);

            // Determine redirect path
            const from = location.state?.from?.pathname;
            const isHomeOrEmpty = !from || from === '/';
            const destination = isHomeOrEmpty ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : from;

            setTimeout(() => navigate(destination, { replace: true }), 500);
        } catch (error) {
            console.error("Login error details:", error);
            setMessage(error.message || "Invalid credentials or server error.");
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, errors, message, isSuccess, isLoading, handleChange, handleSubmit };
}

export function useRegister() {
    const navigate = useNavigate();
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
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        let tempErrors = {};
        if (!formData.username.trim()) tempErrors.username = "Username is required";
        else if (formData.username.length < 3) tempErrors.username = "Username must be at least 3 characters";

        if (!formData.email) tempErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid email format";

        if (!formData.password) tempErrors.password = "Password is required";
        else if (formData.password.length < 8) tempErrors.password = "Password must be at least 8 characters";

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

        setIsLoading(true);

        try {
            await authService.register(formData);
            setMessage('Registration successful! Redirecting to login...');
            setIsSuccess(true);
            setFormData({ username: '', email: '', password: '', confirmPassword: '', country: '' });
            setTimeout(() => navigate('/login', { replace: true }), 700);
        } catch (error) {
            console.error('Registration error', error);
            setMessage(error.message || 'Registration failed');
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, errors, message, isSuccess, isLoading, handleChange, handleSubmit, setFormData };
}
