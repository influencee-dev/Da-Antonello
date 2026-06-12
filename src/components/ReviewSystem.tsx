import { useState, useEffect, FormEvent } from "react";
import { Review } from "../types";
import { INITIAL_REVIEWS } from "../data";
import { Star, MessageSquareCode, Check, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ReviewSystem() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [location, setLocation] = useState("Foggia");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load reviews from localStorage + merge with INITIAL_REVIEWS
  useEffect(() => {
    const saved = localStorage.getItem("da-antonello-reviews");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Review[];
        setReviews([...parsed, ...INITIAL_REVIEWS]);
      } catch (e) {
        setReviews(INITIAL_REVIEWS);
      }
    } else {
      setReviews(INITIAL_REVIEWS);
    }
  }, []);

  const calculateAverage = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;

    const newReview: Review = {
      id: `rev-user-${Date.now()}`,
      author: author.trim(),
      rating,
      text: text.trim(),
      date: new Date().toISOString().split("T")[0],
      location: location.trim() || "Foggia",
      isVerified: true
    };

    // Store in localStorage (only store user ones to keep it small and merge later)
    const saved = localStorage.getItem("da-antonello-reviews");
    let userReviews: Review[] = [];
    if (saved) {
      try {
        userReviews = JSON.parse(saved);
      } catch (e) {
        userReviews = [];
      }
    }
    userReviews = [newReview, ...userReviews];
    localStorage.setItem("da-antonello-reviews", JSON.stringify(userReviews));

    // Update state
    setReviews([newReview, ...reviews]);
    
    // Clear form
    setAuthor("");
    setText("");
    setLocation("Foggia");
    setRating(5);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setShowForm(false);
    }, 3000);
  };

  const avgRating = calculateAverage();

  return (
    <div className="space-y-8" id="recensioni-section">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Rating Summary Card */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-3xl border border-[#ece7dc] space-y-4 shadow-sm">
          <h4 className="font-display font-bold text-lg text-neutral-900">La Parola ai Nostri Clienti</h4>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-mono font-black text-[#C1121F]">{avgRating}</span>
            <div>
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={i < Math.round(avgRating) ? "currentColor" : "none"} 
                    className={i < Math.round(avgRating) ? "text-amber-500" : "text-neutral-200"}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Valutazione media basata su {reviews.length} recensioni</p>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 space-y-2">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Il nostro segreto è la semplicità dei prodotti pugliesi, unita alla maestria dell'impasto al metro brevettato 72 ore.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C1121F] text-white hover:bg-[#151718] transition-all font-semibold text-sm flex items-center justify-center gap-2"
              id="write-review-btn"
            >
              <MessageSquareCode size={16} />
              {showForm ? "Annulla" : "Scrivi una Recensione"}
            </button>
          </div>
        </div>

        {/* Column 2: Form or Testimonial carousel style list */}
        <div className="w-full lg:w-2/3 space-y-6">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="review-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-stone-50 p-6 rounded-3xl border border-[#e5dfd3] space-y-4"
              >
                <h5 className="font-display font-bold text-base text-neutral-900">Lascia la tua opinione su Da Antonello</h5>
                
                {isSuccess ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm font-medium" id="review-success-msg">
                    <span className="p-1 rounded-full bg-green-100"><Check size={16} /></span>
                    Recensione inviata con successo! Grazie per aver condiviso la tua esperienza.
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="space-y-4">
                    {/* Stars Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-500">Valutazione</label>
                      <div className="flex items-center gap-1.5 h-8">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const ratingValue = i + 1;
                          return (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setRating(ratingValue)}
                              onMouseEnter={() => setHoverRating(ratingValue)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="text-amber-500 hover:scale-110 transition-transform"
                              id={`star-btn-${ratingValue}`}
                            >
                              <Star
                                size={24}
                                fill={(hoverRating !== null ? ratingValue <= hoverRating : ratingValue <= rating) ? "currentColor" : "none"}
                                className={(hoverRating !== null ? ratingValue <= hoverRating : ratingValue <= rating) ? "text-amber-500" : "text-neutral-300"}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Author */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-500" htmlFor="author-input">Nome</label>
                        <input
                          id="author-input"
                          type="text"
                          required
                          value={author}
                          onChange={e => setAuthor(e.target.value)}
                          placeholder="Es. Marco Melis"
                          className="w-full text-sm p-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      
                      {/* Location */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-500" htmlFor="location-input">Città</label>
                        <input
                          id="location-input"
                          type="text"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="Es. Foggia, Lucera, San Severo"
                          className="w-full text-sm p-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-500" htmlFor="review-desc-input">Commento</label>
                      <textarea
                        id="review-desc-input"
                        required
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Cosa ti è piaciuto di più? L'impasto al metro, qualche gusto in particolare?"
                        rows={4}
                        className="w-full text-sm p-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 resize-none transition-all placeholder:text-neutral-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-3 px-6 rounded-xl bg-[#C1121F] hover:bg-[#151718] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                      id="submit-review-btn"
                    >
                      <Send size={14} />
                      Invia Recensione
                    </button>
                  </form>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* List of Reviews */}
          <div className="space-y-4">
            {reviews.map((rev, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-[#f1efe9] shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 text-sm">{rev.author}</span>
                    <span className="text-[11px] text-neutral-400 ml-2 font-medium bg-[#faf8f5] px-2 py-0.5 rounded-full">
                      {rev.location || "Foggia"}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{rev.date}</span>
                </div>

                <div className="flex items-center text-amber-500 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < rev.rating ? "currentColor" : "none"} 
                      className={i < rev.rating ? "text-amber-500" : "text-neutral-200"}
                    />
                  ))}
                  {rev.isVerified && (
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase ml-3 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Acquisto Verificato
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-700 leading-relaxed font-sans italic">
                  "{rev.text}"
                </p>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
