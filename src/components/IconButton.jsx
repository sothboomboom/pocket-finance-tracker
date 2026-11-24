import styles from "./IconButton.module.css";

export default function IconButton({
	icon: Icon,
	label,
	className = "",
	...rest
}) {
	return (
		<button
			type="button"
			className={`${styles.button} ${className}`}
			aria-label={label}
			{...rest}
		>
			<Icon strokeWidth={2} aria-hidden="true" />
		</button>
	);
}
