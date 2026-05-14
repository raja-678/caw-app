content = open('index.html', 'r', encoding='utf-8').read()
leaflet_css = '    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />'
leaflet_js = '    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
new_head = leaflet_css + '\n' + leaflet_js + '\n  </head>'
content = content.replace('  </head>', new_head)
open('index.html', 'w', encoding='utf-8').write(content)
print('Done')
print(content)
