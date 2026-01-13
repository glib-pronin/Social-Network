import dotenv, os

env_path = os.path.abspath(__file__ + '/../../.env')

email = dotenv.get_key(env_path, 'EMAIL_HOST_USER')
password = dotenv.get_key(env_path, 'EMAIL_HOST_PASSWORD')