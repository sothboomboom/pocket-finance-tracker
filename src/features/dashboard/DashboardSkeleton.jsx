import Skeleton from "../../components/Skeleton.jsx";
import styles from "./DashboardSkeleton.module.css";

// first load only
export default function DashboardSkeleton() {
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
