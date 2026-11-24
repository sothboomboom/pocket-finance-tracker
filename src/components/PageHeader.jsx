import styles from "./PageHeader.module.css";

// Renders the page's only <h1>.
export default function PageHeader({ title, eyebrow, actions }) {
	return (
		<header className={styles.header}>
			<div className={styles.titles}>
				{eyebrow && <p className="eyebrow">{eyebrow}</p>}
				<h1 className={styles.title}>{title}</h1>
			</div>
			{actions && <div className={styles.actions}>{actions}</div>}
		</header>
	);
}
