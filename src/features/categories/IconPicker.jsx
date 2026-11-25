import { useId } from "react";
import { CATEGORY_ICON_OPTIONS } from "../../constants/categoryIcons.js";
import styles from "./IconPicker.module.css";

export default function IconPicker({ value, color, onChange, error, errorId }) {
	const name = useId();
	const selected = CATEGORY_ICON_OPTIONS.find(
		(option) => option.name === value,
	);

	return (
		<fieldset
			className={styles.fieldset}
			aria-describedby={error ? errorId : undefined}
			style={{
				"--tint": `var(--cat-${color}-bg)`,
				"--ink": `var(--cat-${color}-icon)`,
			}}
		>
			<legend className={styles.legend}>
				Icon{" "}
				{selected && (
					<span className={styles.selectedName}>
						· {selected.label}
					</span>
				)}
			</legend>
			<div className={styles.grid}>
				{CATEGORY_ICON_OPTIONS.map(
					({ name: iconName, label, Icon }) => {
						const id = `${name}-${iconName}`;
						return (
							<span key={iconName} className={styles.option}>
								<input
									type="radio"
									id={id}
									name={name}
									value={iconName}
									checked={value === iconName}
									onChange={() => onChange(iconName)}
									className={styles.input}
									aria-label={label}
								/>
								<label htmlFor={id} className={styles.tile}>
									<Icon strokeWidth={2} aria-hidden="true" />
								</label>
							</span>
						);
					},
				)}
			</div>
		</fieldset>
	);
}
