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
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      setProduct(res.data);
    } catch (e) {
      console.error(e);
    }
  };

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
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading catalogue data...</p>
    </div>
  );

  const needsDescription = !product.description || product.description.length < 20;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={() => navigate(-1)} 
        className="group text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 inline-flex items-center transition-colors"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 relative bg-slate-100 dark:bg-slate-900/50 p-8 lg:p-12 flex items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 mix-blend-overlay"></div>
          <img 
            src={product.image_urls[0]} 
            alt={product.name} 
            className="relative z-10 max-w-full max-h-[500px] object-contain rounded-2xl shadow-2xl drop-shadow-xl transition-transform hover:scale-[1.02] duration-500" 
          />
        </div>
        
        <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 w-fit">
            <Package size={14} className="mr-2" /> {product.category}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center text-slate-400 dark:text-slate-500 mb-8 font-medium">
            <TagIcon size={16} className="mr-2" /> SKU: {product.sku}
          </div>
          
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-10">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="space-y-10">
            {/* Description Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">About this product</h3>
                {needsDescription && !generatingDesc && (
                  <button onClick={handleGenerateDesc} className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center">
                    <Sparkles size={14} className="mr-2" /> Auto-Generate
                  </button>
                )}
                {generatingDesc && (
                  <span className="text-xs text-indigo-500 font-bold flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                    <Zap size={14} className="mr-2 animate-pulse" /> Generating...
                  </span>
                )}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                {product.description ? (
                  <div className="relative">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                      {product.description}
                    </p>
                    {product.ai_generated && (
                      <div className="mt-4 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 w-fit px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={14} className="mr-1" /> AI Generated Copy
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic">No description available for this product.</p>
                )}
              </div>
            </div>

            {/* Attributes Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Intelligence Tags</h3>
                {!product.attributes && !extractingAttrs && (
                  <button onClick={handleExtractAttrs} className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center">
                    <Layers size={14} className="mr-2" /> Extract Visual Data
                  </button>
                )}
                {extractingAttrs && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div> Extracting...
                  </span>
                )}
              </div>
              
              {product.attributes ? (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(product.attributes).map(([k, v]) => v ? (
                    <div key={k} className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl px-4 py-3 min-w-[120px]">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{k}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{v}</span>
                    </div>
                  ) : null)}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic text-sm">Vision AI has not analysed this product yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
