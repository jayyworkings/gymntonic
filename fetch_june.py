import urllib.request, re
req = urllib.request.Request('https://stores.gymntonic.com', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
urls = re.findall(r'src="([^"]+\.jpg)"', html, re.I)
for u in urls:
    if 'uploaded_images' in u:
        print(u)
