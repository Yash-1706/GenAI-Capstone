import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchPage from './pages/SearchPage';
import ResultsGrid from './pages/ResultsGrid';
import ProductDetail from './pages/ProductDetail';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
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
