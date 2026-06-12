import { useState, FormEvent } from "react";
import { TableBooking } from "../types";
import { RESTAURANT_INFO } from "../data";
import { Calendar, Users, Clock, MapPin, X, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface TableBookingModalProps {
  onClose: () => void;
}

export default function TableBookingModal({ onClose }: TableBookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [guests, setGuests] = useState(2);
  const [areaPreference, setAreaPreference] = useState<"Interno" | "Esterno / Terrazza" | "Non importa">("Non importa");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) return;

    // Formatting nice dates
    const formattedDate = new Date(date).toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    // Formatting WhatsApp text
    const textMessage = `*NUOVA PRENOTAZIONE TAVOLO - DA ANTONELLO FOGGIA*\n` +
      `-----------------------------------------\n` +
      `👤 *Nome*: ${name.trim()}\n` +
      `📞 *Telefono*: ${phone.trim()}\n` +
      `📅 *Data*: ${formattedDate}\n` +
      `⏰ *Ora*: ${time}\n` +
      `👥 *Coperti*: ${guests} persone\n` +
      `📍 *Zona Preferita*: ${areaPreference}\n` +
      (notes.trim() ? `📝 *Richieste Speciali*: ${notes.trim()}\n` : "") +
      `-----------------------------------------\n` +
      `_Inviato dal Sito Web Pizzeria Da Antonello Foggia_`;

    const encodedText = encodeURIComponent(textMessage);
    const fallbackCleanPhone = RESTAURANT_INFO.phone.replace(/\s+/g, ""); // +393770824589
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${fallbackCleanPhone}&text=${encodedText}`;

    // Open WhatsApp in a new tab/iframe redirect
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  // Get current date for calendar minimum selection
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
        id="table-booking-modal"
      >
        {/* Banner header decor */}
        <div className="bg-neutral-900 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/75 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            id="close-booking-modal"
          >
            <X size={18} />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-[#C1121F] uppercase block mb-1">
            Esperienza in Sala
          </span>
          <h3 className="text-xl font-display font-bold">Riserva un Tavolo</h3>
          <p className="text-xs text-stone-400 mt-1">
            Prenotazione immediata gratuita e conferma WhatsApp senza attese.
          </p>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5" htmlFor="date-input">
                <Calendar size={14} className="text-[#C1121F]" /> Date
              </label>
              <input
                id="date-input"
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5" htmlFor="time-select">
                <Clock size={14} className="text-[#C1121F]" /> Ora di arrivo
              </label>
              <select
                id="time-select"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guests */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5" htmlFor="guests-select">
                <Users size={14} className="text-[#C1121F]" /> Numero Coperti
              </label>
              <select
                id="guests-select"
                required
                value={guests}
                onChange={e => setGuests(parseInt(e.target.value))}
                className="w-full text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
              >
                {Array.from({ length: 12 }).map((_, idx) => (
                  <option key={idx} value={idx + 1}>{idx + 1} {idx === 0 ? "Ospite" : "Ospiti"}</option>
                ))}
                <option value="13">Più di 12 (Contattaci)</option>
              </select>
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5" htmlFor="area-select">
                <MapPin size={14} className="text-[#C1121F]" /> Preferenza Area
              </label>
              <select
                id="area-select"
                required
                value={areaPreference}
                onChange={e => setAreaPreference(e.target.value as any)}
                className="w-full text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Non importa">Indifferente</option>
                <option value="Interno">Sala Interna Aria Condizionata</option>
                <option value="Esterno / Terrazza">Esterno Estivo / Dehors</option>
              </select>
            </div>
          </div>

          <div className="border-t border-neutral-100 my-2"></div>

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block" htmlFor="booking-name">Nome per la prenotazione</label>
              <input
                id="booking-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Es. Roberta Di Corato"
                className="w-full text-sm p-3 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block" htmlFor="booking-phone">Numero Cellulare</label>
              <input
                id="booking-phone"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Es. 329 123 4567"
                className="w-full text-sm p-3 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block" htmlFor="booking-notes">Note particolari</label>
              <input
                id="booking-notes"
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Es. 'Un seggiolone bimbo', 'Allergie al nichel'"
                className="w-full text-sm p-3 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-4 px-6 rounded-2xl bg-[#C1121F] hover:bg-[#151718] active:scale-[0.99] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#C1121F]/10"
            id="submit-table-booking-btn"
          >
            Invia su WhatsApp 
            <ArrowRight size={16} />
          </button>
          
          <p className="text-[10px] text-center text-neutral-400 mt-2">
            Cliccando si aprirà la chat diretta con la Pizzeria Da Antonello per la conferma.
          </p>

        </form>
      </motion.div>
    </div>
  );
}
