# Add to App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    "import Simulator from './pages/Simulator'",
    "import Simulator from './pages/Simulator'\nimport SafetyNavigator from './pages/SafetyNavigator'"
)
content = content.replace(
    "path='/simulator'",
    "path='/simulator'"
)
# Add route before closing Routes
content = content.replace(
    "path=\"/simulator\"",
    "path=\"/simulator\""
)
# Simple string approach
old = "import Simulator from './pages/Simulator'"
new = "import Simulator from './pages/Simulator'\nimport SafetyNavigator from './pages/SafetyNavigator'"
content = content.replace(old, new, 1)

old2 = "'/simulator' element={<Simulator />} />"
new2 = "'/simulator' element={<Simulator />} />\n          <Route path='/safety' element={<SafetyNavigator />} />"
content = content.replace(old2, new2, 1)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('App.jsx updated')

# Add to Layout.jsx
with open('src/components/Layout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old3 = "{ to: '/simulator', icon: Sliders, label: 'Simulator' },"
new3 = "{ to: '/simulator', icon: Sliders, label: 'Simulator' },\n  { to: '/safety', icon: Shield, label: 'Safety Navigator' },"
content = content.replace(old3, new3, 1)

old4 = "Sliders, Menu, X, Moon, Sun, Info"
new4 = "Sliders, Menu, X, Moon, Sun, Info, Shield"
content = content.replace(old4, new4, 1)

with open('src/components/Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Layout.jsx updated')
