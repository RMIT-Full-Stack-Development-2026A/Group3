export default function TextInput(props) {
    return (
        <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 px-1">{props.title}</label>
            <div className="flex items-center bg-surface-container-highest/60 rounded-lg px-3 py-3 border-b-2 border-transparent focus-within:border-primary transition-all input-glow">
                <span className="text-outline mr-3">
                    <span className="material-symbols-outlined text-[20px]">{props.icon.replace('.png', '')}</span>
                </span>
                <input
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant/60"
                    placeholder={props.placeholder}
                    type={props.type || "text"}
                    name={props.name}
                    value={props.value}
                    onChange={props.onChange}
                />
            </div>
        </div>
    )
}
