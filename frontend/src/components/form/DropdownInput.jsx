export default function DropdownInput({
    title,
    name,
    value = '',
    onChange,
    options = [],
    placeholder = 'Select an option',
}) {
    return (
        <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 px-1">
                {title}
            </label>

            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full appearance-none bg-surface-container-highest/60 rounded-lg px-3 py-3 pr-11 border-b-2 border-transparent hover:border-primary/50 focus:border-primary text-on-surface transition-all"
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => {
                        const optionValue = typeof option === 'string' ? option : option.value;
                        const optionLabel = typeof option === 'string' ? option : option.label;

                        return (
                            <option key={optionValue} value={optionValue}>
                                {optionLabel}
                            </option>
                        );
                    })}
                </select>

                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                    <img src="/assets/dropdown-arrow.png" alt="expand icon" />
                </span>
            </div>
        </div>
    );
}