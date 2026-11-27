import {
  UtensilsCrossed, Coffee, ShoppingCart, ShoppingBag, Shirt, House,
  Receipt, Zap, Wifi, Smartphone, Car, Bus,
  Fuel, Plane, HeartPulse, Pill, Dumbbell, GraduationCap,
  BookOpen, Gamepad2, Clapperboard, Gift, PawPrint, Repeat, Sparkles,
} from 'lucide-react';

// Text limits
export const CATEGORY_NAME_MAX_LENGTH = 40;
export const NOTE_MAX_LENGTH = 200;

// Icons
export const CATEGORY_ICON_OPTIONS = [
  { name: 'UtensilsCrossed', label: 'Food', Icon: UtensilsCrossed },
  { name: 'Coffee', label: 'Coffee', Icon: Coffee },
  { name: 'ShoppingCart', label: 'Groceries', Icon: ShoppingCart },
  { name: 'ShoppingBag', label: 'Shopping bag', Icon: ShoppingBag },
  { name: 'Shirt', label: 'Clothes', Icon: Shirt },
  { name: 'House', label: 'Home', Icon: House },
  { name: 'Receipt', label: 'Receipt', Icon: Receipt },
  { name: 'Zap', label: 'Electricity', Icon: Zap },
  { name: 'Wifi', label: 'Internet', Icon: Wifi },
  { name: 'Smartphone', label: 'Phone', Icon: Smartphone },
  { name: 'Car', label: 'Car', Icon: Car },
  { name: 'Bus', label: 'Bus', Icon: Bus },
  { name: 'Fuel', label: 'Fuel', Icon: Fuel },
  { name: 'Plane', label: 'Plane', Icon: Plane },
  { name: 'HeartPulse', label: 'Health', Icon: HeartPulse },
  { name: 'Pill', label: 'Medicine', Icon: Pill },
  { name: 'Dumbbell', label: 'Fitness', Icon: Dumbbell },
  { name: 'GraduationCap', label: 'Education', Icon: GraduationCap },
  { name: 'BookOpen', label: 'Books', Icon: BookOpen },
  { name: 'Gamepad2', label: 'Games', Icon: Gamepad2 },
  { name: 'Clapperboard', label: 'Movies', Icon: Clapperboard },
  { name: 'Gift', label: 'Gifts', Icon: Gift },
  { name: 'PawPrint', label: 'Pets', Icon: PawPrint },
  { name: 'Repeat', label: 'Subscriptions', Icon: Repeat },
  { name: 'Sparkles', label: 'Other', Icon: Sparkles },
];

export const CATEGORY_ICONS = Object.fromEntries(CATEGORY_ICON_OPTIONS.map(({ name, Icon }) => [name, Icon]));

export const FALLBACK_CATEGORY_ICON = Sparkles;
