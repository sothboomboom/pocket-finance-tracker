import { CircleAlert } from "lucide-react";
import Card from "../../components/Card.jsx";
import Tag from "../../components/Tag.jsx";
import { ErrorState, Skeleton } from '../../components/Feedback.jsx';
import { CURRENCIES } from "../../constants/currencies.js";
import { formatMoney } from "../../utils/money.js";
import { format, differenceInHours } from "date-fns";
import styles from "./RatesCard.module.css";

const ROWS = [
	{ code: "KRW", name: "Korean won" },
	{ code: "JPY", name: "Japanese yen" },
	{ code: "CNY", name: "Chinese yuan" },
	{ code: "KHR", name: "Cambodian riel", fixed: true },
];

function RatesStatus({ updatedAt, source }) {
	if (source === "fallback") {
		return (
			<span className={styles.warning}>
				<CircleAlert
					className={styles.warningIcon}
					strokeWidth={2}
					aria-hidden="true"
				/>
				Couldn't reach the rate service. Using built-in rates.
			</span>
		);
	}
	const date = new Date(updatedAt);
	const stale = differenceInHours(new Date(), date) >= 24;
	return (
		<span>
			Rates updated: {format(date, "MMM d")}
			{stale && " · couldn't refresh today"}
		</span>
	);
}

export default function RatesCard({
	rates,
	updatedAt,
	source,
	status,
	error,
	onRetry,
}) {
	return (
		<Card
			title="Exchange rates"
			subtitle={
				status === "success" ? (
					<RatesStatus updatedAt={updatedAt} source={source} />
				) : (
					"Loading rates…"
				)
			}
		>
			{status === "loading" && <Skeleton className={styles.skeleton} />}
			{status === "error" && (
				<ErrorState message={error?.message} onRetry={onRetry} />
			)}
			{status === "success" && (
				<>
					<ul className={styles.list}>
						{ROWS.map(({ code, name, fixed }) => (
							<li key={code} className={styles.row}>
								<span
									className={styles.symbol}
									aria-hidden="true"
								>
									{CURRENCIES[code].symbol}
								</span>
								<span className={styles.currency}>
									<span className={styles.code}>{code}</span>
									<span className={styles.name}>{name}</span>
								</span>
								{fixed && <Tag>Fixed</Tag>}
								<span className={`${styles.rate} tabular-nums`}>
									$1 = {formatMoney(1 / rates[code], code)}
								</span>
							</li>
						))}
					</ul>
					<p className={styles.note}>
						Each expense keeps the rate from the day you saved it,
						so past totals never change.
					</p>
				</>
			)}
		</Card>
	);
}
