from django.core.management.base import BaseCommand
from asgiref.sync import async_to_sync
from SocialNetwork.redis import clear_redis

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        async_to_sync(clear_redis)()
        self.stdout.write("Redis cleared")