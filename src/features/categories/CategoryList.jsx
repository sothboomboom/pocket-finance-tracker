import { Plus, ChevronRight } from "lucide-react";
import Card from "../../components/Card.jsx";
import Button from "../../components/Button.jsx";
import CategoryIcon from "../../components/CategoryIcon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import styles from "./CategoryList.module.css";

export default function CategoryList({
	categories,
	status,
	error,
	onRetry,
	onAdd,
	onSelect,
}) {
	return (
		<Card
			title="Your categories"
			subtitle="Tap a category to rename it or change its color and icon."
			action={
				<Button
					variant="secondary"
					icon={Plus}
					onClick={onAdd}
					disabled={status !== "success"}
				>
					Add
				</Button>
			}
		>
			{status === "loading" && (
				<div className={styles.list} aria-busy="true">
					{Array.from({ length: 4 }, (_, i) => (
						<Skeleton key={i} className={styles.rowSkeleton} />
					))}
				</div>
			)}
			{status === "error" && (
				<ErrorState message={error?.message} onRetry={onRetry} />
			)}
			{status === "success" && (
				<ul className={styles.list}>
					{categories.map((category) => (
						<li key={category.id}>
							<button
								type="button"
								className={styles.row}
								onClick={() => onSelect(category)}
							>
								<CategoryIcon
									icon={category.icon}
									color={category.color}
								/>
								<span className={styles.main}>
									<span className={styles.name}>
										{category.name}
									</span>
									<span className={styles.count}>
										{category.expenseCount}{" "}
										{category.expenseCount === 1
											? "expense"
											: "expenses"}
									</span>
								</span>
								<ChevronRight
									className={styles.chevron}
									strokeWidth={2}
									aria-hidden="true"
								/>
							</button>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
}
