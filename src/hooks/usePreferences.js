import { useContext } from "react";
import { PreferencesContext } from "../context/PreferencesContext.js";

export function usePreferences() {
	const context = useContext(PreferencesContext);
	if (!context)
		throw new Error(
			"usePreferences must be used inside <PreferencesProvider>",
		);
	return context;
}
