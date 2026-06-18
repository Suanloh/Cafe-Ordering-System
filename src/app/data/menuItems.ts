import { MenuItem } from "../types";

export const menuItems: MenuItem[] = [
  // Coffee
  {
    id: "1",
    name: "Espresso",
    description: "Rich and bold Italian espresso",
    price: 2.50,
    category: "coffee",
    image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3ODE2MzczMjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Single", "Double", "Triple"]
  },
  {
    id: "2",
    name: "Cappuccino",
    description: "Classic cappuccino with steamed milk and foam",
    price: 4.00,
    category: "coffee",
    image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwbGF0dGUlMjBhcnR8ZW58MXx8fHwxNzgxNjE5NzcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Regular", "Decaf", "Oat Milk", "Almond Milk"]
  },
  {
    id: "3",
    name: "Iced Coffee",
    description: "Refreshing cold brew over ice",
    price: 3.50,
    category: "coffee",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwY29mZmVlJTIwZHJpbmt8ZW58MXx8fHwxNzgxNjEyNjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["With Milk", "Black", "Sweetened"]
  },
  {
    id: "4",
    name: "Matcha Latte",
    description: "Premium matcha green tea with steamed milk",
    price: 4.75,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBncmVlbiUyMHRlYSUyMGxhdHRlfGVufDF8fHx8MTc4MTY4OTAwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Hot", "Iced", "Extra Sweet"]
  },
  // Food
  {
    id: "5",
    name: "Club Sandwich",
    description: "Triple-decker with turkey, bacon, lettuce, and tomato",
    price: 8.50,
    category: "food",
    image: "https://images.unsplash.com/photo-1716535233357-822bcc293573?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGNhZmUlMjBsdW5jaHxlbnwxfHx8fDE3ODE2ODkwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["White Bread", "Whole Wheat", "No Mayo"]
  },
  {
    id: "6",
    name: "Caesar Salad",
    description: "Fresh romaine with parmesan and croutons",
    price: 7.00,
    category: "food",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwYm93bHxlbnwxfHx8fDE3ODE2MzA1NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Add Chicken", "Add Shrimp", "Dressing on Side"]
  },
  {
    id: "7",
    name: "Cream Cheese Bagel",
    description: "Toasted bagel with cream cheese",
    price: 3.50,
    category: "food",
    image: "https://images.unsplash.com/photo-1601585099780-6b176dc702af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWdlbCUyMGNyZWFtJTIwY2hlZXNlfGVufDF8fHx8MTc4MTY4OTAwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Plain", "Everything", "Sesame"]
  },
  // Pastries
  {
    id: "8",
    name: "Butter Croissant",
    description: "Flaky, buttery French croissant",
    price: 3.00,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnklMjBiYWtlcnl8ZW58MXx8fHwxNzgxNTg0NzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Plain", "Chocolate", "Almond"]
  },
  {
    id: "9",
    name: "Blueberry Muffin",
    description: "Fresh baked muffin with blueberries",
    price: 3.25,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWZmaW4lMjBibHVlYmVycnklMjBiYWtlcnl8ZW58MXx8fHwxNzgxNjg5MDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true
  },
  {
    id: "10",
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake",
    price: 4.50,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlJTIwc2xpY2V8ZW58MXx8fHwxNzgxNjE0MDcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true
  },
  {
    id: "11",
    name: "Chocolate Chip Cookies",
    description: "Freshly baked chocolate chip cookies (3 pack)",
    price: 4.00,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raWVzJTIwY2hvY29sYXRlJTIwY2hpcHxlbnwxfHx8fDE3ODE2MjM2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true
  },
  // Drinks
  {
    id: "12",
    name: "Berry Smoothie",
    description: "Fresh berry smoothie bowl",
    price: 6.00,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGhpZSUyMGZydWl0JTIwYm93bHxlbnwxfHx8fDE3ODE2ODkwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: true,
    customizations: ["Add Protein", "Add Granola"]
  }
];
