import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems.js";
import styles from "./BottomTabBar.module.css";

// mobile and tablet navigation
export default function BottomTabBar() {
	return (
		<nav className={styles.bar} aria-label="Main">
			<ul className={styles.list}>
				{NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
					<li key={to} className={styles.item}>
						<NavLink
							to={to}
							end={end}
							className={({ isActive }) =>
								`${styles.link} ${isActive ? styles.active : ""}`
							}
						>
							<Icon strokeWidth={2} aria-hidden="true" />
							<span className={styles.label}>{label}</span>
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}
