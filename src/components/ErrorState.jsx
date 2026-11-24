import { CloudOff, RotateCw } from "lucide-react";
import Button from "./Button.jsx";
import styles from "./ErrorState.module.css";

export default function ErrorState({ message, onRetry }) {
	return (
		<div className={styles.error} role="alert">
			<span className={styles.circle} aria-hidden="true">
				<CloudOff strokeWidth={2} />
			</span>
			<p className={styles.message}>
				{message || "Something went wrong."}
			</p>
			<Button variant="secondary" icon={RotateCw} onClick={onRetry}>
				Try again
			</Button>
		</div>
	);
}
