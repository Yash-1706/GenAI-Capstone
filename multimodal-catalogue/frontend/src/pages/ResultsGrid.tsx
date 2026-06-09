import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import ProductCard from '../components/ProductCard';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function ResultsGrid() {
  const { searchResults, searchEventId } = useStore();
  const navigate = useNavigate();

  const handleProductClick = async (productId: string) => {
    if (searchEventId) {
      try {
        await apiClient.post('/analytics/click', { event_id: searchEventId, product_id: productId });
      } catch (e) {
        console.error("Failed to log click", e);
      }
    }
    navigate(`/product/${productId}`);
  };

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] page-enter">
        <div className="glass-card p-12 rounded-3xl text-center max-w-md">
          <div className="w-20 h-20 bg-[#dbe7dc] dark:bg-[#4f6f52]/25 text-[#4f6f52] dark:text-[#d79a5f] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-[#162321] dark:text-[#f8f4ea] mb-3">No matches found</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8 font-medium">We couldn't find exactly what you were looking for. Try tweaking your text or uploading a clearer image.</p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-[#243d2d] dark:bg-[#d79a5f] text-[#f8f4ea] dark:text-[#162321] font-bold py-3 px-6 rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
          >
            Try Another Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex justify-between items-end mb-10 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="text-sm font-bold text-[#4f6f52] dark:text-[#d79a5f] hover:text-[#8d5f43] flex items-center space-x-1 mb-4 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Refine Search</span>
          </button>
          <h2 className="text-4xl font-display font-black text-[#162321] dark:text-[#f8f4ea]">Intelligent Results</h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">Found {searchResults.length} tailored recommendations.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {searchResults.map((res, index) => (
          <div key={res.product.id} className="stagger-card" style={{ animationDelay: `${index * 55}ms` }}>
            <ProductCard 
            key={res.product.id} 
            product={res.product} 
            score={res.score} 
            onClick={handleProductClick} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
