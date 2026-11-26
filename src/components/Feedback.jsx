import { CloudOff, RotateCw, CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "./Button.jsx";
import styles from "./Feedback.module.css";

//////////////////////////////
// EmptyState
//////////////////////////////

// Nothing to show yet
export function EmptyState({ icon: Icon, message, action }) {
	return (
		<div className={styles.empty}>
			<span className={styles.emptyCircle} aria-hidden="true">
				<Icon strokeWidth={2} />
			</span>
			<p className={styles.emptyMessage}>{message}</p>
			{action}
		</div>
	);
}

//////////////////////////////
// ErrorState
//////////////////////////////

// Loading failed, with a retry button
export function ErrorState({ message, onRetry }) {
	return (
		<div className={styles.errorState} role="alert">
			<span className={styles.errorCircle} aria-hidden="true">
				<CloudOff strokeWidth={2} />
			</span>
			<p className={styles.errorMessage}>
				{message || "Something went wrong."}
			</p>
			<Button variant="secondary" icon={RotateCw} onClick={onRetry}>
				Try again
			</Button>
		</div>
	);
}

//////////////////////////////
// Placeholder
//////////////////////////////

// Icon + message card
export function Placeholder({ icon: Icon, children }) {
	return (
		<section className={styles.placeholder}>
			<span className={styles.placeholderCircle} aria-hidden="true">
				<Icon strokeWidth={2} />
			</span>
			<p className={styles.placeholderText}>{children}</p>
		</section>
	);
}

//////////////////////////////
// Skeleton
//////////////////////////////

export function Skeleton({ className = "" }) {
	return (
		<span
			className={`${styles.skeleton} ${className}`}
			aria-hidden="true"
		/>
	);
}

//////////////////////////////
// DashboardSkeleton
//////////////////////////////

export function DashboardSkeleton() {
	return (
		<div
			className={styles.wrapper}
			aria-busy="true"
			aria-label="Loading dashboard"
		>
			<div className={styles.stats}>
				{Array.from({ length: 4 }, (_, i) => (
					<Skeleton key={i} className={styles.stat} />
				))}
			</div>
			<Skeleton className={styles.chart} />
			<Skeleton className={styles.chart} />
		</div>
	);
}

//////////////////////////////
// FieldError
//////////////////////////////

export function FieldError({ id, children }) {
	if (!children) return null;
	return (
		<p id={id} className={styles.fieldError}>
			<CircleAlert
				className={styles.icon}
				strokeWidth={2}
				aria-hidden="true"
			/>
			<span>{children}</span>
		</p>
	);
}

//////////////////////////////
// Toast
//////////////////////////////

export function Toast({ message, tone, action, onDismiss }) {
	const Icon = tone === "error" ? CircleAlert : CircleCheck;

	function handleAction() {
		action.onClick();
		onDismiss();
	}

	return (
		<div className={`${styles.toast} ${styles[tone]}`}>
			<Icon
				className={styles.toastIcon}
				strokeWidth={2}
				aria-hidden="true"
			/>
			<span className={styles.message}>{message}</span>
			{action && (
				<button
					type="button"
					className={styles.action}
					onClick={handleAction}
				>
					{action.label}
				</button>
			)}
		</div>
	);
}
