import SubmitButton from "../../components/form/SubmitButton";
import TextInput from "../../components/form/TextInput";
import DropdownInput from "../../components/form/DropdownInput";
import PasswordInput from "../../components/form/PasswordInput";

export default function RegisterPage() {
    return (
        <main class="flex flex-col items-center justify-center px-4 py-12 min-h-[calc(100vh-88px)]">

            <div class="glass-panel w-full max-w-lg rounded-xl p-8 md:p-12 relative overflow-hidden shadow-[24px_0_48px_-12px_rgba(16,11,31,0.6)]">

                <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
                <header class="mb-10 relative">
                    <h1 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">Create Account</h1>
                    <p class="text-on-surface-variant text-sm">Join the multiverse of competitive Tic-Tac-Toang.</p>
                </header>
                <form class="space-y-6 relative">

                    <TextInput 
                        title={"username"}
                        icon={"person"}
                        placeholder={"LegendaryPlayer123"}
                    />

                    <TextInput 
                        title={"email address"}
                        icon={"mail"}
                        placeholder={"player@example.com"}
                    />

                    <DropdownInput
                        title={"Choose Region"}
                    />

                    <PasswordInput 
                        title={"password"}
                    />

                    <PasswordInput 
                        title={"confirm password"}
                    />
                    
                    <div class="pt-4">
                        <SubmitButton title={"Register"} />
                    </div>
                    <p class="text-center text-on-surface-variant text-sm mt-6">
                        By registering, you agree to our
                        <a class="text-primary hover:underline" href="#">Terms of Service</a>
                        and
                        <a class="text-primary hover:underline" href="#">Privacy Policy</a>.
                    </p>
                </form>
            </div>

            <div class="fixed bottom-0 left-0 w-full h-1/2 pointer-events-none -z-10 opacity-30">
                <div class="absolute bottom-0 left-10 w-96 h-96 bg-primary-fixed-dim/20 blur-[120px] rounded-full"></div>
                <div class="absolute bottom-10 right-20 w-80 h-80 bg-secondary-container/20 blur-[100px] rounded-full"></div>
            </div>
        </main>
    )
}