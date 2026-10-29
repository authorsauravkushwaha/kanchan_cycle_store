import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './i18n';
import { Layout } from './components/Layout';
import Home from './pages/Home';

const Cycles = lazy(() => import('./pages/Cycles'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Accessories = lazy(() => import('./pages/Accessories'));
const Services = lazy(() => import('./pages/Services'));
const Recommendation = lazy(() => import('./pages/Recommendation'));
const Offers = lazy(() => import('./pages/Offers'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingPage() {
  const { l } = useLanguage();
  return <div className="route-loading" role="status"><span className="route-loading-wheel" aria-hidden="true" />{l({ bn: 'পেজটি খোলা হচ্ছে…', en: 'Opening the page…' })}</div>;
}
export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}><LanguageProvider><Layout><Suspense fallback={<LoadingPage />}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cycles" element={<Cycles />} />
    <Route path="/cycles/:slug" element={<ProductDetail />} />
    <Route path="/accessories" element={<Accessories />} />
    <Route path="/services" element={<Services />} />
    <Route path="/recommendation" element={<Recommendation />} />
    <Route path="/offers" element={<Offers />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense></Layout></LanguageProvider></BrowserRouter>;
}
