export default function SubmitButton( props ) {
    return (
        <button className="w-full py-3 bg-linear-to-r from-primary to-primary-container text-on-primary font-headline font-bold rounded-lg shadow-lg shadow-primary/10 glow-hover transform transition-all active:scale-95 duration-200" type="submit">
            {props.title}
        </button>
    )
}
