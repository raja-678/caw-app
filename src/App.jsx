import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import StateDive from './pages/StateDive'
import PolicyExplorer from './pages/PolicyExplorer'
import Findings from './pages/Findings'
import Simulator from './pages/Simulator'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/state" element={<StateDive />} />
        <Route path="/policies" element={<PolicyExplorer />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
    </Layout>
  )
}
