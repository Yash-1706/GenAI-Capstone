import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UploadCloud, SlidersHorizontal, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client';
import { useStore } from '../store/useStore';

type SearchModality = 'text' | 'image' | 'combined';

const searchModes: Array<{ id: SearchModality; icon: typeof Type; label: string }> = [
  { id: 'text', icon: Type, label: 'Text Search' },
  { id: 'image', icon: ImageIcon, label: 'Visual Search' },
  { id: 'combined', icon: Sparkles, label: 'Multimodal Fusion' }
];

export default function SearchPage() {
  const [modality, setModality] = useState<SearchModality>('text');
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full page-enter">
      <div className="text-center mb-12 space-y-4">
        <h1 className="font-display text-5xl md:text-7xl font-black text-[#162321] dark:text-[#f8f4ea] tracking-tight">
          Find the <span className="text-gradient">impossible</span>.
        </h1>
        <p className="text-lg md:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-medium">
          Search with words, photos, or a powerful combination of both using multimodal intelligence.
        </p>
      </div>

      <div className="w-full max-w-3xl glass-card rounded-3xl p-2 sm:p-4">
        <div className="flex space-x-2 mb-6 p-2 bg-stone-100/70 dark:bg-stone-900/50 rounded-2xl relative overflow-hidden">
          {searchModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setModality(m.id)}
              className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                modality === m.id
                  ? 'bg-white dark:bg-[#121f1b] text-[#243d2d] dark:text-[#d79a5f] shadow-md transform scale-[1.02]'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <m.icon size={18} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {(modality === 'text' || modality === 'combined') && (
            <div className="relative group stagger-card">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-stone-400 group-focus-within:text-[#b86b2f] transition-colors" size={24} />
              </div>
              <input
                type="text"
                placeholder={modality === 'combined' ? 'Describe the modifications...' : 'What are you looking for?'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="smooth-focus w-full pl-14 pr-4 py-5 bg-[#fffaf0] dark:bg-[#0f1b18] border-2 border-transparent focus:border-[#b86b2f]/60 dark:focus:border-[#d79a5f]/60 rounded-2xl text-lg font-medium outline-none placeholder:text-stone-400 dark:text-[#f8f4ea]"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          )}

          {(modality === 'image' || modality === 'combined') && (
            <div
              className={`relative border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer stagger-card ${
                file
                  ? 'border-[#b86b2f] bg-[#d79a5f]/15 dark:border-[#d79a5f]/70 dark:bg-[#b86b2f]/10'
                  : 'border-stone-300 dark:border-stone-700 hover:border-[#b86b2f] hover:bg-stone-50 dark:hover:bg-stone-800/50'
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
                <div className={`p-4 rounded-full transition-transform duration-300 ${file ? 'bg-[#d79a5f]/25 dark:bg-[#b86b2f]/20 text-[#8d5f43] dark:text-[#d79a5f] scale-105' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>
                  <UploadCloud size={32} />
                </div>
                {file ? (
                  <div>
                    <p className="text-lg font-bold text-[#162321] dark:text-[#f8f4ea]">{file.name}</p>
                    <p className="text-sm font-medium text-[#8d5f43] dark:text-[#d79a5f] mt-1">Image selected</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-stone-700 dark:text-stone-300">Drag & drop or click to upload</p>
                    <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">Supports JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {modality === 'combined' && (
            <div className="bg-[#fffaf0] dark:bg-[#0f1b18] rounded-2xl p-6 border border-stone-100 dark:border-stone-800 stagger-card">
              <div className="flex items-center space-x-2 mb-4 text-stone-700 dark:text-stone-300 font-semibold">
                <SlidersHorizontal size={18} />
                <span>Fusion Weight Balance</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
                <span>Text Priority</span>
                <span className="text-[#8d5f43] dark:text-[#d79a5f]">{(fusionWeight * 100).toFixed(0)}% Visual</span>
                <span>Visual Priority</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={fusionWeight}
                onChange={(e) => setFusionWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#b86b2f]"
              />
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary w-full bg-gradient-to-r from-[#243d2d] via-[#4f6f52] to-[#b86b2f] text-[#f8f4ea] font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-[#4f6f52]/20 disabled:opacity-50 disabled:shadow-none text-lg flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-[#f8f4ea]/40 border-t-[#f8f4ea] animate-spin"></span>
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
