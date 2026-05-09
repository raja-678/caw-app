import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const { regression, correlations } = data

const findings = [
  {
    number: 1,
    color: '#A32D2D',
    bg: '#FCEBEB',
    title: 'Geographic concentration',
    body: 'Crime against women is heavily concentrated in 4-5 states. Uttar Pradesh alone averages 52,290 cases annually — 55% above the next highest state. National aggregate statistics mask this severe subnational heterogeneity.'
  },
  {
    number: 2,
    color: '#A32D2D',
    bg: '#FCEBEB',
    title: 'Crime rose despite policy activity',
    body: 'Average state-level crime increased 36% from 2015 to 2022, coinciding with elevated policy activity. There is no visible inflection point following major legislative years like 2013 (Nirbhaya Act), challenging the assumption that policy enactment directly reduces crime.'
  },
  {
    number: 3,
    color: '#854F0B',
    bg: '#FAEEDA',
    title: 'Legislative volume has near-zero correlation with crime',
    body: 'Policy count — whether same-year, 1-year lagged, or 2-year lagged — shows negligible correlation with state crime outcomes (r = -0.018 maximum). Simply counting policies enacted is not a useful predictor of crime outcomes.'
  },
  {
    number: 4,
    color: '#3B6D11',
    bg: '#EAF3DE',
    title: 'Structural deprivation outperforms policy as predictor',
    body: 'Infant mortality (r = +0.293) and early marriage rates (r = +0.281) show correlations 15x stronger than policy count. Female literacy (r = -0.218) also substantially outperforms policy count. Structural socioeconomic conditions are more proximate determinants of crime than legislative activity.'
  },
  {
    number: 5,
    color: '#A32D2D',
    bg: '#FCEBEB',
    title: 'The reporting effect — policies increase reported crime',
    body: 'Fixed-effects panel regression reveals a highly significant positive coefficient on Policy Count (β = 0.955, p < 0.001). Within the same state over time, years with more policies see higher reported crime — not lower. This is interpreted as a reporting effect: landmark legislation raises victim awareness and encourages women to report crimes previously unrecorded.'
  },
  {
    number: 6,
    color: '#3B6D11',
    bg: '#EAF3DE',
    title: 'Early marriage reduction predicts crime reduction',
    body: 'Early marriage rate carries a significant negative coefficient (β = -0.040, p = 0.022) in the fixed-effects model. States that reduced early marriage rates over time experienced lower crime growth — even after controlling for state baselines. This is the strongest structural policy lever identified.'
  },
]

const maxCorr = Math.max(...correlations.map(c => Math.abs(c.r)))

export default function Findings() {
  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>Research Findings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Six statistically grounded findings from panel regression across 22 states · 2014–2022
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Correlation with crime count</div>
          {correlations.map(c => {
            const abs = Math.abs(c.r)
            const w = (abs / maxCorr * 100)
            const isPos = c.r > 0
            const color = abs > 0.2 ? (isPos ? '#A32D2D' : '#3B6D11') : '#888780'
            return (
              <div key={c.variable} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <div style={{ width: 148, fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {c.variable}
                </div>
                <div style={{ flex: 1, height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: w + '%', height: '100%', background: color, borderRadius: 5 }} />
                </div>
                <div style={{ width: 44, fontSize: 12, fontWeight: 500, textAlign: 'right', color, flexShrink: 0 }}>
                  {c.r > 0 ? '+' : ''}{c.r.toFixed(3)}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
            Fixed-effects regression · R² = {regression.r_squared}
          </div>
          {[
            { label: 'Policy count', coef: regression.policy_count, p: '< 0.001', sig: '★★★' },
            { label: 'Policy lag 1yr', coef: regression.policy_lag1, p: '< 0.001', sig: '★★★' },
            { label: 'Female literacy', coef: regression.female_literacy, p: '0.075', sig: '★' },
            { label: 'Infant mortality', coef: regression.infant_mortality, p: '0.067', sig: '★' },
            { label: 'Early marriage', coef: regression.early_marriage, p: '0.022', sig: '★★' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 70px 40px',
              gap: 8, padding: '8px 0',
              borderBottom: '0.5px solid var(--border)', alignItems: 'center'
            }}>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{row.label}</div>
              <div style={{
                fontSize: 13, fontWeight: 500, textAlign: 'right',
                color: row.coef > 0 ? '#A32D2D' : '#3B6D11'
              }}>
                {row.coef > 0 ? '+' : ''}{row.coef.toFixed(4)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>
                p = {row.p}
              </div>
              <div style={{ fontSize: 12, color: '#534AB7', textAlign: 'right' }}>{row.sig}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>
            State + year fixed effects · 176 observations · ★★★ p&lt;0.01 · ★★ p&lt;0.05 · ★ p&lt;0.1
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {findings.map(f => (
          <div key={f.number} style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px',
            borderLeft: '3px solid ' + f.color
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                background: f.bg, color: f.color
              }}>Finding {f.number}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {f.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  </PageWrapper>
  )
}

