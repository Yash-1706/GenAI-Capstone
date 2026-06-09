import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UploadCloud, SlidersHorizontal, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
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
        res = await apiClient.post('/search/text', { query, top_k: 12 });
      } else if (modality === 'image') {
        const formData = new FormData();
        if (file) formData.append('image', file);
        formData.append('top_k', '12');
        res = await apiClient.post('/search/image', formData);
      } else {
        const formData = new FormData();
        formData.append('query', query);
        if (file) formData.append('image', file);
        formData.append('fusion_weight', fusionWeight.toString());
        formData.append('top_k', '12');
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center mb-12 space-y-4">
        <h1 className="font-display text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
          Find the <span className="text-gradient">impossible</span>.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Search with words, photos, or a powerful combination of both using multimodal intelligence.
        </p>
      </div>
      
      <div className="w-full max-w-3xl glass-card rounded-3xl p-2 sm:p-4">
        <div className="flex space-x-2 mb-6 p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl relative overflow-hidden">
          {[
            { id: 'text', icon: Type, label: 'Text Search' },
            { id: 'image', icon: ImageIcon, label: 'Visual Search' },
            { id: 'combined', icon: Sparkles, label: 'Multimodal Fusion' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setModality(m.id as any)}
              className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                modality === m.id 
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <m.icon size={18} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {(modality === 'text' || modality === 'combined') && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
              </div>
              <input
                type="text"
                placeholder={modality === 'combined' ? "Describe the modifications..." : "What are you looking for?"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500/50 dark:focus:border-indigo-500/50 rounded-2xl text-lg font-medium outline-none transition-all placeholder:text-slate-400 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          )}

          {(modality === 'image' || modality === 'combined') && (
            <div 
              className={`relative border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                file 
                  ? 'border-indigo-400 bg-indigo-50/50 dark:border-indigo-500/50 dark:bg-indigo-900/10' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                accept="image/*"
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-4 rounded-full ${file ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  <UploadCloud size={32} />
                </div>
                {file ? (
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{file.name}</p>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">Image selected</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Drag & drop or click to upload</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Supports JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {modality === 'combined' && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 mb-4 text-slate-700 dark:text-slate-300 font-semibold">
                <SlidersHorizontal size={18} />
                <span>Fusion Weight Balance</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                <span>Text Priority</span>
                <span className="text-indigo-600 dark:text-indigo-400">{(fusionWeight * 100).toFixed(0)}% Visual</span>
                <span>Visual Priority</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={fusionWeight} 
                onChange={(e) => setFusionWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          )}

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-5 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none text-lg flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <span className="animate-spin text-xl">✨</span>
                <span>Analysing Multimodal Data...</span>
              </>
            ) : (
              <span>Discover Products</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
