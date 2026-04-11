from .settings import REDIS_URL
import redis.asyncio as redis
from asgiref.sync import async_to_sync

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def clear_redis():
    print('clear')
    await redis_client.flushdb()
