import PasswordInput from "../../components/form/PasswordInput"
import SubmitButton from "../../components/form/SubmitButton"
import TextInput from "../../components/form/TextInput"

export default function LoginPage() {
    return (
        <main class="flex-1 relative flex items-center justify-center p-6">
            \        <div class="absolute inset-0 z-0">
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
                    <form class="space-y-6">
                        <TextInput 
                            title={"username"}
                            icon={"person"}
                            placeholder={"LegendaryPlayer123"}
                        />
                        <div>
                            <PasswordInput 
                                title={"password"}
                            />
                            <a class="text-xs text-primary/70 hover:text-primary transition-colors" href="#">Forgot Password?</a>
                        </div>

                        <SubmitButton title={"Login"} />
                    </form>
                    <div class="mt-8 text-center">
                        <p class="text-on-surface-variant font-body">
                            Don't have an account?
                            <a class="text-primary font-semibold underline underline-offset-4 ml-1 hover:text-primary-dim transition-colors" href="register">Register</a>
                        </p>
                    </div>
                </div>

                <div class="h-4 w-4/5 mx-auto bg-primary/20 blur-xl mt-4 rounded-full"></div>
            </section>
        </main>
    )
}