import { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext } from "./ToastContext.js";
import Toast from "../components/Toast.jsx";
import { UNDO_WINDOW_MS } from "../constants/expenses.js";

export default function ToastProvider({ children }) {
	const [toast, setToast] = useState(null);
	const timerRef = useRef(null);
	const nextId = useRef(1);

	const dismissToast = useCallback((id) => {
		setToast((current) => {
			if (current && (id === undefined || current.id === id)) {
				clearTimeout(timerRef.current);
				return null;
			}
			return current;
		});
	}, []);

	const showToast = useCallback(
		({ message, tone = "success", action, duration = UNDO_WINDOW_MS }) => {
			const id = nextId.current++;
			clearTimeout(timerRef.current);
			setToast({ id, message, tone, action });
			timerRef.current = setTimeout(() => dismissToast(id), duration);
			return id;
		},
		[dismissToast],
	);

	const value = useMemo(
		() => ({ showToast, dismissToast }),
		[showToast, dismissToast],
	);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div role="status" aria-live="polite">
				{toast && (
					<Toast
						key={toast.id}
						{...toast}
						onDismiss={() => dismissToast(toast.id)}
					/>
				)}
			</div>
		</ToastContext.Provider>
	);
}
