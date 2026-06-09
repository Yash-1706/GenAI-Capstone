import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Product } from '../store/useStore';
import { Sparkles, Tag, Layers } from 'lucide-react';

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

  if (!product) return <div className="text-center py-20 font-medium text-slate-500">Loading product...</div>;

  const needsDescription = !product.description || product.description.length < 20;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8 inline-flex items-center">
        &larr; Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 bg-slate-50 flex items-center justify-center">
          <img src={product.image_urls[0]} alt={product.name} className="max-w-full h-auto rounded-xl shadow-md mix-blend-multiply" />
        </div>
        
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-2">{product.category}</div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{product.name}</h1>
          <p className="text-sm text-slate-400 mb-6">SKU: {product.sku}</p>
          
          <div className="text-4xl font-black text-slate-800 mb-8">${product.price.toFixed(2)}</div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-slate-800">Description</h3>
              {needsDescription && !generatingDesc && (
                <button onClick={handleGenerateDesc} className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 flex items-center">
                  <Sparkles size={14} className="mr-1" /> Generate AI Copy
                </button>
              )}
              {generatingDesc && <span className="text-xs text-indigo-500 font-medium animate-pulse">Generating...</span>}
            </div>
            {product.description ? (
              <p className="text-slate-600 leading-relaxed">
                {product.description}
                {product.ai_generated && <span className="inline-block ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase font-bold">AI Generated</span>}
              </p>
            ) : (
              <p className="text-slate-400 italic">No description available.</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Attributes</h3>
              {!product.attributes && !extractingAttrs && (
                <button onClick={handleExtractAttrs} className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-200 flex items-center">
                  <Layers size={14} className="mr-1" /> Extract AI Attributes
                </button>
              )}
              {extractingAttrs && <span className="text-xs text-slate-500 font-medium animate-pulse">Extracting...</span>}
            </div>
            
            {product.attributes ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.attributes).map(([k, v]) => v ? (
                  <div key={k} className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-semibold text-slate-400 capitalize mr-2">{k}:</span>
                    <span className="text-sm font-medium text-slate-700">{v}</span>
                  </div>
                ) : null)}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No attributes extracted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
