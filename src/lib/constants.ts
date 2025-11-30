import { 
  Utensils, ShoppingCart, Bus, Wallet, Banknote, 
  Home, Zap, Film, Gamepad, Gift, 
  Coffee, Shirt, Plane, Car, Fuel,
  Smartphone, Dumbbell, Stethoscope, GraduationCap, Briefcase,
  CreditCard
} from "lucide-react"

export const CATEGORY_COLORS = [
  "#FF6B6B", // Red
  "#FF9F43", // Orange
  "#FECA57", // Yellow
  "#1DD1A1", // Green
  "#48DBFB", // Blue
  "#54A0FF", // Dark Blue
  "#5F27CD", // Purple
  "#FF9FF3", // Pink
  "#8395A7", // Grey
  "#222F3E", // Dark
]

export const CATEGORY_ICONS = [
  { name: "Utensils", icon: Utensils },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Bus", icon: Bus },
  { name: "Car", icon: Car },
  { name: "Fuel", icon: Fuel },
  { name: "Plane", icon: Plane },
  { name: "Wallet", icon: Wallet },
  { name: "Banknote", icon: Banknote },
  { name: "CreditCard", icon: CreditCard },
  { name: "Home", icon: Home },
  { name: "Zap", icon: Zap },
  { name: "Film", icon: Film },
  { name: "Gamepad", icon: Gamepad },
  { name: "Gift", icon: Gift },
  { name: "Coffee", icon: Coffee },
  { name: "Shirt", icon: Shirt },
  { name: "Smartphone", icon: Smartphone },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Briefcase", icon: Briefcase },
]

export function getIconComponent(name: string) {
  const item = CATEGORY_ICONS.find(i => i.name === name)
  return item ? item.icon : Wallet
}
