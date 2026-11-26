import { useState } from "react";
import { Trash2, Lock } from "lucide-react";
import { CategoryIcon } from '../../components/UI.jsx';
import { FieldError } from '../../components/Feedback.jsx';
import { Button } from '../../components/Button.jsx';
import ColorPicker from "./ColorPicker.jsx";
import IconPicker from "./IconPicker.jsx";
import { CATEGORY_NAME_MAX_LENGTH } from '../../constants/categories.js';
import formStyles from '../../components/Sheet.module.css';
import styles from "./CategoryForm.module.css";

const NEW_CATEGORY = { name: "", color: "teal", icon: "Sparkles" };

export default function CategoryForm({
	category,
	onSubmit,
	onDelete,
	nameRef,
}) {
	const isEdit = Boolean(category);
	const isFallback = category?.isFallback ?? false;
	const [values, setValues] = useState(() =>
		category
			? {
					name: category.name,
					color: category.color,
					icon: category.icon,
				}
			: NEW_CATEGORY,
	);
	const [errors, setErrors] = useState({});
	const [formError, setFormError] = useState(null);
	const [saving, setSaving] = useState(false);

	function setField(field, value) {
		setValues((prev) => ({ ...prev, [field]: value }));
		if (errors[field])
			setErrors((prev) => ({ ...prev, [field]: undefined }));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (saving) return;
		const name = values.name.trim();
		if (!name) {
			setErrors({ name: "Enter a name" });
			nameRef.current?.focus();
			return;
		}

		setSaving(true);
		setFormError(null);
		try {
			await onSubmit({ ...values, name });
		} catch (err) {
			const fieldErrors = err.fieldErrors ?? {};
			setErrors(fieldErrors);
			if (Object.keys(fieldErrors).length === 0)
				setFormError(err.message);
			if (fieldErrors.name) nameRef.current?.focus();
			setSaving(false);
		}
	}

	return (
		<form className={formStyles.form} onSubmit={handleSubmit} noValidate>
			<div className={formStyles.fields}>
				<div className={styles.preview} aria-hidden="true">
					<CategoryIcon
						icon={values.icon}
						color={values.color}
						size="md"
					/>
					<span className={styles.previewName}>
						{values.name.trim() || "New category"}
					</span>
				</div>

				<div className={formStyles.field}>
					<label htmlFor="category-name" className={formStyles.label}>
						Name
					</label>
					<input
						ref={nameRef}
						id="category-name"
						type="text"
						className={formStyles.input}
						value={values.name}
						maxLength={CATEGORY_NAME_MAX_LENGTH}
						onChange={(event) =>
							setField("name", event.target.value)
						}
						readOnly={isFallback}
						autoComplete="off"
						placeholder="e.g. Coffee"
						aria-invalid={errors.name ? "true" : undefined}
						aria-describedby={
							isFallback
								? "category-name-hint"
								: errors.name
									? "category-name-error"
									: undefined
						}
					/>
					{isFallback && (
						<p id="category-name-hint" className={styles.hint}>
							<Lock
								className={styles.hintIcon}
								strokeWidth={2}
								aria-hidden="true"
							/>
							"Other" can't be renamed or deleted. Deleted
							categories move their expenses here.
						</p>
					)}
					<FieldError id="category-name-error">
						{errors.name}
					</FieldError>
				</div>

				<div className={formStyles.field}>
					<ColorPicker
						value={values.color}
						onChange={(color) => setField("color", color)}
						error={errors.color}
						errorId="category-color-error"
					/>
					<FieldError id="category-color-error">
						{errors.color}
					</FieldError>
				</div>

				<div className={formStyles.field}>
					<IconPicker
						value={values.icon}
						color={values.color}
						onChange={(icon) => setField("icon", icon)}
						error={errors.icon}
						errorId="category-icon-error"
					/>
					<FieldError id="category-icon-error">
						{errors.icon}
					</FieldError>
				</div>
			</div>

			<div className={formStyles.footer}>
				{formError && (
					<div role="alert">
						<FieldError id="category-form-error">
							{formError}
						</FieldError>
					</div>
				)}
				<div className={formStyles.actions}>
					{isEdit && !isFallback && (
						<Button
							variant="danger"
							icon={Trash2}
							onClick={onDelete}
							disabled={saving}
						>
							Delete
						</Button>
					)}
					<Button
						type="submit"
						className={formStyles.save}
						loading={saving}
						loadingText="Saving…"
					>
						{isEdit ? "Save changes" : "Add category"}
					</Button>
				</div>
			</div>
		</form>
	);
}
