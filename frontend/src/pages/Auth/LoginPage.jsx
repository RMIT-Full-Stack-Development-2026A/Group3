import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PasswordInput from "../../components/form/PasswordInput"
import SubmitButton from "../../components/form/SubmitButton"
import TextInput from "../../components/form/TextInput"

export default function LoginPage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    })

    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    const validateForm = () => {
        const tempErrors = {}

        if (!formData.identifier.trim()) tempErrors.identifier = "Username or email is required"
        if (!formData.password) tempErrors.password = "Password is required"

        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage("")
        setIsSuccess(false)

        if (!validateForm()) return

        try {
            const response = await fetch("http://localhost:5000/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || "Login failed")
                setIsSuccess(false)
                return
            }

            localStorage.setItem("authToken", data.data.token)
            localStorage.setItem("authUser", JSON.stringify(data.data))
            setMessage("Login successful")
            setIsSuccess(true)
            navigate("/")
        } catch (error) {
            console.error("Login error", error)
            setMessage("Server is unavailable. Please try again.")
            setIsSuccess(false)
        }
    }

    return (
        <main class="flex-1 relative flex items-center justify-center p-6">
            <div class="absolute inset-0 z-0">
                <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
                <div class="absolute bottom-1/4 right-1/4 w-125 h-125 bg-secondary-container/20 rounded-full blur-[160px]"></div>
            </div>
            <section class="relative z-10 w-full max-w-md">

                <div class="absolute -top-12 -right-8 w-24 h-24 bg-linear-to-br from-primary to-primary-container rounded-lg rotate-12 opacity-50 blur-sm hidden sm:block"></div>
                <div class="glass-effect rounded-lg p-10 border border-outline-variant/15 shadow-2xl shadow-indigo-950/50">
                    <div class="mb-8">
                        <h1 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Welcome Back</h1>
                        <p class="text-on-surface-variant font-body leading-relaxed">Enter your credentials to enter the multiverse.</p>
                    </div>
                    {message && (
                        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${isSuccess ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`} role="alert">
                            {message}
                        </div>
                    )}

                    <form class="space-y-6" onSubmit={handleSubmit}>
                        <TextInput 
                            title={"username or email"}
                            icon={"user.png"}
                            placeholder={"LegendaryPlayer123"}
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                        />
                        {errors.identifier && <p className="-mt-4 text-xs text-rose-300">{errors.identifier}</p>}
                        <div>
                            <PasswordInput 
                                title={"password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="mt-2 text-xs text-rose-300">{errors.password}</p>}
                            <a class="text-xs text-primary/70 hover:text-primary transition-colors" href="#">Forgot Password?</a>
                        </div>

                        <SubmitButton title={"Login"} />
                    </form>
                    <div class="mt-8 text-center">
                        <p class="text-on-surface-variant font-body">
                            Don't have an account?
                            <a class="text-primary font-semibold underline underline-offset-4 ml-1 hover:text-primary-dim transition-colors" href="/register">Register</a>
                        </p>
                    </div>
                </div>

                <div class="h-4 w-4/5 mx-auto bg-primary/20 blur-xl mt-4 rounded-full"></div>
            </section>
        </main>
    )
}