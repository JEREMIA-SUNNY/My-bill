import { 
  Utensils, ShoppingCart, Bus, Wallet, Banknote, 
  Home, Zap, Film, Gamepad, Gift, 
  Coffee, Shirt, Plane, Car, Fuel,
  Smartphone, Dumbbell, Stethoscope, GraduationCap, Briefcase,
  CreditCard, Heart, Music, Book, Laptop, Wifi,
  Pizza, Sandwich, IceCream, Wine, Beer, Apple,
  ShoppingBag, Tag, Package, Store, TrendingUp,
  Train, Bike, Ship, Rocket, MapPin,
  Tv, Headphones, Camera, Palette, Brush,
  Pill, Activity, Bed, Baby, Dog, Cat,
  Trees, Flower2, Sun, Moon, Cloud, Umbrella,
  Wrench, Hammer, Scissors, Key, Lock,
  DollarSign, PiggyBank, TrendingDown, Calculator, Receipt,
  Users, UserPlus, Mail, Phone, MessageCircle,
  Calendar, Clock, Timer, Award, Trophy,
  Star, Heart as HeartIcon, Sparkles, Flame, Zap as Lightning
} from "lucide-react"

export const CATEGORY_COLORS = [
  // Reds & Pinks
  "#FF6B6B", // Bright Red
  "#E74C3C", // Red
  "#C0392B", // Dark Red
  "#FF9FF3", // Pink
  "#FD79A8", // Light Pink
  "#E84393", // Magenta
  
  // Oranges & Yellows
  "#FF9F43", // Orange
  "#F39C12", // Dark Orange
  "#E67E22", // Burnt Orange
  "#FECA57", // Yellow
  "#F1C40F", // Golden Yellow
  "#FFA502", // Amber
  
  // Greens
  "#1DD1A1", // Mint Green
  "#00B894", // Emerald
  "#27AE60", // Green
  "#2ECC71", // Light Green
  "#16A085", // Teal
  "#1ABC9C", // Turquoise
  
  // Blues
  "#48DBFB", // Sky Blue
  "#54A0FF", // Blue
  "#3498DB", // Bright Blue
  "#2980B9", // Dark Blue
  "#0984E3", // Ocean Blue
  "#74B9FF", // Light Blue
  
  // Purples
  "#5F27CD", // Purple
  "#9B59B6", // Violet
  "#8E44AD", // Dark Purple
  "#A29BFE", // Lavender
  "#6C5CE7", // Indigo
  
  // Browns & Neutrals
  "#A0826D", // Brown
  "#8D6E63", // Dark Brown
  "#8395A7", // Grey
  "#636E72", // Dark Grey
  "#2D3436", // Charcoal
  "#222F3E", // Almost Black
]

export const CATEGORY_ICONS = [
  // Food & Dining
  { name: "Utensils", icon: Utensils },
  { name: "Pizza", icon: Pizza },
  { name: "Coffee", icon: Coffee },
  { name: "Sandwich", icon: Sandwich },
  { name: "IceCream", icon: IceCream },
  { name: "Wine", icon: Wine },
  { name: "Beer", icon: Beer },
  { name: "Apple", icon: Apple },
  
  // Shopping & Retail
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Tag", icon: Tag },
  { name: "Package", icon: Package },
  { name: "Store", icon: Store },
  { name: "Gift", icon: Gift },
  { name: "Shirt", icon: Shirt },
  
  // Transportation
  { name: "Bus", icon: Bus },
  { name: "Car", icon: Car },
  { name: "Fuel", icon: Fuel },
  { name: "Plane", icon: Plane },
  { name: "Train", icon: Train },
  { name: "Bike", icon: Bike },
  { name: "Ship", icon: Ship },
  { name: "Rocket", icon: Rocket },
  { name: "MapPin", icon: MapPin },
  
  // Finance & Money
  { name: "Wallet", icon: Wallet },
  { name: "Banknote", icon: Banknote },
  { name: "CreditCard", icon: CreditCard },
  { name: "DollarSign", icon: DollarSign },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "TrendingDown", icon: TrendingDown },
  { name: "Calculator", icon: Calculator },
  { name: "Receipt", icon: Receipt },
  
  // Home & Utilities
  { name: "Home", icon: Home },
  { name: "Zap", icon: Zap },
  { name: "Wifi", icon: Wifi },
  { name: "Wrench", icon: Wrench },
  { name: "Hammer", icon: Hammer },
  { name: "Key", icon: Key },
  { name: "Lock", icon: Lock },
  
  // Entertainment & Media
  { name: "Film", icon: Film },
  { name: "Tv", icon: Tv },
  { name: "Gamepad", icon: Gamepad },
  { name: "Music", icon: Music },
  { name: "Headphones", icon: Headphones },
  { name: "Camera", icon: Camera },
  
  // Technology
  { name: "Smartphone", icon: Smartphone },
  { name: "Laptop", icon: Laptop },
  
  // Health & Fitness
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "Pill", icon: Pill },
  { name: "Activity", icon: Activity },
  { name: "Heart", icon: Heart },
  { name: "Bed", icon: Bed },
  
  // Education & Work
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Briefcase", icon: Briefcase },
  { name: "Book", icon: Book },
  
  // Family & Pets
  { name: "Baby", icon: Baby },
  { name: "Dog", icon: Dog },
  { name: "Cat", icon: Cat },
  { name: "Users", icon: Users },
  { name: "UserPlus", icon: UserPlus },
  
  // Nature & Weather
  { name: "Trees", icon: Trees },
  { name: "Flower", icon: Flower2 },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Cloud", icon: Cloud },
  { name: "Umbrella", icon: Umbrella },
  
  // Art & Creativity
  { name: "Palette", icon: Palette },
  { name: "Brush", icon: Brush },
  { name: "Scissors", icon: Scissors },
  
  // Communication
  { name: "Mail", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "MessageCircle", icon: MessageCircle },
  
  // Time & Events
  { name: "Calendar", icon: Calendar },
  { name: "Clock", icon: Clock },
  { name: "Timer", icon: Timer },
  
  // Achievement & Special
  { name: "Award", icon: Award },
  { name: "Trophy", icon: Trophy },
  { name: "Star", icon: Star },
  { name: "Sparkles", icon: Sparkles },
  { name: "Flame", icon: Flame },
  { name: "Lightning", icon: Lightning },
]

export function getIconComponent(name: string) {
  const item = CATEGORY_ICONS.find(i => i.name === name)
  return item ? item.icon : Wallet
}
