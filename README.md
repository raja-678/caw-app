# CAW India — Crime Against Women Research Dashboard

An interactive research dashboard investigating the relationship between policy interventions and crimes against women across 22 Indian states from 2014 to 2022.

## Research Summary

This dashboard accompanies an academic paper examining why some Indian states remain persistently high-risk for crimes against women despite active policy interventions. Key findings include:

- Policy count has near-zero bivariate correlation with crime (r = -0.018)
- Structural indicators — early marriage (r = +0.281) and infant mortality (r = +0.293) — are 15x stronger predictors than policy volume
- Fixed-effects panel regression reveals a significant reporting effect (p < 0.001) — more policies lead to more reported crime, not more actual crime
- Reducing early marriage rates is the strongest structural policy lever (p = 0.022)
- Model R-squared = 0.983 across 22 states and 9 years

## Features

- Interactive India choropleth map — switch between crime, literacy, early marriage, infant mortality
- State deep dive — full socioeconomic profile for any of 22 states
- Policy explorer — browse all 45 national policies with filters
- Research findings — correlation analysis and regression results
- Policy simulator — adjust structural variables and see predicted crime outcomes

## Data Sources

- NCRB Crime Data (2014-2022)
- India Policy Master Dataset (original, hand-coded)
- SRS Socioeconomic Panel (state-wise indicators)

## License

MIT License — see LICENSE file
