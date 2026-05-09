import { useState } from 'react'
import data from '../data/caw_data.json'

const { regression } = data

const nationalAvg = {
  policies: 2.44,
  literacy: 68.4,
  early_marriage: 2.8,
  infant_mortality: 36.2,
}

function predict(policies, literacy, earlyMarriage, infantMortality) {
  const log = regression.intercept
    + regression.policy_count * policies
    + regression.female_literacy * literacy
    + regression.early_marriage * earlyMarriage
    + regression.infant_mortality * infantMortality
  return Math.round(Math.exp(log))
}

const baselineCrime = predict(
  nationalAvg.policies,
  nationalAvg.literacy,
  nationalAvg.early_marriage,
  nationalAvg.infant_mortality
)

function Slider({ label, value, min, max, step, unit, onChange, higherIsBad, description }) {
  const atNational = Math.abs(value - nationalAvg[label.toLowerCase().replace(/ /g,'_')]) < step
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>{description}</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
          {typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: 'var(--purple-600)' }}>
          National avg: {typeof nationalAvg[label.toLowerCase().replace(/ /g,'_')] === 'number'
            ? nationalAvg[label.toLowerCase().replace(/ /g,'_')].toFixed(1) : '—'}{unit}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{max}{unit}</span>
      </div>
    </div>
  )
}

function DeltaBadge({ current, baseline }) {
  const delta = current - baseline
  const pct = ((delta / baseline) * 100).toFixed(1)
  const isUp = delta > 0
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20,
      background: isUp ? '#FCEBEB' : '#EAF3DE',
      color: isUp ? '#A32D2D' : '#3B6D11',
      fontSize: 13, fontWeight: 500
    }}>
      {isUp ? '▲' : '▼'} {Math.abs(pct)}% {isUp ? 'above' : 'below'} national baseline
    </div>
  )
}

const scenarios = [
  {
    label: 'Best case — Kerala model',
    desc: 'High literacy, low early marriage, low infant mortality',
    policies: 3, literacy: 92, earlyMarriage: 1.4, infantMortality: 12,
    color: '#3B6D11', bg: '#EAF3DE'
  },
  {
    label: 'National average',
    desc: 'Current average across all 22 states',
    policies: 2.44, literacy: 68.4, earlyMarriage: 2.8, infantMortality: 36.2,
    color: '#534AB7', bg: '#EEEDFE'
  },
  {
    label: 'High deprivation — UP model',
    desc: 'Low literacy, high early marriage, high infant mortality',
    policies: 3, literacy: 59, earlyMarriage: 3.8, infantMortality: 49,
    color: '#A32D2D', bg: '#FCEBEB'
  },
]

export default function Simulator() {
  const [policies, setPolicies] = useState(nationalAvg.policies)
  const [literacy, setLiteracy] = useState(nationalAvg.literacy)
  const [earlyMarriage, setEarlyMarriage] = useState(nationalAvg.early_marriage)
  const [infantMortality, setInfantMortality] = useState(nationalAvg.infant_mortality)

  const predicted = predict(policies, literacy, earlyMarriage, infantMortality)

  const applyScenario = (s) => {
    setPolicies(s.policies)
    setLiteracy(s.literacy)
    setEarlyMarriage(s.earlyMarriage)
    setInfantMortality(s.infantMortality)
  }

  const reset = () => {
    setPolicies(nationalAvg.policies)
    setLiteracy(nationalAvg.literacy)
    setEarlyMarriage(nationalAvg.early_marriage)
    setInfantMortality(nationalAvg.infant_mortality)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>Policy Simulator</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Adjust structural indicators to see predicted impact on crime — powered by your actual regression model (R² = 0.983)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {scenarios.map(s => (
          <div
            key={s.label}
            onClick={() => applyScenario(s)}
            style={{
              background: s.bg, border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
              cursor: 'pointer', transition: 'opacity 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{ fontSize: 12, fontWeight: 500, color: s.color, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 6 }}>
              Predicted: ~{predict(s.policies, s.literacy, s.earlyMarriage, s.infantMortality).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '24px 26px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Adjust variables</div>
            <button
              onClick={reset}
              style={{
                fontSize: 12, padding: '5px 12px', borderRadius: 'var(--radius-md)',
                border: '0.5px solid var(--border-strong)', background: 'transparent',
                color: 'var(--text-secondary)'
              }}
            >Reset to national avg</button>
          </div>

          <Slider label="Policies" value={policies} min={0} max={12} step={1} unit=""
            onChange={setPolicies} higherIsBad={false}
            description="— policies enacted that year" />
          <Slider label="Literacy" value={literacy} min={40} max={95} step={0.5} unit="%"
            onChange={setLiteracy} higherIsBad={false}
            description="— female literacy rate" />
          <Slider label="Early_marriage" value={earlyMarriage} min={1} max={6} step={0.1} unit=""
            onChange={setEarlyMarriage} higherIsBad={true}
            description="— early marriage rate (strongest predictor)" />
          <Slider label="Infant_mortality" value={infantMortality} min={10} max={70} step={1} unit=""
            onChange={setInfantMortality} higherIsBad={true}
            description="— infant mortality rate" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Predicted annual crime count
            </div>
            <div style={{ fontSize: 42, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
              {predicted.toLocaleString()}
            </div>
            <DeltaBadge current={predicted} baseline={baselineCrime} />
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
              Based on fixed-effects regression coefficients · Log-linear model · R² = 0.983
            </div>
          </div>

          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px'
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>What drives this prediction</div>
            {[
              { label: 'Early marriage', value: earlyMarriage, coef: regression.early_marriage, direction: 'negative predictor' },
              { label: 'Infant mortality', value: infantMortality, coef: regression.infant_mortality, direction: 'positive predictor' },
              { label: 'Female literacy', value: literacy, coef: regression.female_literacy, direction: 'marginal positive' },
              { label: 'Policy count', value: policies, coef: regression.policy_count, direction: 'reporting effect' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.direction}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: item.coef < 0 ? '#3B6D11' : '#A32D2D' }}>
                  β = {item.coef > 0 ? '+' : ''}{item.coef.toFixed(4)} · current value: {item.value.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
