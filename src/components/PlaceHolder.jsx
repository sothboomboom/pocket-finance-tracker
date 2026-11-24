import styles from "./Placeholder.module.css";

export default function Placeholder({ icon: Icon, children }) {
	return (
		<section className={styles.card}>
			<span className={styles.circle} aria-hidden="true">
				<Icon strokeWidth={2} />
			</span>
			<p className={styles.text}>{children}</p>
		</section>
	);
}
