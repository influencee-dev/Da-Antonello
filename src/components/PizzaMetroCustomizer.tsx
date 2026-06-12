import { useState } from "react";
import { MenuItem, CartItem } from "../types";
import { MENU_ITEMS } from "../data";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PizzaMetroCustomizerProps {
  item: MenuItem;
  onClose: () => void;
  onAdd: (cartItem: CartItem) => void;
}

export default function PizzaMetroCustomizer({ item, onClose, onAdd }: PizzaMetroCustomizerProps) {
  const isMezzo = item.id === "metro-mezzo";
  
  // Available divisions:
  // Mezzo Metro (50cm): "intero" (1 gusto) or "mezzo-mezzo" (2 gusti)
  // Un Metro (100cm): "intero" (1 gusto), "mezzo-mezzo" (2 gusti) or "tre-gusti" (3 gusti)
  const [division, setDivision] = useState<"intero" | "mezzo" | "tre">(
    isMezzo ? "intero" : "intero"
  );

  // Set default dough
  const [dough, setDough] = useState<"Classico" | "Integrale" | "Senza Glutine">("Classico");
  const [notes, setNotes] = useState("");

  // Get flavors eligible for Pizza al Metro
  const availableFlavors = MENU_ITEMS.filter(f => f.isAvailableForMetro);

  // Array storingselected flavor IDs for each section
  // Index 0: Section 1/Left/Whole
  // Index 1: Section 2/Right
  // Index 2: Section 3 (if 3 sections chosen)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([
    "tonda-margherita",
    "tonda-margherita",
    "tonda-margherita"
  ]);

  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  const getSectionName = (index: number) => {
    if (division === "intero") return "Gusto Unico";
    if (division === "mezzo") {
      return index === 0 ? "Prima Metà (25cm)" : "Seconda Metà (25cm)";
    }
    // "tre" divisions for 1 meter
    return `Sezione ${index + 1} (33cm)`;
  };

  const getSectionsCount = () => {
    if (division === "intero") return 1;
    if (division === "mezzo") return 2;
    return 3;
  };

  const handleSelectFlavorForActiveSection = (flavorName: string) => {
    const updated = [...selectedFlavors];
    updated[activeSectionIndex] = flavorName;
    setSelectedFlavors(updated);
  };

  // Base price + premium ingredients supplement + dough supplement
  const calculateFinalPrice = () => {
    let base = item.price;
    
    // Dough supplements
    if (dough === "Integrale") base += 1.50;
    if (dough === "Senza Glutine") base += 3.00;

    // Premium topping additions inside chosen sections
    const count = getSectionsCount();
    for (let i = 0; i < count; i++) {
      const flavorId = selectedFlavors[i];
      const match = availableFlavors.find(f => f.name === flavorId || f.id === flavorId);
      if (match && match.price > 8.50) {
        // Gourmet toppings add a slight premium depending on selection ratio
        base += (match.price - 7.50) / count;
      }
    }
    
    return parseFloat(base.toFixed(2));
  };

  const handleSubmit = () => {
    const sectionsCount = getSectionsCount();
    const chosenFlavorNames: string[] = [];
    
    for (let i = 0; i < sectionsCount; i++) {
      const idOrName = selectedFlavors[i];
      const match = availableFlavors.find(f => f.id === idOrName || f.name === idOrName);
      chosenFlavorNames.push(match ? match.name : idOrName);
    }

    const price = calculateFinalPrice();

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity: 1,
      finalPrice: price,
      isPizzaMetroSection: true,
      metroSize: isMezzo ? "mezzo-metro" : "un-metro",
      selectedFlavors: chosenFlavorNames,
      doughType: dough,
      customNote: notes.trim()
    };

    onAdd(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.28 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        id="pizza-metro-customizer-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1efe9] bg-gradient-to-r from-[#faf8f5] to-white">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#C1121F] uppercase">Configuratore Premium</span>
            <h3 className="text-xl font-display font-bold text-neutral-900">{item.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-[#faf8f5]"
            id="close-customizer-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Step 1: Divide the Pizza */}
          <div className="space-y-3">
            <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">1. Scegli la suddivisione della pizza</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => { setDivision("intero"); setActiveSectionIndex(0); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  division === "intero"
                    ? "border-[#C1121F] bg-[#FAF7F2] ring-1 ring-[#C1121F]"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
                id="div-intero-btn"
              >
                <div className="font-semibold text-neutral-900 text-sm">Gusto Unico</div>
                <div className="text-xs text-neutral-500 mt-1">Intero spazio farcito con un solo gusto della casa.</div>
              </button>

              <button
                onClick={() => { setDivision("mezzo"); setActiveSectionIndex(0); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  division === "mezzo"
                    ? "border-[#C1121F] bg-[#FAF7F2] ring-1 ring-[#C1121F]"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
                id="div-mezzo-btn"
              >
                <div className="font-semibold text-neutral-900 text-sm">Metà e Metà (2 Gusti)</div>
                <div className="text-xs text-neutral-500 mt-1">Diviso a metà. Ideale per accontentare due palati.</div>
              </button>

              {!isMezzo && (
                <button
                  onClick={() => { setDivision("tre"); setActiveSectionIndex(0); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    division === "tre"
                      ? "border-[#C1121F] bg-[#FAF7F2] ring-1 ring-[#C1121F]"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  id="div-tre-btn"
                >
                  <div className="font-semibold text-neutral-900 text-sm">Tre Sezioni (3 Gusti)</div>
                  <div className="text-xs text-neutral-500 mt-1">3 sezioni da circa 33cm l'una. Varietà massima.</div>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Pizza Board Visualization */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Visualizzazione Impasto</label>
            <div className="bg-[#FAF7F2] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center border border-[#ece7dc]">
              
              {/* The Wooden Board */}
              <div className="relative w-full max-w-xl h-28 bg-[#d4a373] rounded-xl shadow-lg border-t-4 border-[#e9c46a] flex overflow-hidden items-center p-1 cursor-pointer">
                {/* Visualizer divisions */}
                {Array.from({ length: getSectionsCount() }).map((_, idx) => {
                  const isSelectedForEdit = idx === activeSectionIndex;
                  const flavorID = selectedFlavors[idx];
                  const flavorDetails = availableFlavors.find(f => f.id === flavorID);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSectionIndex(idx)}
                      style={{ width: `${100 / getSectionsCount()}%` }}
                      className={`h-full relative flex flex-col justify-center items-center transition-all px-2 ${
                        idx > 0 ? "border-l-2 border-dashed border-[#b17a4c]" : ""
                      } ${
                        isSelectedForEdit 
                          ? "bg-[#f4ebe1]/30 ring-2 ring-inset ring-[#C1121F] scale-[0.98] rounded-lg" 
                          : "hover:bg-[#FAF7F2]/10"
                      }`}
                    >
                      {/* Visual representations of Pizza ingredients / base */}
                      <div className="absolute inset-2 bg-gradient-to-tr from-[#9a031e] to-[#e36414] opacity-20 rounded-md filter blur-[1px]"></div>
                      
                      {/* Dots mimicking mozzarella blobs and basil */}
                      <span className="absolute w-2 h-2 rounded-full bg-yellow-100 top-4 left-6 filter blur-[1px]"></span>
                      <span className="absolute w-3 h-3 rounded-full bg-yellow-100 bottom-6 right-8 filter blur-[1px]"></span>
                      <span className="absolute w-2 h-1 bg-green-700 rounded-full top-8 right-6"></span>

                      <div className="relative text-center z-10 select-none">
                        <span className="text-[10px] font-bold tracking-widest text-white/90 drop-shadow uppercase block">
                          SEZIONE {idx + 1}
                        </span>
                        <span className="font-display font-extrabold text-neutral-900 text-xs md:text-sm drop-shadow-sm truncate block mt-1">
                          {flavorDetails ? flavorDetails.name : "Seleziona Gusto"}
                        </span>
                        {isSelectedForEdit && (
                          <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#C1121F] text-white text-[9px] font-semibold tracking-wider uppercase animate-pulse">
                            In Modifica
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 mt-3 text-center">
                Clicca su una sezione della tavola in legno per cambiare il suo gusto.
              </p>
            </div>
          </div>

          {/* Selector grid for the active section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1efe9] pb-2">
              <span className="text-[#C1121F] text-sm font-semibold">
                Scegli gusto per: <span className="font-bold underline">{getSectionName(activeSectionIndex)}</span>
              </span>
              <span className="text-xs text-neutral-400">Pizze artigianali disponibili per il metro</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableFlavors.map(flavor => {
                const isSelectedForActive = selectedFlavors[activeSectionIndex] === flavor.id;
                
                return (
                  <button
                    key={flavor.id}
                    onClick={() => handleSelectFlavorForActiveSection(flavor.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelectedForActive
                        ? "border-[#C1121F] bg-[#FAF7F2] ring-2 ring-[#C1121F]/30"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                    id={`flavor-${flavor.id}-select`}
                  >
                    {isSelectedForActive && (
                      <span className="absolute top-2 right-2 bg-[#C1121F] text-white p-0.5 rounded-full">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <div>
                      <div className="font-bold text-neutral-900 text-sm pr-6 leading-tight">{flavor.name}</div>
                      <div className="text-[11px] text-neutral-500 line-clamp-2 mt-1">{flavor.description}</div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#C1121F]">
                      {flavor.price > 8.50 ? `Supplemento Gourmet` : "Prezzo Base Inclusivo"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dough and Custom Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Dough selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold tracking-wider text-neutral-600 uppercase block">2. Tipo di Impasto</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setDough("Classico")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm text-left transition-all ${
                    dough === "Classico" ? "border-stone-800 bg-stone-50 ring-1 ring-stone-800" : "border-neutral-200"
                  }`}
                  id="dough-classico-btn"
                >
                  <div>
                    <span className="font-semibold block text-neutral-900">Classico Tradizionale</span>
                    <span className="text-[11px] text-neutral-500">Ibisco, lievitato 72h con farina tipo 0</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-500">Incluso</span>
                </button>

                <button
                  onClick={() => setDough("Integrale")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm text-left transition-all ${
                    dough === "Integrale" ? "border-stone-800 bg-stone-50 ring-1 ring-stone-800" : "border-neutral-200"
                  }`}
                  id="dough-integrale-btn"
                >
                  <div>
                    <span className="font-semibold block text-neutral-900">Multicereali & Integrale</span>
                    <span className="text-[11px] text-neutral-500">Fibra ricca, sapore rustico piacentino</span>
                  </div>
                  <span className="text-xs font-bold text-[#C1121F]">+1.50 €</span>
                </button>

                <button
                  onClick={() => setDough("Senza Glutine")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm text-left transition-all ${
                    dough === "Senza Glutine" ? "border-stone-800 bg-stone-50 ring-1 ring-stone-800" : "border-neutral-200"
                  }`}
                  id="dough-sg-btn"
                >
                  <div>
                    <span className="font-semibold block text-neutral-900">Senza Glutine certificato</span>
                    <span className="text-[11px] text-neutral-500">Preparato in ambiente separato</span>
                  </div>
                  <span className="text-xs font-bold text-[#C1121F]">+3.00 €</span>
                </button>
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold tracking-wider text-neutral-600 uppercase block">3. Richieste Speciali</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Es. 'Metà Margherita senza acciughe', 'Rider citofonare Rossi', 'Tagliatela per favore'"
                rows={4}
                className="w-full text-sm p-4 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-[#C1121F] focus:border-[#C1121F] outline-none resize-none transition-all placeholder:text-neutral-400"
                id="customizer-special-notes"
              />
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f1efe9] bg-gradient-to-r from-white to-[#faf8f5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs text-neutral-400 block font-medium">Totale stimato Pizza al Metro</span>
            <span className="text-2xl font-bold text-neutral-950 font-mono">
              {calculateFinalPrice().toFixed(2)} €
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-full text-sm font-semibold text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:border-neutral-300 transition-all bg-white"
              id="cancel-customizer-btn"
            >
              Annulla
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial px-8 py-3 rounded-full text-sm font-semibold text-white bg-[#C1121F] hover:bg-[#151718] transition-all shadow-md shadow-[#C1121F]/10 active:scale-[0.98]"
              id="confirm-custom-metro-btn"
            >
              Conferma e Aggiungi
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
