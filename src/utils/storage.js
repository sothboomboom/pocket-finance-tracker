import { CURRENCIES, BASE_CURRENCY } from "../constants/currencies.js";

const LAST_CURRENCY_KEY = "pocket:lastCurrency";

export function getLastCurrency() {
	try {
		const code = localStorage.getItem(LAST_CURRENCY_KEY);
		return code && CURRENCIES[code] ? code : BASE_CURRENCY;
	} catch {
		return BASE_CURRENCY;
	}
}

export function setLastCurrency(code) {
	try {
		localStorage.setItem(LAST_CURRENCY_KEY, code);
	} catch {
		// the picker starts at USD next time
	}
}
