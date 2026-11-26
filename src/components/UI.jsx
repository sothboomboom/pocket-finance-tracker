import { useId } from "react";
import { Link } from "react-router-dom";
import {
	CATEGORY_ICONS,
	FALLBACK_CATEGORY_ICON,
} from "../constants/categories.js";
import { formatMoney } from "../utils/money.js";
import { BASE_CURRENCY } from "../constants/currencies.js";
import styles from "./UI.module.css";

//////////////////////////////
// Card
//////////////////////////////

export function Card({ title, subtitle, action, className = "", children }) {
	const titleId = useId();
	return (
		<section
			className={`${styles.card} ${className}`}
			aria-labelledby={titleId}
		>
			<header className={styles.header}>
				<div className={styles.titles}>
					<h2 id={titleId} className={styles.title}>
						{title}
					</h2>
					{subtitle && <div className="text-meta">{subtitle}</div>}
				</div>
				{action}
			</header>
			{children}
		</section>
	);
}

//////////////////////////////
// Tag
//////////////////////////////

export function Tag({ children }) {
	return <span className={styles.tag}>{children}</span>;
}

//////////////////////////////
// SegmentedControl
//////////////////////////////

export function SegmentedControl({
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
			<legend className={showLabel ? "field-legend" : "visually-hidden"}>
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

//////////////////////////////
// CategoryIcon
//////////////////////////////

export function CategoryIcon({ icon, color, size = "sm" }) {
	const Icon = CATEGORY_ICONS[icon] ?? FALLBACK_CATEGORY_ICON;
	return (
		<span
			className={`${styles.circle} ${styles[size]}`}
			style={{
				"--circle-bg": `var(--cat-${color}-bg)`,
				"--circle-fg": `var(--cat-${color}-icon)`,
			}}
			aria-hidden="true"
		>
			<Icon strokeWidth={2} />
		</span>
	);
}

//////////////////////////////
// ExpenseRow
//////////////////////////////

export function ExpenseRow({ expense }) {
	const { id, note, category, paymentMethod, amountUsd, amount, currency } =
		expense;
	const isForeign = currency !== BASE_CURRENCY;

	return (
		<Link to={`/expenses/${id}`} className={styles.row}>
			<CategoryIcon icon={category.icon} color={category.color} />

			<span className={styles.main}>
				<span className={styles.expenseRowTitle}>
					{note || category.name}
				</span>
				<span className={styles.meta}>
					<Tag>{paymentMethod === "cash" ? "Cash" : "Bank"}</Tag>
					{note && (
						<span className={styles.secondary}>
							{category.name}
						</span>
					)}
				</span>
			</span>

			<span className={styles.amounts}>
				<span className={`${styles.amount} tabular-nums`}>
					{formatMoney(amountUsd)}
				</span>
				{isForeign && (
					<span className={`${styles.secondary} tabular-nums`}>
						≈ {formatMoney(amountUsd)} ·{" "}
						{formatMoney(amount, currency)}
					</span>
				)}
			</span>
		</Link>
	);
}
