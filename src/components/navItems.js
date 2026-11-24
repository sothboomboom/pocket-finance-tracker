import { House, ReceiptText, ChartPie, Tags, Settings } from "lucide-react";

export const NAV_ITEMS = [
	{ to: "/", label: "Home", icon: House, end: true },
	{ to: "/expenses", label: "Expenses", icon: ReceiptText },
	{ to: "/dashboard", label: "Dashboard", icon: ChartPie },
	{ to: "/categories", label: "Categories", icon: Tags },
	{ to: "/settings", label: "Settings", icon: Settings },
];
