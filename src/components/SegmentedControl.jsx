import { useId } from "react";
import styles from "./SegmentedControl.module.css";

export default function SegmentedControl({
	label,
	showLabel = false,
	options,
	value,
	onChange,
	name,
	fullWidth = false,
	compact = false,
}) {
	const generatedName = useId();
	const groupName = name ?? generatedName;
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);

	return (
		<fieldset
			className={`${styles.control} ${fullWidth ? styles.fullWidth : ""} ${compact ? styles.compact : ""}`}
		>
			<legend className={showLabel ? styles.legend : "visually-hidden"}>
				{label}
			</legend>
			<div
				className={styles.track}
				style={{ "--count": options.length, "--index": selectedIndex }}
			>
				<span className={styles.pill} aria-hidden="true" />
				{options.map((option) => {
					const id = `${groupName}-${option.value}`;
					return (
						<span key={option.value} className={styles.option}>
							<input
								type="radio"
								id={id}
								name={groupName}
								value={option.value}
								aria-label={option.ariaLabel}
								checked={option.value === value}
								onChange={() => onChange(option.value)}
								className={styles.input}
							/>
							<label htmlFor={id} className={styles.label}>
								{option.label}
							</label>
						</span>
					);
				})}
			</div>
		</fieldset>
	);
}
