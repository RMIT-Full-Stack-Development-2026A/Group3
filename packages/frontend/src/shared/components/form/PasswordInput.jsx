import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({ title, name, value, onChange }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 px-1">{title}</label>
            </div>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <Lock size={20} className="text-outline/60" />
                </div>
                <input
                    className="w-full bg-surface-container-highest/60 border-0 border-b-2 border-outline-variant/30 py-3 pl-12 pr-12 rounded-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    )
}
