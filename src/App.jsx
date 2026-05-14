import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import StateDive from './pages/StateDive'
import PolicyExplorer from './pages/PolicyExplorer'
import Findings from './pages/Findings'
import Simulator from './pages/Simulator'
import SafetyNavigator from './pages/SafetyNavigator'

export default function App() {
  const location = useLocation()
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Overview />} />
          <Route path="/state" element={<StateDive />} />
          <Route path="/policies" element={<PolicyExplorer />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/safety" element={<SafetyNavigator />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}
