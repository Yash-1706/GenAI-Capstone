import { Routes, Route, Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ResultsGrid from './pages/ResultsGrid';
import ProductDetail from './pages/ProductDetail';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Nexus Catalogue
          </Link>
          <div className="space-x-4">
            <Link to="/analytics" className="text-sm font-medium hover:text-indigo-600">Analytics</Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto p-4 py-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results" element={<ResultsGrid />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
