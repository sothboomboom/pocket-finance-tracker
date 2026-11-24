import { CircleAlert } from "lucide-react";
import styles from "./FieldError.module.css";

export default function FieldError({ id, children }) {
	if (!children) return null;
	return (
		<p id={id} className={styles.error}>
			<CircleAlert
				className={styles.icon}
				strokeWidth={2}
				aria-hidden="true"
			/>
			<span>{children}</span>
		</p>
	);
}
