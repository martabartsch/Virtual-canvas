from datetime import timedelta
from functools import wraps

from flask import Flask, render_template, request, redirect, url_for, session, send_file, make_response, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, UserMixin
from user.database import UserDatabase
from dotenv import load_dotenv
import os

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

login_manager = LoginManager(app)
login_manager.login_view = 'login_user'

load_dotenv()

app.secret_key = os.getenv('secret_key')
app.permanent_session_lifetime = timedelta(minutes=60)

user_db = UserDatabase()


@login_manager.user_loader
def load_user(user_id):
    user = user_db.get_user_by_id(int(user_id))
    print(f"Loaded user: {user}")
    return user


def login_required(test):
    @wraps(test)
    def wrap(*args, **kwargs):
        if 'user_id' in request.cookies:
            return test(*args, **kwargs)
        else:
            return redirect(url_for('login_user'))

    return wrap


@app.route('/')
@login_required
def home():
    user_id = session.get('user_id')
    username = session.get('username')

    if user_id:
        return render_template('canvas_base.html', username=username, user_id=user_id)

    return render_template('canvas_base.html', username=username, user_id=user_id)


@app.route('/login', methods=['GET', 'POST'])
def login_user():
    if request.method == 'POST':
        session.permanent = True
        username = request.form['username']
        password = request.form['password']
        success, user_session = user_db.login_user(username, password)
        if success is False:
            return render_template('login.html', error='Username or password is incorrect')
        else:
            user_id = user_session['user_id']
            user = user_db.get_user_by_id(user_id)

            # Set canvas_data in the session
            session['user_id'] = user_id
            session['username'] = user['username']

            # Create a response object and set a cookie
            response = make_response(redirect(url_for('home')))
            response.set_cookie('user_id', str(user_id))
            response.set_cookie('username', user['username'])

            return response
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    # Wyczyść sesję Flask i dane specyficzne dla użytkownika
    session.pop('user_id', None)
    session.pop('username', None)

    return redirect(url_for('login_user'))


@app.route('/save-canvas-data', methods=['POST'])
def save_canvas_data():
    try:
        data = request.json
        canvas_data = data.get('canvasData')
        print(canvas_data)

        if 'user_id' in session:
            user_id = session['user_id']
            user_db.save_canvas_data(user_id, canvas_data)

            return jsonify({'message': 'Canvas data saved successfully'})
        else:
            return jsonify({'error': 'User not logged in'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/load-canvas-data', methods=['GET'])
def load_canvas_data():
    try:
        user_id = session.get('user_id')
        if user_id:
            canvas_data_documents = user_db.get_canvas_data_by_user_id(user_id)

            if canvas_data_documents:
                canvas_data = [data['canvas_data'] for data in canvas_data_documents]
                return jsonify({'canvasData': canvas_data})
            else:
                return jsonify({'canvasData': None})
        else:
            return jsonify({'error': 'User not authenticated'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/register', methods=['GET', 'POST'])
def register_user():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        result = user_db.register_user(username, email, password)
        print(result)
        if result == 'ERROR':
            return render_template('register.html', error='Email already exists')
        else:
            return redirect(url_for('login_user'))

    return render_template('register.html')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8085)
