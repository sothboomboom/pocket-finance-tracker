import { LoaderCircle } from "lucide-react";
import styles from "./Button.module.css";

export default function Button({
	variant = "primary",
	icon: Icon,
	loading = false,
	loadingText,
	disabled,
	className = "",
	children,
	type = "button",
	href,
	...rest
}) {
	if (href) {
		return (
			<a
				href={href}
				className={`${styles.button} ${styles[variant]} ${className}`}
				{...rest}
			>
				{Icon && (
					<Icon
						className={styles.icon}
						strokeWidth={2}
						aria-hidden="true"
					/>
				)}
				<span>{children}</span>
			</a>
		);
	}

	return (
		<button
			type={type}
			className={`${styles.button} ${styles[variant]} ${className}`}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...rest}
		>
			{loading ? (
				<LoaderCircle
					className={styles.spinner}
					strokeWidth={2}
					aria-hidden="true"
				/>
			) : (
				Icon && (
					<Icon
						className={styles.icon}
						strokeWidth={2}
						aria-hidden="true"
					/>
				)
			)}
			<span>{loading && loadingText ? loadingText : children}</span>
		</button>
	);
}
