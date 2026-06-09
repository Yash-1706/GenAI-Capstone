import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { type Product } from '../store/useStore';
import { Sparkles, Layers, ArrowLeft, CheckCircle2, Package, Tag as TagIcon, Zap } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [extractingAttrs, setExtractingAttrs] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchProduct();
  }, [id]);

  const handleGenerateDesc = async () => {
    setGeneratingDesc(true);
    try {
      const res = await apiClient.post(`/products/${id}/describe`);
      setProduct(p => p ? { ...p, description: res.data.description, ai_generated: true } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleExtractAttrs = async () => {
    setExtractingAttrs(true);
    try {
      const res = await apiClient.post(`/products/${id}/extract-attributes`);
      setProduct(p => p ? { ...p, attributes: res.data.attributes } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setExtractingAttrs(false);
    }
  };

  if (!product) return (
    <div className="flex flex-col justify-center items-center h-[50vh] space-y-4">
      <div className="w-12 h-12 border-4 border-[#dbe7dc] border-t-[#b86b2f] rounded-full animate-spin"></div>
      <p className="text-stone-500 font-medium animate-pulse">Loading catalogue data...</p>
    </div>
  );

  const needsDescription = !product.description || product.description.length < 20;

  return (
    <div className="max-w-6xl mx-auto page-enter">
      <button 
        onClick={() => navigate(-1)} 
        className="group text-sm font-bold text-stone-500 dark:text-stone-400 hover:text-[#4f6f52] dark:hover:text-[#d79a5f] mb-8 inline-flex items-center transition-colors"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 relative bg-stone-100 dark:bg-[#0f1b18] p-8 lg:p-12 flex items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#4f6f52]/10 to-[#b86b2f]/10 dark:from-[#4f6f52]/20 dark:to-[#b86b2f]/20 mix-blend-overlay"></div>
          <img 
            src={product.image_urls[0]} 
            alt={product.name} 
            className="relative z-10 max-w-full max-h-[500px] object-contain rounded-2xl shadow-2xl drop-shadow-xl transition-transform hover:scale-[1.02] duration-700" 
          />
        </div>
        
        <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#dbe7dc] dark:bg-[#4f6f52]/25 text-[#243d2d] dark:text-[#d79a5f] text-xs font-bold uppercase tracking-widest mb-6 w-fit">
            <Package size={14} className="mr-2" /> {product.category}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-display font-black text-[#162321] dark:text-[#f8f4ea] mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center text-stone-400 dark:text-stone-500 mb-8 font-medium">
            <TagIcon size={16} className="mr-2" /> SKU: {product.sku}
          </div>
          
          <div className="text-5xl font-black text-[#8d5f43] dark:text-[#d79a5f] mb-10">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="space-y-10">
            {/* Description Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#162321] dark:text-stone-200">About this product</h3>
                {needsDescription && !generatingDesc && (
                  <button onClick={handleGenerateDesc} className="text-xs font-bold bg-gradient-to-r from-[#243d2d] to-[#b86b2f] text-[#f8f4ea] px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center">
                    <Sparkles size={14} className="mr-2" /> Auto-Generate
                  </button>
                )}
                {generatingDesc && (
                  <span className="text-xs text-[#8d5f43] dark:text-[#d79a5f] font-bold flex items-center bg-[#d79a5f]/15 dark:bg-[#b86b2f]/10 px-3 py-1.5 rounded-full">
                    <Zap size={14} className="mr-2 animate-pulse" /> Generating...
                  </span>
                )}
              </div>
              
              <div className="bg-[#fffaf0] dark:bg-[#0f1b18] rounded-2xl p-6 border border-stone-100 dark:border-stone-800">
                {product.description ? (
                  <div className="relative">
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
                      {product.description}
                    </p>
                    {product.ai_generated && (
                      <div className="mt-4 flex items-center text-xs font-bold text-[#4f6f52] dark:text-[#d79a5f] bg-[#dbe7dc] dark:bg-[#4f6f52]/20 w-fit px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={14} className="mr-1" /> AI Generated Copy
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-stone-400 dark:text-stone-500 italic">No description available for this product.</p>
                )}
              </div>
            </div>

            {/* Attributes Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#162321] dark:text-stone-200">Intelligence Tags</h3>
                {!product.attributes && !extractingAttrs && (
                  <button onClick={handleExtractAttrs} className="text-xs font-bold bg-[#162321] dark:bg-[#f8f4ea] text-[#f8f4ea] dark:text-[#162321] px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center">
                    <Layers size={14} className="mr-2" /> Extract Visual Data
                  </button>
                )}
                {extractingAttrs && (
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold flex items-center bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full">
                    <div className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mr-2"></div> Extracting...
                  </span>
                )}
              </div>
              
              {product.attributes ? (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(product.attributes).map(([k, v]) => v ? (
                    <div key={k} className="flex flex-col bg-white dark:bg-[#0f1b18] border border-stone-200 dark:border-stone-800 shadow-sm rounded-xl px-4 py-3 min-w-[120px] transition-transform duration-300 hover:-translate-y-1">
                      <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">{k}</span>
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-200 capitalize">{v}</span>
                    </div>
                  ) : null)}
                </div>
              ) : (
                <p className="text-stone-400 dark:text-stone-500 italic text-sm">Vision AI has not analysed this product yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
