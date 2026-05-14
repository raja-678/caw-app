with open('src/pages/Findings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    "{d.state} {d.year ? () : ''}",
    "{d.state}{d.year ? ' (' + d.year + ')' : ''}"
)
with open('src/pages/Findings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed')
