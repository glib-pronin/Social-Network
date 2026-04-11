from channels.generic.websocket import AsyncWebsocketConsumer
from SocialNetwork.redis import redis_client
import json, asyncio

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'presence'
        self.user = self.scope.get('user')
        if not self.user.is_authenticated: 
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(f'notification_user_{self.user.id}', self.channel_name)
        connections = await redis_client.incr(f'user_{self.user.id}_connections')
        print(connections)
        if connections == 1:
            await redis_client.sadd('online_users', self.user.id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_user_status',
                    'user_id': self.user.id,
                    'status': 'online'
                }
            )
        await self.accept()

    async def send_user_status(self, data):
        await self.send(text_data=json.dumps(data))

    async def send_notif(self, data):
        await self.send(text_data=json.dumps(data))

    async def disconnect(self, code):
        if not self.user.is_authenticated: 
            return
        await redis_client.decr(f'user_{self.user.id}_connections')
        asyncio.create_task(self.handle_disconnect(self.user.id, self.room_group_name, self.channel_layer))
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def handle_disconnect(self, user_id, group_name, channel_layer):
        await asyncio.sleep(3)
        connections = await redis_client.get(f'user_{user_id}_connections')
        if connections is None or int(connections) <= 0:
            await redis_client.srem('online_users', user_id)
            await redis_client.delete(f'user_{user_id}_connections')
            await channel_layer.group_send(
                group_name,
                {
                    'type': 'send_user_status',
                    'user_id': user_id,
                    'status': 'offline'
                }
            )