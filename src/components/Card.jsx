import { useId } from "react";
import styles from "./Card.module.css";

export default function Card({
	title,
	subtitle,
	action,
	className = "",
	children,
}) {
	const titleId = useId();
	return (
		<section
			className={`${styles.card} ${className}`}
			aria-labelledby={titleId}
		>
			<header className={styles.header}>
				<div className={styles.titles}>
					<h2 id={titleId} className={styles.title}>
						{title}
					</h2>
					{subtitle && (
						<div className={styles.subtitle}>{subtitle}</div>
					)}
				</div>
				{action}
			</header>
			{children}
		</section>
	);
}
