import { useState, FormEvent } from "react";
import { CartItem, DeliveryBooking } from "../types";
import { RESTAURANT_INFO } from "../data";
import { X, ShoppingBag, Plus, Minus, Send, MapPin, Clock, CreditCard, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  initialDeliveryType?: "delivery" | "asporto";
}

export default function CartDrawer({ cart, onClose, onUpdateQuantity, onRemoveItem, onClearCart, initialDeliveryType = "asporto" }: CartDrawerProps) {
  const [deliveryType, setDeliveryType] = useState<"delivery" | "asporto">(initialDeliveryType);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [time, setTime] = useState("20:30");
  const [paymentMethod, setPaymentMethod] = useState<"Contanti" | "POS al rider" | "PayPal / Pre-pagato WhatsApp">("Contanti");
  const [notes, setNotes] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const deliveryFee = deliveryType === "delivery" ? 2.00 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !name.trim() || !phone.trim() || (deliveryType === "delivery" && !address.trim())) {
      return;
    }

    // Build the formatted text message for Whatsapp
    let textMessage = `*🍕 NUOVO ORDINE DA ANTONELLO - FOGGIA*\n`;
    textMessage += `-----------------------------------------\n`;
    textMessage += `🛵 *Tipo di Consegna*: ${deliveryType === "delivery" ? "🚀 CONSEGNA A DOMICILIO" : "🛍️ ASPORTO / RITIRO IN SEDE"}\n`;
    textMessage += `👤 *Cliente*: ${name.trim()}\n`;
    textMessage += `📞 *Telefono*: ${phone.trim()}\n`;
    
    if (deliveryType === "delivery") {
      textMessage += `📍 *Indirizzo*: ${address.trim()}\n`;
    }
    
    textMessage += `⏰ *Orario Richiesto*: Alle ore ${time}\n`;
    textMessage += `💳 *Metodo di Pagamento*: ${paymentMethod}\n`;
    textMessage += `-----------------------------------------\n`;
    textMessage += `📝 *TAVOLATA ORDINE*:\n\n`;

    cart.forEach(item => {
      textMessage += `• *${item.quantity} x ${item.menuItem.name}* (${(item.finalPrice * item.quantity).toFixed(2)} €)\n`;
      textMessage += `  ↳ Impasto: _${item.doughType || "Classico"}_\n`;
      
      if (item.isPizzaMetroSection && item.selectedFlavors && item.selectedFlavors.length > 0) {
        textMessage += `  ↳ Gusti: _${item.selectedFlavors.join(" | ")}_\n`;
      }
      
      if (item.customNote) {
        textMessage += `  ↳ Nota cucina: "${item.customNote}"\n`;
      }
      textMessage += `\n`;
    });

    textMessage += `-----------------------------------------\n`;
    textMessage += `📦 *Subtotale Pizze*: ${subtotal.toFixed(2)} €\n`;
    if (deliveryType === "delivery") {
      textMessage += `🛵 *Spesa Spedizione*: ${deliveryFee.toFixed(2)} €\n`;
    }
    textMessage += `💰 *TOTALE DA CORRISPONDERE*: ${grandTotal.toFixed(2)} €\n`;
    
    if (notes.trim()) {
      textMessage += `-----------------------------------------\n`;
      textMessage += `🚨 *Nota Rider/Note Generiche*: "${notes.trim()}"\n`;
    }
    
    textMessage += `-----------------------------------------\n`;
    textMessage += `_Grazie! Ordine generato da Da Antonello Web_`;

    const encodedText = encodeURIComponent(textMessage);
    const cleanPhone = RESTAURANT_INFO.phone.replace(/\s+/g, ""); // removes extra spacing to construct wa.me properly
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    
    setIsOrdered(true);
    setTimeout(() => {
      onClearCart();
      onClose();
      setIsOrdered(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      {/* Background Dimmer Closes */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10"
        id="cart-drawer-panel"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1efe9] bg-[#faf8f5]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-full bg-[#C1121F]/10 text-[#C1121F]">
              <ShoppingBag size={20} />
            </span>
            <div>
              <h4 className="font-display font-bold text-lg text-neutral-900">Il Tuo Carrello</h4>
              <p className="text-xs text-neutral-500">{cart.length} {cart.length === 1 ? "pizza" : "pizze"} in preparazione</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
            id="close-cart-btn"
          >
            <X size={20} />
          </button>
        </div>

        {isOrdered ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4" id="order-completed-ui">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce mx-auto">
              <Check size={36} strokeWidth={2.5} />
            </div>
            <h5 className="font-display font-bold text-xl text-neutral-900">Ordine Inviato a WhatsApp!</h5>
            <p className="text-sm text-neutral-500 max-w-xs mx-auto">
              Si è aperta la chat con Da Antonello. Premi invio per mandare il tuo scontrino pre-compilato!
            </p>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <span className="p-4 rounded-full bg-stone-50 text-stone-300">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </span>
            <div>
              <h5 className="font-bold text-neutral-800 text-sm">Il carrello è vuoto</h5>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                Naviga nel nostro autentico menu pugliese e aggiungi le pizze al metro o tonde che desideri degustare.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#C1121F] text-white font-medium text-xs hover:bg-[#151718] transition"
              id="start-shopping-btn"
            >
              Guarda il Menu
            </button>
          </div>
        ) : (
          /* Form + Items container */
          <form onSubmit={handleCheckout} className="flex-1 overflow-hidden flex flex-col">
            
            {/* Scrollable list of items and inputs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Itemized List */}
              <div className="space-y-4">
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Le tue Selezioni</span>
                <div className="divide-y divide-neutral-100 bg-[#fdfbf9] rounded-2xl p-4 border border-[#ece7dc] space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-neutral-900 text-sm line-clamp-1">{item.menuItem.name}</span>
                          <span className="font-mono text-xs font-semibold text-neutral-700 shrink-0">
                            {(item.finalPrice * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Impasto: <strong className="text-neutral-700">{item.doughType || "Classico"}</strong>
                        </p>
                        {item.isPizzaMetroSection && item.selectedFlavors && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.selectedFlavors.map((fl, fIdx) => (
                              <span key={fIdx} className="text-[10px] bg-[#C1121F]/10 text-[#C1121F] px-1.5 py-0.5 rounded font-medium border border-[#C1121F]/15">
                                {fl}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.customNote && (
                          <p className="text-[11px] text-[#C1121F] italic mt-1 font-medium">
                            📝 Note: "{item.customNote}"
                          </p>
                        )}
                        
                        {/* Quantity increments */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-neutral-200 rounded-lg bg-white overflow-hidden shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity === 1) onRemoveItem(item.id);
                                else onUpdateQuantity(item.id, -1);
                              }}
                              className="px-2 py-1 text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                              id={`minus-${item.id}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 py-1 text-xs font-mono font-bold text-neutral-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="px-2 py-1 text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                              id={`plus-${item.id}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-xs text-red-500 hover:underline hover:text-red-700 transition"
                            id={`remove-${item.id}`}
                          >
                            Rimuovi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Toggle selectors */}
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Modalità Flessibile</span>
                <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("asporto")}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      deliveryType === "asporto" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                    id="delivery-asporto-toggle"
                  >
                    🛍️ Asporto / Ritiro
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      deliveryType === "delivery" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                    id="delivery-domicilio-toggle"
                  >
                    🚀 Domicilio a Foggia
                  </button>
                </div>
              </div>

              {/* Form elements for Delivery/Pickup info */}
              <div className="space-y-4">
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Dati di Convocazione</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 block" htmlFor="client-name">Nome Ordinante</label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Es. Mario Rossi"
                      className="w-full text-xs p-3 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C1121F]"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 block" htmlFor="client-phone">Telefono WhatsApp</label>
                    <input
                      id="client-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Es. 347 1122334"
                      className="w-full text-xs p-3 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C1121F]"
                    />
                  </div>
                </div>

                {deliveryType === "delivery" && (
                  /* Address */
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 block" htmlFor="client-address">Indirizzo di Consegna (Foggia città)</label>
                    <div className="relative">
                      <input
                        id="client-address"
                        type="text"
                        required={deliveryType === "delivery"}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Es. Corso Roma 45, Piano 3, Interno A"
                        className="w-full text-xs p-3 pl-8 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C1121F]"
                      />
                      <MapPin size={12} className="absolute left-3 top-3.5 text-neutral-400" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Requested time slot */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 block" htmlFor="requested-time">
                      {deliveryType === "delivery" ? "Ora Consegna" : "Ora Ritiro"}
                    </label>
                    <div className="relative">
                      <select
                        id="requested-time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full text-xs p-3 pl-8 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C1121F]"
                      >
                        <option value="19:00">19:00</option>
                        <option value="19:30">19:30</option>
                        <option value="20:00">20:00</option>
                        <option value="20:30">20:30</option>
                        <option value="21:00">21:00</option>
                        <option value="21:30">21:30</option>
                        <option value="22:00">22:00</option>
                        <option value="22:30">22:30</option>
                        <option value="23:00">23:00</option>
                      </select>
                      <Clock size={12} className="absolute left-3 top-3.5 text-neutral-400" />
                    </div>
                  </div>

                  {/* Payment option */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 block" htmlFor="payment-method">Pagamento</label>
                    <div className="relative">
                      <select
                        id="payment-method"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as any)}
                        className="w-full text-xs p-3 pl-8 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C1121F]"
                      >
                        <option value="Contanti">Contanti alla consegna</option>
                        {deliveryType === "delivery" && <option value="POS al rider">Bancomat / POS al rider</option>}
                        <option value="PayPal / Pre-pagato WhatsApp">Link PayPal / Pre-pagato</option>
                      </select>
                      <CreditCard size={12} className="absolute left-3 top-3.5 text-neutral-400" />
                    </div>
                  </div>
                </div>

                {/* Direct Notes for rider or counter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-500 block" htmlFor="checkout-additional-notes">Istruzioni al fattorino / Alert allergie</label>
                  <input
                    id="checkout-additional-notes"
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Es. 'Citofono rotto, chiamare al telefono', 'Senza acciughe'"
                    className="w-full text-xs p-3 border border-[#ece7dc] rounded-xl outline-none focus:ring-1 focus:ring-stone-600"
                  />
                </div>

              </div>

            </div>

            {/* Sticky Order Totals & Action */}
            <div className="p-6 border-t border-[#f1efe9] bg-gradient-to-t from-[#faf8f5] to-white space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotale Pizze:</span>
                  <span className="font-mono">{subtotal.toFixed(2)} €</span>
                </div>
                {deliveryType === "delivery" && (
                  <div className="flex justify-between text-neutral-500">
                    <span>Costo Consegna a Foggia:</span>
                    <span className="font-mono">{deliveryFee.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-neutral-900 pt-1.5 border-t border-neutral-100">
                  <span>Totale Scontrino:</span>
                  <span className="font-mono text-[#C1121F]">{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/10"
                id="submit-whatsapp-order-btn"
              >
                <Send size={16} strokeWidth={2.5} />
                Invia Ordine su WhatsApp
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
              
              <p className="text-[10px] text-center text-neutral-400">
                Al clic si aprirà la chat di WhatsApp pre-compilata con il tuo ordine da confermare.
              </p>
            </div>

          </form>
        )}
      </motion.div>
    </div>
  );
}
