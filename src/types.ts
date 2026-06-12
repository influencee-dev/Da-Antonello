export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  isAvailableForMetro?: boolean; // Can this pizza flavor be used to compose a Pizza al Metro?
  image?: string; // We'll generate/use elegant background/placeholders
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  location?: string;
  isVerified?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (since same pizza can have different configurations)
  menuItem: MenuItem;
  quantity: number;
  finalPrice: number;
  
  // Customization for "Pizza al Metro"
  isPizzaMetroSection?: boolean;
  metroSize?: "mezzo-metro" | "un-metro"; // 50cm or 100cm
  selectedFlavors?: string[]; // Array of flavor names (e.g., ["Margherita", "Diavola"])
  
  // Standard customizations
  doughType?: "Classico" | "Integrale" | "Senza Glutine";
  addedIngredients?: string[];
  customNote?: string;
}

export interface TableBooking {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  areaPreference?: "Interno" | "Esterno / Terrazza" | "Non importa";
  notes?: string;
}

export interface DeliveryBooking {
  name: string;
  phone: string;
  type: "delivery" | "asporto";
  address?: string; // Required for delivery only
  time: string; // Ready/Delivery requested time
  paymentMethod: "Contanti" | "POS al rider" | "PayPal / Pre-pagato WhatsApp";
  notes?: string;
}
