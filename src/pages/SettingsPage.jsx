import PageHeader from "../components/PageHeader.jsx";
import RatesCard from "../features/settings/RatesCard.jsx";
import SampleDataCard from "../features/settings/SampleDataCard.jsx";
import { useRates } from "../hooks/useRates.js";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
	const rates = useRates();

	return (
		<div className={styles.page}>
			<PageHeader title="Settings" />
			<div className={styles.sections}>
				<RatesCard {...rates} onRetry={rates.reload} />
				<SampleDataCard />
			</div>
		</div>
	);
}
