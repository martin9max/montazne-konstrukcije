import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { domMax, LazyMotion, MotionConfig } from 'framer-motion'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'

const Configurator = lazy(() => import('./pages/Configurator'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-[70vh]" />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="konfigurator" element={<Configurator />} />
              <Route path="porudzbina-poslata" element={<OrderSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  )
}
