from channels.generic.websocket import AsyncWebsocketConsumer
from SocialNetwork.redis import redis_client
import json

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('test')
        self.room_group_name = 'presence'
        self.user = self.scope.get('user')
        if not self.user.is_authenticated: 
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        connections = await redis_client.incr(f'user_{self.user.id}_connections')
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

    async def disconnect(self, code):
        if not self.user.is_authenticated: 
            return
        connections = await redis_client.decr(f'user_{self.user.id}_connections')
        if connections <= 0:
            await redis_client.srem('online_users', self.user.id)
            await redis_client.delete(f'user_{self.user.id}_connections')
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_user_status',
                    'user_id': self.user.id,
                    'status': 'offline'
                }
            )
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)