export default function Header() {
    return (
        <header class="w-full top-0 bg-transparent no-border tonal-transition shadow-none z-50">
            <div class="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
                <div class="text-2xl font-black tracking-tighter text-violet-100 font-headline">
                    Tic-Tac-Toang
                </div>
                <div class="hidden md:flex gap-8 items-center font-headline tracking-tight">
                    <span class="text-violet-100/70 hover:text-violet-100 transition-colors duration-300 cursor-pointer">Support</span>
                    <button class="bg-transparent text-violet-400 dark:text-violet-300 font-headline tracking-tight hover:text-violet-100 transition-all duration-300 scale-95 active:opacity-80">
                        Join Now
                    </button>
                </div>
            </div>
        </header>
    )
}