import { useId } from "react";
import { Check } from "lucide-react";
import { CATEGORY_COLOR_OPTIONS } from '../../constants/categories.js';
import styles from "./ColorPicker.module.css";

export default function ColorPicker({ value, onChange, error, errorId }) {
	const name = useId();
	const selected = CATEGORY_COLOR_OPTIONS.find(
		(option) => option.value === value,
	);

	return (
		<fieldset
			className={styles.fieldset}
			aria-describedby={error ? errorId : undefined}
		>
			<legend className={styles.legend}>
				Color{" "}
				{selected && (
					<span className={styles.selectedName}>
						· {selected.label}
					</span>
				)}
			</legend>
			<div className={styles.grid}>
				{CATEGORY_COLOR_OPTIONS.map((option) => {
					const id = `${name}-${option.value}`;
					return (
						<span key={option.value} className={styles.option}>
							<input
								type="radio"
								id={id}
								name={name}
								value={option.value}
								checked={value === option.value}
								onChange={() => onChange(option.value)}
								className={styles.input}
								aria-label={option.label}
							/>
							<label
								htmlFor={id}
								className={styles.swatch}
								style={{
									"--swatch": `var(--cat-${option.value}-chart)`,
								}}
							>
								<Check
									className={styles.check}
									strokeWidth={3}
									aria-hidden="true"
								/>
							</label>
						</span>
					);
				})}
			</div>
		</fieldset>
	);
}
