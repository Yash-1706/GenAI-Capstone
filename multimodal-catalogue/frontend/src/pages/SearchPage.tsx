import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UploadCloud } from 'lucide-react';
import { apiClient } from '../api/client';
import { useStore } from '../store/useStore';

export default function SearchPage() {
  const [modality, setModality] = useState<'text' | 'image' | 'combined'>('text');
  const [query, setQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fusionWeight, setFusionWeight] = useState(0.6);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const { setSearchResults } = useStore();

  const handleSearch = async () => {
    setLoading(true);
    try {
      let res;
      if (modality === 'text') {
        res = await apiClient.post('/search/text', { query, top_k: 10 });
      } else if (modality === 'image') {
        const formData = new FormData();
        if (file) formData.append('image', file);
        formData.append('top_k', '10');
        res = await apiClient.post('/search/image', formData);
      } else {
        const formData = new FormData();
        formData.append('query', query);
        if (file) formData.append('image', file);
        formData.append('fusion_weight', fusionWeight.toString());
        formData.append('top_k', '10');
        res = await apiClient.post('/search/combined', formData);
      }
      setSearchResults(res.data.results, res.data.event_id);
      navigate('/results');
    } catch (e) {
      console.error(e);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
      <h1 className="text-4xl font-extrabold text-slate-800">Find exactly what you want</h1>
      
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex space-x-4 mb-6 relative p-1 bg-slate-100 rounded-lg">
          {['text', 'image', 'combined'].map((m) => (
            <button
              key={m}
              onClick={() => setModality(m as any)}
              className={`flex-1 py-2 font-medium capitalize rounded-md transition-all ${
                modality === m ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {(modality === 'text' || modality === 'combined') && (
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Describe what you're looking for..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          )}

          {(modality === 'image' || modality === 'combined') && (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                accept="image/*"
              />
              <UploadCloud className="mx-auto text-slate-400 mb-3" size={32} />
              {file ? (
                <p className="text-sm font-medium text-indigo-600">{file.name}</p>
              ) : (
                <p className="text-sm text-slate-500">Click to upload an image</p>
              )}
            </div>
          )}

          {modality === 'combined' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>More Text</span>
                <span>Fusion Weight (Image relevance)</span>
                <span>More Image</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={fusionWeight} 
                onChange={(e) => setFusionWeight(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          )}

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? 'Searching AI Database...' : 'Search Catalogue'}
          </button>
        </div>
      </div>
    </div>
  );
}
