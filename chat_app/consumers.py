from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.template.loader import render_to_string
from django.db.models import Prefetch
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
        msgs = await self.create_msg(data.get('msg'), data.get('images', []))

        await self.channel_layer.group_send(
            self.room_group_name, 
            {
                'type': 'send_msg', 'sender': self.user, 'tempId': data.get('tempId'),
                'html_my': render_to_string(template_name='chat_app/messages.html', context={'objects': msgs, 'user': self.user}), 
                'html_another': render_to_string(template_name='chat_app/messages.html', context={'objects': msgs, 'user': None}), 
            }
        )

    async def send_msg(self, data):
        if data.get('sender') == self.user:
            await self.send(text_data=json.dumps({'html': data.get('html_my'), 'tempId': data.get('tempId')}))
        else:
            await self.send(text_data=json.dumps({'html': data.get('html_another'), 'tempId': data.get('tempId')}))

    @database_sync_to_async
    def create_msg(self, text: str, images):
        chat = Chat.objects.filter(pk=self.chat_id, users=self.user).first()
        if chat and (text.strip() or images):
            msg = Message.objects.create(text=text, sender=self.user, chat=chat)
            for img in images:
                MessageImage.objects.create(
                    message=msg, image_url=img.get('url'), public_id=img.get('publicId'),
                    width=img.get('width'), height=img.get('height'), order=img.get('order')
                )
            msg = Message.objects.filter(pk=msg.id).select_related('sender', 'sender__profile', 'sender__profile__photo').prefetch_related(
                Prefetch(
                    'images',
                    queryset=MessageImage.objects.all().order_by('order'),
                    to_attr='images_sorted'
                )
            ).first()
            return [msg]
        return []