import { useCallback, useState } from "react";

export function useSheet() {
	const [open, setOpen] = useState(false);
	const [session, setSession] = useState(0);

	const openSheet = useCallback(() => {
		setSession((s) => s + 1);
		setOpen(true);
	}, []);
	const closeSheet = useCallback(() => setOpen(false), []);

	return { open, session, openSheet, closeSheet };
}
