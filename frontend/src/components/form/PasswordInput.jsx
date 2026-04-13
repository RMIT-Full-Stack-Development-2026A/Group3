export default function PasswordInput({ title }) {
    return (
        <div class="space-y-2">
            <div class="flex justify-between items-center ml-1">
                <label class="block text-xs font-bold uppercase tracking-widest text-primary/80 px-1">{title}</label>
            </div>
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span class="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input class="w-full bg-surface-container-highest/60 border-0 border-b-2 border-outline-variant/30 py-4 pl-12 pr-4 rounded-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline" placeholder="••••••••" type="password" />
            </div>
        </div>
    )
}