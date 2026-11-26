import { Routes, Route } from "react-router-dom";
import { AppLayout } from './components/Layout.jsx';
import PreferencesProvider from "./context/PreferencesProvider.jsx";
import DataProvider from "./context/DataProvider.jsx";
import ToastProvider from "./context/ToastProvider.jsx";
import HomePage from "./pages/HomePage.jsx";
import ExpensesPage from "./pages/ExpensesPage.jsx";
import ExpenseDetailPage from "./pages/ExpenseDetailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
	return (
		<PreferencesProvider>
			<DataProvider>
				<ToastProvider>
					<Routes>
						<Route element={<AppLayout />}>
							<Route index element={<HomePage />} />
							<Route
								path="/expenses"
								element={<ExpensesPage />}
							/>
							<Route
								path="expenses/:id"
								element={<ExpenseDetailPage />}
							/>
							<Route
								path="dashboard"
								element={<DashboardPage />}
							/>
							<Route
								path="categories"
								element={<CategoriesPage />}
							/>
							<Route path="settings" element={<SettingsPage />} />
						</Route>
					</Routes>
				</ToastProvider>
			</DataProvider>
		</PreferencesProvider>
	);
}
