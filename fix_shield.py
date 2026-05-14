with open('src/components/Layout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the import to include Shield
content = content.replace(
    "import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun, Info } from 'lucide-react'",
    "import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun, Info, Shield } from 'lucide-react'"
)
content = content.replace(
    "import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun, Info, Shield, Shield } from 'lucide-react'",
    "import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun, Info, Shield } from 'lucide-react'"
)

with open('src/components/Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed')
