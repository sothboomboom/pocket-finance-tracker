import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import styles from "./Button.module.css";

//////////////////////////////
// Button
//////////////////////////////

export function Button({
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

//////////////////////////////
// IconButton
//////////////////////////////

export function IconButton({ icon: Icon, label, className = '', ...rest }) {
  return (
    <button type="button" className={`${styles.iconButton} ${className}`} aria-label={label} {...rest}>
      <Icon strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

//////////////////////////////
// BackButton
//////////////////////////////

export function BackButton({ fallback = '/', label = 'Back' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAppHistory = location.key !== 'default';

  return <IconButton icon={ArrowLeft} label={label} onClick={() => (hasAppHistory ? navigate(-1) : navigate(fallback))} />;
}
