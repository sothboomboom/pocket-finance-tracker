import {
	CATEGORY_ICONS,
	FALLBACK_CATEGORY_ICON,
} from "../constants/categoryIcons.js";
import styles from "./CategoryIcon.module.css";

export default function CategoryIcon({ icon, color, size = "sm" }) {
	const Icon = CATEGORY_ICONS[icon] ?? FALLBACK_CATEGORY_ICON;
	return (
		<span
			className={`${styles.circle} ${styles[size]}`}
			style={{
				"--circle-bg": `var(--cat-${color}-bg)`,
				"--circle-fg": `var(--cat-${color}-icon)`,
			}}
			aria-hidden="true"
		>
			<Icon strokeWidth={2} />
		</span>
	);
}
