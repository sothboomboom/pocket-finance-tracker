import { useEffect, useRef, useState } from "react";
import Sheet from "../../components/Sheet.jsx";
import CategoryForm from "./CategoryForm.jsx";
import DeleteCategoryConfirm from "./DeleteCategoryConfirm.jsx";

/** Delete swaps this dialog's content for a confirmation, instead of stacking a second dialog. */
export default function CategorySheet({
	open,
	session,
	category,
	onClose,
	onSubmit,
	onDelete,
}) {
	const nameRef = useRef(null);
	const cancelRef = useRef(null);
	const [confirming, setConfirming] = useState(false);

	useEffect(() => setConfirming(false), [session]);

	// Move focus to the step that just appeared, for keyboard and screen-reader users.
	useEffect(() => {
		if (!open) return;
		(confirming ? cancelRef : nameRef).current?.focus();
	}, [confirming, open]);

	let title = "Add category";
	if (confirming) title = "Delete category?";
	else if (category) title = "Edit category";

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title={title}
			initialFocusRef={nameRef}
		>
			{confirming ? (
				<DeleteCategoryConfirm
					category={category}
					cancelRef={cancelRef}
					onCancel={() => setConfirming(false)}
					onConfirm={() => onDelete(category)}
				/>
			) : (
				<CategoryForm
					key={session}
					category={category}
					nameRef={nameRef}
					onSubmit={onSubmit}
					onDelete={() => setConfirming(true)}
				/>
			)}
		</Sheet>
	);
}
