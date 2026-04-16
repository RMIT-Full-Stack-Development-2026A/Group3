export default function Footer() {
    return (
        <footer class="w-full py-12 bg-slate-950 tonal-shift-bg z-50">
            <div class="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto">
                <div class="font-headline font-bold text-violet-200 mb-6 md:mb-0">
                    © 2024 Ethereal Core Gaming. All Rights Reserved.
                </div>
                <div class="flex gap-8 font-['Inter'] text-sm leading-relaxed">
                    <a class="text-violet-100/40 hover:text-violet-200 transition-colors" href="#">Privacy Policy</a>
                    <a class="text-violet-100/40 hover:text-violet-200 transition-colors" href="#">Terms of Service</a>
                    <a class="text-violet-100/40 hover:text-violet-200 transition-colors" href="#">Cookie Settings</a>
                </div>
            </div>
        </footer>
    )
}