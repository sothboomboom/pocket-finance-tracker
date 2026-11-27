import { NavLink, Outlet } from "react-router-dom";
import {
	Wallet,
	House,
	ReceiptText,
	ChartPie,
	Tags,
	Settings,
	Plus,
} from "lucide-react";
import styles from "./Layout.module.css";

const NAV_ITEMS = [
	{ to: "/", label: "Home", icon: House, end: true },
	{ to: "/expenses", label: "Expenses", icon: ReceiptText },
	{ to: "/dashboard", label: "Dashboard", icon: ChartPie },
	{ to: "/categories", label: "Categories", icon: Tags },
	{ to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
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

// Desktop navigation (wider than 1024px).
function Sidebar() {
	return (
		<header className={styles.sidebar}>
			<div className={styles.brand}>
				<span className={styles.logo} aria-hidden="true">
					<Wallet strokeWidth={2} />
				</span>
				<span className={styles.wordmark}>Pocket</span>
			</div>

			<nav aria-label="Main">
				<ul className={styles.sideList}>
					{NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
						<li key={to}>
							<NavLink
								to={to}
								end={end}
								className={({ isActive }) =>
									`${styles.sideLink} ${isActive ? styles.sideActive : ""}`
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

// Mobile and tablet navigation. Icons always have text labels.
function BottomTabBar() {
	return (
		<nav className={styles.bar} aria-label="Main">
			<ul className={styles.tabList}>
				{NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
					<li key={to} className={styles.tabItem}>
						<NavLink
							to={to}
							end={end}
							className={({ isActive }) =>
								`${styles.tabLink} ${isActive ? styles.tabActive : ""}`
							}
						>
							<Icon strokeWidth={2} aria-hidden="true" />
							<span className={styles.tabLabel}>{label}</span>
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}

// Renders the page's only <h1>.
export function PageHeader({ title, eyebrow, actions }) {
	return (
		<header className={styles.header}>
			<div className={styles.titles}>
				{eyebrow && <p className="eyebrow">{eyebrow}</p>}
				<h1 className={styles.title}>{title}</h1>
			</div>
			{actions && <div className={styles.actions}>{actions}</div>}
		</header>
	);
}

export function Fab({ label, onClick }) {
	return (
		<button
			type="button"
			className={styles.fab}
			aria-label={label}
			onClick={onClick}
		>
			<Plus strokeWidth={2.5} aria-hidden="true" />
		</button>
	);
}
