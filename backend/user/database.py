import logging
from os.path import join, dirname
from pymongo import MongoClient
from dotenv import load_dotenv
from flask import session

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)


class UserDatabase:

    def __init__(self):
        self.url = "mongodb://localhost:27017"
        self.client = MongoClient(self.url)
        self.db = self.client['users_database']
        self.collection = self.db['users']
        self.canvas_collection = self.db['canvas_data']

    def get_max_user_id(self):
        max_id = self.collection.find_one(sort=[('_id', -1)])
        if max_id:
            return max_id['_id']
        else:
            return 0

    def register_user(self, username, email, password):
        max_id = self.get_max_user_id()
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
            return True, session
        else:
            return False, session

    def get_user_by_id(self, user_id):
        user_data = self.collection.find_one({"_id": user_id})
        if user_data:
            return {
                "_id": str(user_data['_id']),
                "username": user_data['username'],
                "email": user_data['email'],
                "password": user_data['password']
            }
        else:
            return None

    def save_canvas_data(self, user_id, canvas_name, canvas_data):
        data = {
            'user_id': user_id,
            'canvas_name': canvas_name,
            'canvas_data': canvas_data,
        }
        self.canvas_collection.delete_many({'user_id': user_id})
        existing_document = self.canvas_collection.find_one(data)

        if not existing_document:
            print(f"Adding new canvas {canvas_name} to the collection...")
            result = self.canvas_collection.insert_one(data)
            return result.inserted_id

        print(f"Canvas data for user {user_id}, canvas {canvas_name}, and data already exists. Ignoring...")
        return None

    def get_canvas_data_by_user_id(self, user_id):
        try:
            # Remove records with empty canvas data (if necessary)
            empty_canvas_data_records = self.canvas_collection.find({'canvas_data': None})
            for record in empty_canvas_data_records:
                self.canvas_collection.delete_one({'_id': record['_id']})
        except Exception as e:
            # Handle the exception more gracefully (log it)
            logging.error(f"Error while removing empty canvas data records: {str(e)}")
        try:
            # Retrieve documents related to canvas data and user ID
            cursor = self.canvas_collection.find({'user_id': user_id, 'canvas_data': {'$ne': None}})
            return [doc for doc in cursor]
        except Exception as e:
            # Handle the exception more gracefully (log it)
            logging.error(f"Error while retrieving canvas data by user ID: {str(e)}")
            return []
