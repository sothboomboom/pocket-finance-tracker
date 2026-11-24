import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import BottomTabBar from "./BottomTabBar.jsx";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
	return (
		<div className={styles.shell}>
			<Sidebar />
			<main className={styles.main}>
				<div className={styles.content}>
					<Outlet />
				</div>
			</main>
			<BottomTabBar />
		</div>
	);
}
