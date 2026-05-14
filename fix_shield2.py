with open('src/components/Layout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun } from 'lucide-react'",
    "import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun, Shield } from 'lucide-react'"
)

with open('src/components/Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
