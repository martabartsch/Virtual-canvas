from flask import Flask, render_template, request, redirect, url_for
from user.database import UserDatabase
from dotenv import load_dotenv
import os

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

load_dotenv()
app.secret_key = os.getenv('secret_key')

user_db = UserDatabase()

@app.route('/')
def home():
    return render_template('canvas_base.html')


@app.route('/login', methods=['GET', 'POST'])
def login_user():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        result = user_db.login_user(username, password)
        if result is False:
            return render_template('login.html', error='Username or password is incorrect')
        else:
            return render_template('home.html')
    return render_template('login.html')


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
    app.run(debug=False, host='0.0.0.0', port=8085)
