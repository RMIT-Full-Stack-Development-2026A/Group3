export default function TextInput(props) {
    return (
        <div class="space-y-2 group">
            <label class="block text-xs font-bold uppercase tracking-widest text-primary/80 px-1">{props.title}</label>
            <div class="flex items-center bg-surface-container-highest/60 rounded-lg px-3 py-3 border-b-2 border-transparent focus-within:border-primary transition-all input-glow">
                <span class="material-symbols-outlined text-outline mr-3 text-lg"><img src={`public/assets/${props.icon}`} alt="user icon" /></span>
                <input class="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant/60" placeholder={props.placeholder} type="text" />
            </div>
        </div>
    )
}