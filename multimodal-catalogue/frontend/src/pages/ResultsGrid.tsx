import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

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
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-700">No results found</h2>
        <p className="text-slate-500 mt-2">Try adjusting your query or image.</p>
        <button onClick={() => navigate('/')} className="mt-6 text-indigo-600 font-medium hover:underline">
          &larr; Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Search Results</h2>
        <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-500 hover:text-indigo-600">
          New Search
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((res) => (
          <div 
            key={res.product.id} 
            onClick={() => handleProductClick(res.product.id)}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-square relative overflow-hidden bg-slate-100">
              <img 
                src={res.product.image_urls[0]} 
                alt={res.product.name} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-indigo-700 shadow-sm">
                {(res.score * 100).toFixed(1)}% Match
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{res.product.category}</div>
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{res.product.name}</h3>
              <p className="text-xl font-extrabold text-indigo-600 mt-2">${res.product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
