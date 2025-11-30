type SmartRule = {
  keywords: string[]
  categoryName: string
}

const SMART_RULES: SmartRule[] = [
  { keywords: ["zomato", "swiggy", "uber eats", "restaurant", "cafe", "coffee", "starbucks", "mcdonalds", "kfc", "burger king", "pizza", "lunch", "dinner", "breakfast"], categoryName: "Food" },
  { keywords: ["uber", "ola", "lyft", "grab", "taxi", "cab", "metro", "bus", "train", "flight", "airline", "fuel", "petrol", "gas"], categoryName: "Transport" },
  { keywords: ["amazon", "flipkart", "myntra", "zara", "h&m", "nike", "adidas", "shopping", "mall", "store"], categoryName: "Shopping" },
  { keywords: ["netflix", "spotify", "prime", "disney", "hulu", "movie", "cinema", "game", "steam", "playstation", "xbox"], categoryName: "Entertainment" },
  { keywords: ["rent", "electricity", "water", "internet", "wifi", "broadband", "bill", "maintenance"], categoryName: "Utilities" },
  { keywords: ["salary", "freelance", "upwork", "fiverr", "contract", "bonus", "dividend", "interest"], categoryName: "Salary" }, // For Income
]

export function predictCategory(text: string, categories: { id: string, name: string }[]): string | null {
  const lowerText = text.toLowerCase()
  
  for (const rule of SMART_RULES) {
    if (rule.keywords.some(keyword => lowerText.includes(keyword))) {
      const category = categories.find(c => c.name.toLowerCase() === rule.categoryName.toLowerCase())
      if (category) {
        return category.id
      }
    }
  }
  
  return null
}
