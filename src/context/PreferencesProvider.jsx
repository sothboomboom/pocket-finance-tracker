import { useCallback, useMemo, useState } from "react";
import { PreferencesContext } from "./PreferencesContext.js";
import {
	getLastCurrency,
	setLastCurrency as saveLastCurrency,
} from "../utils/storage.js";

/**
 * Preferences saved in localStorage
 * lastCurrency: the expense form starts on the last currency used
 */
export default function PreferencesProvider({ children }) {
	const [lastCurrency, setLastCurrencyState] = useState(getLastCurrency);

	const setLastCurrency = useCallback((code) => {
		saveLastCurrency(code);
		setLastCurrencyState(code);
	}, []);

	const value = useMemo(
		() => ({ lastCurrency, setLastCurrency }),
		[lastCurrency, setLastCurrency],
	);

	return (
		<PreferencesContext.Provider value={value}>
			{children}
		</PreferencesContext.Provider>
	);
}
