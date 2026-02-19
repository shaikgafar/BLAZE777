import requests
from PIL import Image
import io

img = Image.new('RGB', (64, 64), color='white')
buf = io.BytesIO()
img.save(buf, format='PNG')
buf.seek(0)

files = {'blueprint': ('test.png', buf.getvalue(), 'image/png')}
data = {'project_type': 'Commercial Complex'}
res = requests.post('http://localhost:8000/analyze', files=files, data=data, timeout=120)
print(res.status_code)
print(res.text[:1000])
