import { Plus } from "lucide-react";
import styles from "./Fab.module.css";

// mobile only
export default function Fab({ label, onClick }) {
	return (
		<button
			type="button"
			className={styles.fab}
			aria-label={label}
			onClick={onClick}
		>
			<Plus strokeWidth={2.5} aria-hidden="true" />
		</button>
	);
}
