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
      className="group cursor-pointer glass-card rounded-2xl overflow-hidden transition-all duration-500"
    >
      <div className="aspect-square relative overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img 
          src={product.image_urls[0]} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 mix-blend-multiply dark:mix-blend-normal"
        />
        {score !== undefined && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#0f1b18]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[#243d2d] dark:text-[#d79a5f] shadow-sm border border-white/50 dark:border-stone-700">
            {(score * 100).toFixed(1)}% Match
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="text-xs font-bold text-[#8d5f43] dark:text-[#d79a5f] uppercase tracking-wider mb-2">{product.category}</div>
        <h3 className="font-display font-bold text-xl text-[#162321] dark:text-[#f8f4ea] line-clamp-1 group-hover:text-[#4f6f52] dark:group-hover:text-[#d79a5f] transition-colors">{product.name}</h3>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-2xl font-black text-[#162321] dark:text-white">${product.price.toFixed(2)}</p>
          
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#b86b2f]"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="w-2 h-2 rounded-full bg-[#4f6f52]"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
