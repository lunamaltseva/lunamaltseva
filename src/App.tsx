import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Fiction from './pages/Fiction';
import Academic from './pages/Academic';
import About from './pages/About';
import Design from './pages/Design';
import Favorites from './pages/Favorites';
import Redirect from './pages/r';
import MenstrualClock from './pages/MenstrualClock';
import BreakingNews from './pages/BreakingNews';
import RtmsCE from './pages/RtmsCE';
import NotFound from './pages/NotFound';

const Decay = lazy(() => import('./pages/Decay'));

function App() {
  return (
    <Routes>
      <Route path="/menstrualclock" element={<MenstrualClock />} />
      <Route path="/rtmsce" element={<RtmsCE />} />
      <Route path="*" element={
        <div className="app-wrapper">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <main className="main-content">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, background: '#000000' }} />
                <Hero />
              </main>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/writing/fiction" element={<Fiction />} />
            <Route path="/writing/academic" element={<Academic />} />
            <Route path="/design" element={<Design />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/r" element={<Redirect />} />
            <Route path="/decay" element={<Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }} />}><Decay /></Suspense>} />
            <Route path="/breakingnews" element={<BreakingNews />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      } />
    </Routes>
  );
}

export default App;
