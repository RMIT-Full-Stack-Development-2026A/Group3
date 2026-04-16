import { useMemo, useState } from "react";
import countryList from "react-select-country-list";
import SubmitButton from "../../../../../../frontend/src/components/form/SubmitButton";
import TextInput from "../../../../../../frontend/src/components/form/TextInput";
import DropdownInput from "../../../../../../frontend/src/components/form/DropdownInput";
import PasswordInput from "../../../../../../frontend/src/components/form/PasswordInput";

export default function RegisterPage() {
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

    const countries = useMemo(() => countryList().getData(), []);


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
        <main className="flex-1 relative flex items-center justify-center p-6">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-secondary-container/20 rounded-full blur-[160px]"></div>
            </div>
            <section className="relative z-10 w-full max-w-md">

                <div className="absolute -top-12 -right-8 w-24 h-24 bg-linear-to-br from-primary to-primary-container rounded-lg rotate-12 opacity-50 blur-sm hidden sm:block"></div>
                <div className="glass-effect rounded-lg p-10 border border-outline-variant/15 shadow-2xl shadow-indigo-950/50">
                    <div className="mb-8">
                        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Create Account</h1>
                        <p className="text-on-surface-variant font-body leading-relaxed">Join the multiverse of competitive Tic-Tac-Toang.</p>
                    </div>
                    {message && (
                        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${isSuccess ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`} role="alert">
                            {message}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <TextInput
                            title={"username"}
                            icon={"user.png"}
                            placeholder={"LegendaryPlayer123"}
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        {errors.username && <p className="-mt-4 text-xs text-rose-300">{errors.username}</p>}

                        <TextInput
                            title={"email address"}
                            icon={"mail.png"}
                            placeholder={"player@example.com"}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="-mt-4 text-xs text-rose-300">{errors.email}</p>}

                        <DropdownInput
                            title={"Choose Region"}
                            placeholder={"Select your region"}
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            options={countries.map((c) => ({ label: c.label, value: c.label }))}
                        />
                        {errors.country && <p className="-mt-4 text-xs text-rose-300">{errors.country}</p>}

                        <PasswordInput
                            title={"password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <p className="-mt-4 text-xs text-rose-300">{errors.password}</p>}

                        <PasswordInput
                            title={"confirm password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <p className="-mt-4 text-xs text-rose-300">{errors.confirmPassword}</p>}

                        <SubmitButton title={"Register"} />
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-on-surface-variant font-body">
                            Already have an account?
                            <a className="text-primary font-semibold underline underline-offset-4 ml-1 hover:text-primary-dim transition-colors" href="/login">Login</a>
                        </p>
                    </div>
                </div>
                <div className="h-4 w-4/5 mx-auto bg-primary/20 blur-xl mt-4 rounded-full"></div>
            </section>
        </main>
    )
}