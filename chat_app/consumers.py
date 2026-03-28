from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.template.loader import render_to_string
from asgiref.sync import sync_to_async
from .models import *
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'
        self.user = self.scope.get('user')
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        msgs = await self.create_msg(data.get('msg'))

        await self.channel_layer.group_send(
            self.room_group_name, 
            {
                'type': 'send_msg', 'sender': self.user, 
                'html_my': render_to_string(template_name='chat_app/messages.html', context={'objects': msgs, 'user': self.user}), 
                'html_another': render_to_string(template_name='chat_app/messages.html', context={'objects': msgs, 'user': None}), 
            }
        )

    async def send_msg(self, data):
        if data.get('sender') == self.user:
            await self.send(text_data=json.dumps({'html': data.get('html_my')}))
        else:
            await self.send(text_data=json.dumps({'html': data.get('html_another')}))

    @database_sync_to_async
    def create_msg(self, text: str):
        chat = Chat.objects.filter(pk=self.chat_id, users=self.user).first()
        if chat and text.strip():
            msg = Message.objects.create(text=text, sender=self.user, chat=chat)
            msg = Message.objects.filter(pk=msg.id).select_related('sender', 'sender__profile', 'sender__profile__photo').first()
            return [msg]
        return []