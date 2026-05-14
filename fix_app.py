content = open('src/App.jsx', 'r', encoding='utf-8').read()
content = content.replace(
    "import SafetyNavigator from './pages/SafetyNavigator'\nimport SafetyNavigator from './pages/SafetyNavigator'",
    "import SafetyNavigator from './pages/SafetyNavigator'"
)
content = content.replace(
    "path=\"/simulator\" element={<Simulator />} />",
    "path=\"/simulator\" element={<Simulator />} />\n          <Route path=\"/safety\" element={<SafetyNavigator />} />"
)
open('src/App.jsx', 'w', encoding='utf-8').write(content)
print('Fixed')
