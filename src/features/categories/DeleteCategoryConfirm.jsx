import { useState } from "react";
import { Trash2 } from "lucide-react";
import CategoryIcon from "../../components/CategoryIcon.jsx";
import { Button } from '../../components/Button.jsx';
import { FieldError } from '../../components/Feedback.jsx';
import formStyles from "../../components/SheetForm.module.css";
import styles from "./DeleteCategoryConfirm.module.css";

export default function DeleteCategoryConfirm({
	category,
	onCancel,
	onConfirm,
	cancelRef,
}) {
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState(null);
	const count = category.expenseCount;

	async function handleConfirm() {
		setDeleting(true);
		setError(null);
		try {
			await onConfirm();
		} catch (err) {
			setError(err.message);
			setDeleting(false);
		}
	}

	return (
		<div className={formStyles.form}>
			<div className={`${formStyles.fields} ${styles.body}`}>
				<div className={styles.category}>
					<CategoryIcon
						icon={category.icon}
						color={category.color}
						size="md"
					/>
					<span className={styles.name}>{category.name}</span>
				</div>
				<p className={styles.message}>
					{count > 0
						? `Its ${count} ${count === 1 ? "expense" : "expenses"} will move to "Other". `
						: "It doesn't have any expenses. "}
					This can't be undone.
				</p>
				{error && (
					<div role="alert">
						<FieldError id="delete-category-error">
							{error}
						</FieldError>
					</div>
				)}
			</div>
			<div className={formStyles.footer}>
				<div className={`${formStyles.actions} ${styles.actions}`}>
					<Button
						ref={cancelRef}
						variant="secondary"
						onClick={onCancel}
						disabled={deleting}
					>
						Cancel
					</Button>
					<Button
						variant="dangerSolid"
						icon={Trash2}
						onClick={handleConfirm}
						loading={deleting}
						loadingText="Deleting…"
					>
						Delete category
					</Button>
				</div>
			</div>
		</div>
	);
}
