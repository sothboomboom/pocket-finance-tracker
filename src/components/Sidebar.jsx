import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";
import { NAV_ITEMS } from "./navItems.js";
import styles from "./Sidebar.module.css";

// Desktop navigation (wider than 1024px).
export default function Sidebar() {
	return (
		<header className={styles.sidebar}>
			<div className={styles.brand}>
				<span className={styles.logo} aria-hidden="true">
					<Wallet strokeWidth={2} />
				</span>
				<span className={styles.wordmark}>Pocket</span>
			</div>

			<nav aria-label="Main">
				<ul className={styles.list}>
					{NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
						<li key={to}>
							<NavLink
								to={to}
								end={end}
								className={({ isActive }) =>
									`${styles.link} ${isActive ? styles.active : ""}`
								}
							>
								<Icon strokeWidth={2} aria-hidden="true" />
								{label}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>
		</header>
	);
}
