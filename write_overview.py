content = open('src/pages/Overview_v2.txt', 'r', encoding='utf-8').read()
with open('src/pages/Overview.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
