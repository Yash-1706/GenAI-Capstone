import { type Product } from '../store/useStore';

interface ProductCardProps {
  product: Product;
  score?: number;
  onClick: (id: string) => void;
}

export default function ProductCard({ product, score, onClick }: ProductCardProps) {
  return (
    <div 
      onClick={() => onClick(product.id)}
      className="group cursor-pointer glass-card rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-indigo-900/20 transition-all duration-300"
    >
      <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={product.image_urls[0]} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
        />
        {score !== undefined && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-400 shadow-sm border border-white/50 dark:border-slate-700">
            {(score * 100).toFixed(1)}% Match
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">{product.category}</div>
        <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{product.name}</h3>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-2xl font-black text-slate-900 dark:text-white">${product.price.toFixed(2)}</p>
          
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
