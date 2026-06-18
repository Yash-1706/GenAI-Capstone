import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app

async def test():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post('/api/search/text', json={'query': 'chair', 'top_k': 1})
        print(response.status_code)
        print(response.text)

asyncio.run(test())
