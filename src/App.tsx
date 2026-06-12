import { useState, useEffect } from "react";
import { MenuItem, CartItem } from "./types";
import { MENU_ITEMS, RESTAURANT_INFO } from "./data";
import LocalSEO from "./components/LocalSEO";
import PizzaMetroCustomizer from "./components/PizzaMetroCustomizer";
import ReviewSystem from "./components/ReviewSystem";
import TableBookingModal from "./components/TableBookingModal";
import CartDrawer from "./components/CartDrawer";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  UtensilsCrossed, 
  Heart,
  MessageSquareShare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORY_MAP: Record<string, string> = {
  "pizza-metro": "📏 Pizza al Metro",
  "menu": "🎁 Menù Promo",
  "pizze-rosse": "🍅 Pizze Rosse",
  "pizze-bianche": "⚪ Pizze Bianche",
  "calzoni": "🥐 Calzoni",
  "paposce": "🥖 Paposce",
  "straccetti": "🥓 Straccetti",
  "calzone-speciale-forno": "🔥 Maxi Panzerotti",
  "panini": "🍔 Panini",
  "antipasti": "🧀 Antipasti",
  "antipasti-di-mare": "🐙 Antipasti di Mare",
  "primi-di-terra": "🍝 Primi di Terra",
  "primi-di-mare": "🦞 Primi di Mare",
  "secondi-di-terra": "🥩 Secondi di Terra",
  "secondi-di-mare": "🐟 Secondi di Mare",
  "braceria": "🍢 Braceria",
  "contorni": "🥗 Contorni",
  "fritti": "🍳 Fritti",
  "birre": "🍺 Birre",
  "bevande": "🥤 Bevande",
  "dolci": "🧁 Dolci",
  "cocktail": "🍹 Cocktail",
  "vini-rossi": "🍷 Vini Rossi",
  "vini-rosati": "🌸 Vini Rosati",
  "vini-bianchi": "🥂 Vini Bianchi",
  "bollicine": "🍾 Bollicine",
  "pazzie-natale": "🎄 Pazzie Natale"
};

const CATEGORY_OPTIONS = [
  { id: "all", label: "✨ Tutto il Menu" },
  { id: "pizza-metro", label: "📏 Pizza al Metro" },
  { id: "menu", label: "🎁 Menù Promo" },
  { id: "pizze-rosse", label: "🍅 Pizze Rosse" },
  { id: "pizze-bianche", label: "⚪ Pizze Bianche" },
  { id: "calzoni", label: "🥐 Calzoni" },
  { id: "paposce", label: "🥖 Paposce" },
  { id: "straccetti", label: "🥓 Straccetti" },
  { id: "calzone-speciale-forno", label: "🔥 Maxi Panzerotti" },
  { id: "panini", label: "🍔 Panini Gourmet" },
  { id: "antipasti", label: "🧀 Antipasti di Terra" },
  { id: "antipasti-di-mare", label: "🐙 Antipasti di Mare" },
  { id: "primi-di-terra", label: "🍝 Primi di Terra" },
  { id: "primi-di-mare", label: "🦞 Primi di Mare" },
  { id: "secondi-di-terra", label: "🥩 Secondi di Terra" },
  { id: "secondi-di-mare", label: "🐟 Secondi di Mare" },
  { id: "braceria", label: "🍢 Braceria & Carni" },
  { id: "contorni", label: "🥗 Contorni" },
  { id: "fritti", label: "🍳 Sfiziosi Fritti" },
  { id: "birre", label: "🍺 Birre" },
  { id: "bevande", label: "🥤 Bevande" },
  { id: "dolci", label: "🧁 Dolci della Casa" },
  { id: "cocktail", label: "🍹 Cocktail" },
  { id: "vini-rossi", label: "🍷 Vini Rossi" },
  { id: "vini-rosati", label: "🌸 Vini Rosati" },
  { id: "vini-bianchi", label: "🥂 Vini Bianchi" },
  { id: "bollicine", label: "🍾 Bollicine" },
  { id: "pazzie-natale", label: "🎄 Le Pazzie del Natale" }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modal controllers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedMetroItem, setSelectedMetroItem] = useState<MenuItem | null>(null);
  const [preferredDeliveryType, setPreferredDeliveryType] = useState<"delivery" | "asporto">("asporto");

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("da-antonello-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // Save cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("da-antonello-cart", JSON.stringify(newCart));
  };

  // Helper additions
  const handleAddStandardItem = (item: MenuItem) => {
    const existingIndex = cart.findIndex(c => c.menuItem.id === item.id && !c.isPizzaMetroSection && c.doughType === "Classico");
    
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      const newCartItem: CartItem = {
        id: `${item.id}-${Date.now()}`,
        menuItem: item,
        quantity: 1,
        finalPrice: item.price,
        doughType: "Classico"
      };
      saveCart([...cart, newCartItem]);
    }
  };

  const handleAddMetroItem = (cartItem: CartItem) => {
    saveCart([...cart, cartItem]);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return { ...item, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cart.filter(item => item.id !== id);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // Cart quantity badge
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);

  // Dynamic Open/Closed status checker
  const [isOpenNow, setIsOpenNow] = useState(true);
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      // Pizzeria are typically open 19:00 to 23:30 (Mondays Closed)
      const day = now.getDay(); // 0 is Sunday, 1 is Monday...
      if (day === 1) {
        setIsOpenNow(false); // Closed on Mondays
      } else if (currentHour >= 19 && currentHour < 24) {
        setIsOpenNow(true);
      } else {
        setIsOpenNow(false); // Closed during afternoon/morning
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter menu items by category and query search
  const filteredMenuItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-[#1A1A1A] bg-[#FDFCF8]">
      <LocalSEO />

      {/* Nav Section */}
      <header className="sticky top-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-black/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <img 
              src="/logoa.png" 
              alt="Logo Da Antonello" 
              className="h-11 w-auto object-contain block" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} 
            />
            <div className="flex flex-col">
              <span className="text-2.2xl sm:text-2.5xl font-serif font-black italic tracking-tighter uppercase text-[#1A1A1A] leading-none" id="brand-title">
                Da Antonello
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#8A817C] font-extrabold hidden xs:inline mt-1" id="brand-subtitle">
                Foggia • Dal 1994
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-extrabold">
            <a href="#menu-visualizer" className="text-neutral-600 hover:text-[#C1121F] transition-all" id="nav-item-menu">Il Menu</a>
            <button onClick={() => setIsBookingOpen(true)} className="text-neutral-600 hover:text-[#C1121F] transition-all cursor-pointer" id="nav-item-booking">PRENOTA SALA</button>
            <a href="#recensioni-section" className="text-neutral-600 hover:text-[#C1121F] transition-all" id="nav-item-reviews">Recensioni</a>
            <a href="#contatti-section" className="text-neutral-600 hover:text-[#C1121F] transition-all" id="nav-item-contacts">Dove Siamo</a>
          </nav>

          {/* Actions: Cart Badge & WhatsApp Button */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => window.open(`https://api.whatsapp.com/send?phone=${RESTAURANT_INFO.phone.replace(/\s+/g, "")}`, "_blank")}
              className="hidden sm:inline-block bg-[#C1121F] text-white px-5 py-2.5 text-[9px] uppercase tracking-widest font-extrabold rounded-full hover:bg-[#151718] transition-all whitespace-nowrap cursor-pointer"
              id="header-whatsapp-btn"
            >
              WhatsApp Direct
            </button>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-[#1A1A1A] hover:bg-[#FAF7F2] border border-black/5 bg-white transition-all shadow-sm cursor-pointer"
              id="header-cart-btn"
            >
              <ShoppingBag size={18} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C1121F] text-white font-mono text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FDFCF8] animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Bento Grid Core Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" id="hero-banner">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="bento-grid-dashboard">
          
          {/* Block 1: Hero Block (SEO Local Focus) */}
          <div className="lg:col-span-8 bg-[#151718] rounded-[2.5rem] p-8 sm:p-12 flex flex-col justify-between text-white relative overflow-hidden min-h-[380px] lg:min-h-[460px] shadow-sm" id="bento-hero">
            {/* Background pizza glow */}
            <div className="absolute inset-0 opacity-[0.22] pointer-events-none mix-blend-luminosity">
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200" 
                alt="Autentica pizza al metro di Foggia"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#151718] via-[#151718]/85 to-transparent"></div>

            {/* Top row with details */}
            <div className="relative z-10 flex justify-between items-start">
              {/* Dynamic status sticker */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest uppercase text-stone-200">
                <span className={`w-2 h-2 rounded-full ${isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-[#C1121F]"}`}></span>
                {isOpenNow ? "Siamo Aperti: Ordina Ora" : "Accettiamo Prenotazioni"}
              </div>
              <div className="opacity-35 hidden sm:block">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>

            {/* Title and subtitle */}
            <div className="relative z-10 space-y-4 max-w-2xl mt-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black leading-[0.95] tracking-tight text-[#FAF8F5]">
                La Migliore Pizza <br/>al Metro di Foggia.
              </h1>
              <p className="text-[#8A817C] text-xs sm:text-sm max-w-lg uppercase tracking-wider leading-relaxed font-semibold">
                Ingredienti a KM 0, lievitazione naturale 72 ore e la tradizione della pizza al metro nel cuore di Foggia.
              </p>
            </div>
          </div>

          {/* Block 2: Reservation System Block */}
          <div className="lg:col-span-4 bg-[#F2E9E4] rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between text-[#1A1A1A] min-h-[380px] lg:min-h-[460px] shadow-sm" id="bento-booking">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold block text-[#C1121F] mb-6">
                Prenotazioni Immediate
              </span>
              <div className="space-y-3.5">
                {/* Option 01: Domicilio */}
                <button 
                  onClick={() => { setPreferredDeliveryType("delivery"); setIsCartOpen(true); }}
                  className="w-full bg-white border border-black/5 p-4 rounded-3xl flex items-center justify-between hover:bg-[#1A1A1A] hover:text-white transition-all text-left shadow-sm group cursor-pointer"
                  id="bento-btn-delivery"
                >
                  <div>
                    <p className="text-[9px] uppercase font-extrabold opacity-40">Opzione 01</p>
                    <p className="text-base font-serif font-bold tracking-tight">Consegna a Domicilio</p>
                  </div>
                  <span className="text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {/* Option 02: Asporto */}
                <button 
                  onClick={() => { setPreferredDeliveryType("asporto"); setIsCartOpen(true); }}
                  className="w-full bg-white border border-black/5 p-4 rounded-3xl flex items-center justify-between hover:bg-[#1A1A1A] hover:text-white transition-all text-left shadow-sm group cursor-pointer"
                  id="bento-btn-asporto"
                >
                  <div>
                    <p className="text-[9px] uppercase font-extrabold opacity-40">Opzione 02</p>
                    <p className="text-base font-serif font-bold tracking-tight">Asporto (Take Away)</p>
                  </div>
                  <span className="text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {/* Option 03: Booking Table */}
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full bg-white border border-black/5 p-4 rounded-3xl flex items-center justify-between hover:bg-[#1A1A1A] hover:text-white transition-all text-left shadow-sm group cursor-pointer"
                  id="bento-btn-room"
                >
                  <div>
                    <p className="text-[9px] uppercase font-extrabold opacity-40">Opzione 03</p>
                    <p className="text-base font-serif font-bold tracking-tight">Prenota Tavolo in Sala</p>
                  </div>
                  <span className="text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center opacity-50 font-medium pt-4 border-t border-black/5 mt-4">
              Ordini e prenotazioni configurano WhatsApp all'istante
            </p>
          </div>

          {/* Block 3: Menu Highlights Block */}
          <div className="lg:col-span-4 bg-white border border-black/5 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-sm" id="bento-highlights">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#1A1A1A]">Pillole dal Menu</h2>
                <a href="#menu-visualizer" className="text-[9px] bg-black text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-widest hover:bg-[#C1121F] transition-all">
                  Tutto
                </a>
              </div>
              <ul className="space-y-5">
                <li className="flex justify-between items-end border-b border-dashed border-black/10 pb-2.5">
                  <div className="min-w-0 pr-2">
                    <p className="font-serif text-base font-black text-[#1A1A1A]">Margherita DOC</p>
                    <p className="text-[10px] uppercase opacity-60 font-semibold truncate">Pomodoro, Fiordilatte, Basilico fresco</p>
                  </div>
                  <p className="font-mono font-bold text-xs shrink-0 text-[#C1121F]">€7.00</p>
                </li>
                <li className="flex justify-between items-end border-b border-dashed border-black/10 pb-2.5">
                  <div className="min-w-0 pr-2">
                    <p className="font-serif text-base font-black text-[#1A1A1A]">Pugliese DOP</p>
                    <p className="text-[10px] uppercase opacity-60 font-semibold truncate text-[#C1121F]">Ciliegino, cacio, salsiccia tipica</p>
                  </div>
                  <p className="font-mono font-bold text-xs shrink-0 text-[#C1121F]">€9.50</p>
                </li>
                <li className="flex justify-between items-end pb-1">
                  <div className="min-w-0 pr-2">
                    <p className="font-serif text-base font-black text-[#1A1A1A]">Mezzo Metro Gusti</p>
                    <p className="text-[10px] uppercase opacity-60 font-semibold truncate">Ideale per 2-3 persone, gusti a scelta</p>
                  </div>
                  <p className="font-mono font-bold text-xs shrink-0 text-[#C1121F]">€14.00</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Block 4: Customer Reviews Block */}
          <div className="lg:col-span-4 bg-[#C1121F] text-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm min-h-[220px]" id="bento-reviews-highlight">
            <div className="flex gap-1 text-yellow-400 text-sm">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <p className="italic font-serif text-lg sm:text-xl font-bold leading-snug my-4 text-[#FAF8F5]">
              "La pizza al metro più buona di Foggia. Impasto leggerissimo e ingredienti freschi. Antonello è una garanzia!"
            </p>
            <p className="text-[10px] uppercase tracking-widest font-extrabold opacity-70 pt-2 border-t border-white/10">
              — Giuseppe R. (Google Maps)
            </p>
          </div>

          {/* Block 5: Contact & Local Info Block */}
          <div className="lg:col-span-4 bg-[#FAF7F2] border border-black/5 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-sm" id="bento-seo">
            <div>
              <p className="text-[10px] uppercase font-extrabold mb-2 text-[#C1121F] tracking-widest">Contatti & Local SEO</p>
              <p className="text-base font-bold text-[#1A1A1A] leading-tight">Via Arpi, 12, 71121 Foggia FG</p>
              <p className="text-xs text-neutral-500 mt-1">Capitanata, Puglia</p>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-black/5 mt-4">
              <div className="text-[10px] uppercase tracking-wider opacity-70 font-bold space-y-0.5">
                <p>Lun - Dom: 19:00 - 00:00</p>
                <p>Chiuso il Martedì</p>
              </div>
              <a 
                href="#contatti-section" 
                className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white text-[10px] font-extrabold hover:bg-[#C1121F] transition-all cursor-pointer shadow-sm text-center"
              >
                MAP
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-20 w-full" id="main-content">
        
        {/* Local SEO Text Widget */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-3.5 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C1121F]/10 text-[10px] font-bold text-[#C1121F] tracking-wider uppercase">
              <Sparkles size={12} /> Pizzeria Consigliata Foggia 2026/2027
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] leading-tight tracking-tight">
              Cerchi un ristorante pizzeria di livello a Foggia?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-semibold">
              Siamo situati a pochi passi da Viale XXIV Maggio e Corso Roma. 
              <strong> Da Antonello</strong> eleva il concetto di pizza da asporto a Foggia, assemblando farine pregiate macinate in Puglia 
              per un impasto leggero, scioglievole ed eccezionalmente sano.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
            <div className="flex items-center gap-3 text-xs text-[#1A1A1A] bg-[#FAF7F2] px-5 py-3.5 rounded-2xl border border-black/5 shadow-inner font-extrabold">
              <Phone size={14} className="text-[#C1121F]" />
              <span>{RESTAURANT_INFO.phone}</span>
            </div>
            <span className="text-[10px] text-center text-neutral-400 font-extrabold uppercase tracking-widest">Ordina a domicilio a Foggia</span>
          </div>
        </div>

        {/* Menu Section */}
        <section className="space-y-8" id="menu-visualizer">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" id="menu-header">
            <div className="space-y-1.5">
              <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase block">Selezioni Artigianali</span>
              <h3 className="text-3xl font-display font-black text-neutral-900 leading-tight">Il Nostro Menu</h3>
              <p className="text-xs text-neutral-500 font-medium font-semibold">Seleziona una categoria. Ordina e ricevi direttamente su WhatsApp.</p>
            </div>

            {/* Quick search & filter bar */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca ingredienti (es. datterino)..."
                className="w-full text-xs p-3.5 pl-10 bg-white border border-[#ece7dc] rounded-full focus:ring-1 focus:ring-[#C1121F] outline-none shadow-md shadow-neutral-100"
                id="search-menu-input"
              />
              <Search size={14} className="absolute left-4 top-4 text-neutral-400" />
            </div>
          </div>

          {/* Categories slide horizontal */}
          <div className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:-mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveCategory(opt.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === opt.id
                      ? "bg-[#C1121F] text-white shadow-md shadow-[#C1121F]/10"
                      : "bg-white text-neutral-600 hover:text-[#C1121F] hover:bg-[#FAF7F2] border border-neutral-200"
                  }`}
                  id={`btn-category-${opt.id}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Menu items list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="menu-items-grid">
            <AnimatePresence mode="popLayout">
              {filteredMenuItems.map(item => {
                const isMetro = item.category === "pizza-metro";
                const isGourmetOrSpecial = item.category === "pizze-gourmet" || item.category === "pizze-rosse" || item.category === "pizze-bianche" || item.tags?.includes("Gourmet") || item.tags?.includes("Specialità");
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={item.id}
                    className="group bg-white rounded-[2rem] border border-black/5 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all h-[18rem]"
                    id={`menu-item-${item.id}`}
                  >
                    <div className="p-5 space-y-3">
                      {/* Top tags and badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded ${
                          isMetro 
                            ? "bg-[#151718] text-white"
                            : isGourmetOrSpecial 
                            ? "bg-[#C1121F]/10 text-[#C1121F]"
                            : "bg-stone-50 text-stone-600 border border-stone-200/50"
                        }`}>
                          {CATEGORY_MAP[item.category] || item.category.replace("-", " ")}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {item.tags?.slice(0, 1).map((t, tIdx) => (
                            <span key={tIdx} className="text-[9px] font-bold text-[#C1121F] bg-[#C1121F]/5 px-2 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Name & description */}
                      <div className="space-y-1">
                        <h4 className="font-display font-extrabold text-[#111111] text-base leading-snug group-hover:text-[#C1121F] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 font-semibold">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom strip price and checkout CTA */}
                    <div className="px-5 py-4 border-t border-[#f1efe9] bg-gradient-to-t from-[#FAF8F5]/60 to-white flex items-center justify-between gap-4">
                      <span className="font-mono font-black text-neutral-950 text-base">
                        {isMetro ? `Da ${item.price.toFixed(2)} €` : `${item.price.toFixed(2)} €`}
                      </span>

                      {isMetro ? (
                        <button
                          type="button"
                          onClick={() => setSelectedMetroItem(item)}
                          className="px-4.5 py-2 rounded-full text-xs font-extrabold bg-[#151718] text-white hover:bg-[#C1121F] transition-all flex items-center gap-1 shadow-sm active:scale-[0.98] cursor-pointer"
                          id={`customize-btn-${item.id}`}
                        >
                          Personalizza
                          <ChevronRight size={12} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddStandardItem(item)}
                          className="px-4.5 py-2 rounded-full text-xs font-extrabold bg-[#C1121F] text-white hover:bg-[#151718] transition-all flex items-center gap-1 shadow-sm active:scale-[0.98] cursor-pointer"
                          id={`add-btn-${item.id}`}
                        >
                          Aggiungi +
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="py-12 text-center text-neutral-400 font-semibold text-sm">
              Nessun delizioso piatto corrisponde ai filtri di ricerca impostati. Prova a reimpostare.
            </div>
          )}
        </section>

        {/* Reviews Suite */}
        <section className="space-y-12 pb-6 border-b border-[#ece7dc]" id="recensioni-section">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase block font-extrabold">Recensioni certificate</span>
            <span className="text-3xl font-display font-black text-neutral-900 block leading-tight">Chi Ci Ha Già Scelto</span>
            <p className="text-xs text-neutral-500 font-semibold">La soddisfazione dei foggiani che degustano le nostre specialità tutti i giorni.</p>
          </div>

          <ReviewSystem />
        </section>

        {/* Contact address and Maps */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" id="contatti-section">
          {/* Card specs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase block font-extrabold">Contatti e Orari</span>
              <h3 className="text-3xl font-display font-black text-neutral-900 leading-tight">Vieni a Trovarci</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                Situato in posizione strategica a Foggia, Da Antonello è facilmente raggiungibile in auto o piedi. Offriamo servizio tavoli climatizzato all'interno e posti all'esterno in terrazza per le calde sere d'estate.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <span className="p-2.5 rounded-xl bg-[#C1121F]/10 text-[#C1121F] shrink-0">
                  <MapPin size={18} />
                </span>
                <div>
                  <span className="font-extrabold text-sm text-neutral-900 block leading-tight">La Nostra Sede</span>
                  <span className="text-xs text-neutral-500 font-semibold">{RESTAURANT_INFO.address}, {RESTAURANT_INFO.city} ({RESTAURANT_INFO.postalCode}, {RESTAURANT_INFO.region})</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="p-2.5 rounded-xl bg-[#C1121F]/10 text-[#C1121F] shrink-0">
                  <Clock size={18} />
                </span>
                <div>
                  <span className="font-extrabold text-sm text-neutral-900 block leading-tight">Orari di Apertura</span>
                  <span className="text-xs text-neutral-500 font-semibold">{RESTAURANT_INFO.openingHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="p-2.5 rounded-xl bg-[#C1121F]/10 text-[#C1121F] shrink-0">
                  <Phone size={18} />
                </span>
                <div>
                  <span className="font-extrabold text-sm text-neutral-900 block leading-tight">Prenotazioni & WhatsApp</span>
                  <span className="text-xs text-neutral-500 font-semibold">{RESTAURANT_INFO.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#C1121F] hover:bg-[#151718] transition-all font-extrabold text-xs text-white shadow cursor-pointer"
                id="footer-booking-btn"
              >
                Riserva un tavolo in Sala
              </button>
            </div>
          </div>

          {/* Google Maps embed block */}
          <div className="bg-white p-3 rounded-[2rem] border border-black/5 shadow-sm overflow-hidden h-96 relative">
            <iframe
              src={RESTAURANT_INFO.mapsEmbedUrl}
              className="w-full h-full rounded-2xl border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mappa Pizzeria Da Antonello Foggia"
            />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logoa.png" 
              alt="Logo Da Antonello" 
              className="h-8 w-auto object-contain block" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} 
            />
            <p className="text-[10px] uppercase tracking-[0.25em] opacity-50 font-extrabold text-[#1A1A1A]" id="footer-vat">
              © 2026 Pizzeria Da Antonello Foggia - P.IVA {RESTAURANT_INFO.vatNumber}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-[10px] uppercase tracking-widest font-extrabold text-neutral-500">
              <a href="#menu-visualizer" className="hover:text-[#C1121F] transition-colors">Menu Pizze</a>
              <a href="#recensioni-section" className="hover:text-[#C1121F] transition-colors">Feedback</a>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]">Aperti per gli ordini</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Cart Indicator in Desktop & Sticky footer in Mobile */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 z-30 max-w-sm w-full px-4 sm:px-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#151718] hover:bg-[#C1121F] text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl border border-white/5 transition-all font-semibold text-sm active:scale-[0.98] cursor-pointer"
            id="floating-sticky-cart-btn"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#C1121F] text-white rounded-xl relative shrink-0">
                <ShoppingBag size={16} />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#151718] text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#C1121F]">
                  {totalCartItems}
                </span>
              </span>
              <div className="text-left font-extrabold uppercase tracking-wider text-[11px]">
                <span className="block text-white">Vedi Ordine</span>
                <span className="text-[9px] text-[#8A817C]">{totalCartItems} pizze nel carrello</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-white font-black">{totalCartPrice.toFixed(2)} €</span>
              <ChevronRight size={16} className="text-white" />
            </div>
          </button>
        </div>
      )}

      {/* MODALS */}
      
      {/* Pizza al Metro Customizer Modal */}
      <AnimatePresence>
        {selectedMetroItem && (
          <PizzaMetroCustomizer
            item={selectedMetroItem}
            onClose={() => setSelectedMetroItem(null)}
            onAdd={handleAddMetroItem}
          />
        )}
      </AnimatePresence>

      {/* Table Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <TableBookingModal
            onClose={() => setIsBookingOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer Checkout Slider */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            initialDeliveryType={preferredDeliveryType}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
