import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ExpensesPage from "./pages/ExpensesPage.jsx";
import ExpenseDetailPage from "./pages/ExpenseDetailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Every route exists from day one, so owners only replace their page files.
export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/expenses" element={<ExpensesPage />} />
			{/* /expenses/12 → useParams() gives { id: '12' } */}
			<Route path="/expenses/:id" element={<ExpenseDetailPage />} />
			<Route path="/dashboard" element={<DashboardPage />} />
			<Route path="/categories" element={<CategoriesPage />} />
			<Route path="/settings" element={<SettingsPage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}
