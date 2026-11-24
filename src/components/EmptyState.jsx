import styles from "./EmptyState.module.css";

export default function EmptyState({ icon: Icon, message, action }) {
	return (
		<div className={styles.empty}>
			<span className={styles.circle} aria-hidden="true">
				<Icon strokeWidth={2} />
			</span>
			<p className={styles.message}>{message}</p>
			{action}
		</div>
	);
}
