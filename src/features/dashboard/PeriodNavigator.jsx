import { ChevronLeft, ChevronRight } from "lucide-react";
import SegmentedControl from "../../components/SegmentedControl.jsx";
import IconButton from "../../components/IconButton.jsx";
import { DASHBOARD_PERIOD_OPTIONS } from "../../constants/expenses.js";
import styles from "./PeriodNavigator.module.css";

const PERIOD_NAMES = { day: "day", week: "week", month: "month" };

export default function PeriodNavigator({
	period,
	onPeriodChange,
	rangeLabel,
	onPrevious,
	onNext,
	canGoNext,
}) {
	return (
		<div className={styles.navigator}>
			<div className={styles.periods}>
				<SegmentedControl
					label="Period"
					options={DASHBOARD_PERIOD_OPTIONS}
					value={period}
					onChange={onPeriodChange}
					fullWidth
				/>
			</div>
			<div className={styles.range}>
				<IconButton
					icon={ChevronLeft}
					label={`Previous ${PERIOD_NAMES[period]}`}
					onClick={onPrevious}
				/>
				<h2 className={styles.title} aria-live="polite">
					{rangeLabel}
				</h2>
				<IconButton
					icon={ChevronRight}
					label={`Next ${PERIOD_NAMES[period]}`}
					onClick={onNext}
					disabled={!canGoNext}
				/>
			</div>
		</div>
	);
}
