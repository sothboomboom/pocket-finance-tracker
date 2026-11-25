import { CircleCheck, CircleAlert } from "lucide-react";
import styles from "./Toast.module.css";

export default function Toast({ message, tone, action, onDismiss }) {
	const Icon = tone === "error" ? CircleAlert : CircleCheck;

	function handleAction() {
		action.onClick();
		onDismiss();
	}

	return (
		<div className={`${styles.toast} ${styles[tone]}`}>
			<Icon className={styles.icon} strokeWidth={2} aria-hidden="true" />
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
