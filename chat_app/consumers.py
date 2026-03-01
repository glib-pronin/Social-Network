from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'test_group'
        self.user = self.scope.get('user')
        print(self.channel_layer)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connect',
            'msg': 'hello',
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name, 
            {
                'type': 'send_msg',
                'msg': data.get('msg'), 
                'username': self.user.username
            }
        )

    async def send_msg(self, data):
        print(self.user)
        await self.send(text_data=json.dumps(data)) 