from pymongo import MongoClient
from dotenv import load_dotenv
from flask import session

dotenv_path = '/Users/marta/virtual-canvas/.env'
load_dotenv(dotenv_path)


class UserDatabase:

    def __init__(self):
        # self.mongo_username = os.getenv('MONGO_LOGIN')
        # self.mongo_password = os.getenv('MONGO_PASSWORD')
        # self.url = f'mongodb://{self.mongo_username}:{self.mongo_password}@localhost:27017/'
        self.url = "mongodb://localhost:27017"
        self.client = MongoClient(self.url)
        self.db = self.client['users_database']
        self.collection = self.db['users']

    def get_max_user_id(self):
        max_id = self.collection.find_one(sort=[('_id', -1)])
        if max_id:
            return max_id['_id']
        else:
            return 0

    def register_user(self, username, email, password):
        max_id = self.get_max_user_id()
        print(type(max_id))
        id_user = int(max_id) + 1

        user_exist = self.collection.find_one({"username": username, "email": email})
        if user_exist:
            return 'ERROR'
        else:
            user_data = {
                '_id': str(id_user),
                'username': username,
                'email': email,
                'password': password,
            }

        result = self.collection.insert_one(user_data)
        return result.inserted_id

    def login_user(self, username, password):
        user_exist = self.collection.find_one({"username": username, "password": password})
        if user_exist:
            session['user_id'] = str(user_exist['_id'])
            session['username'] = user_exist['username']
            return True
        else:
            return False
