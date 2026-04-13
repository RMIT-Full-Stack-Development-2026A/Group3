import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import lockIcon from "/assets/lock.png";

export default function PasswordInput({ title, name, value, onChange }) {
    const [showPassword, setShowPassword] = useState(false);

    
    return (
        <div class="space-y-2">
            <div class="flex justify-between items-center ml-1">
                <label class="block text-xs font-bold uppercase tracking-widest text-primary/80 px-1">{title}</label>
            </div>
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span class="material-symbols-outlined text-[20px]"><img src={lockIcon} alt="password icon" class="h-5 w-5 object-contain" /></span>
                </div>
                <input
                    class="w-full bg-surface-container-highest/60 border-0 border-b-2 border-outline-variant/30 py-3 pl-12 pr-12 rounded-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                />
                <button
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    )
}