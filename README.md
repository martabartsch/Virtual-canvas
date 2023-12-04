# Virtual canvas

Web application where you can draw whatever you want and save your creation locally or on your computer.
<br>

### Tech Stack

- Python 3.9
- Flask
- MongoDB
- HTML5 + CSS3
- JavaScript
- Docker-compose

## Installation

### Init in Ubuntu
```bash
sudo apt-get install docker docker-compose
git clone https://gitlab.com/martaa2b/virtual-canvas.git
```
### First configuration
1. Create **venv** with **python 3.9** in repository directory and activate it.
```shell
python3  -m venv venv
source venv/bin/activate
```

2. Install all requirements using below command (you can run it from this place):
```shell
pip3 install -r requirements.txt
```

3. To property install application in your environment you need first define all environmental values required by `docker-compose` configuration file:

- MONGO_LOGIN - your mongo login name
- MONGO_PASSWORD - your mongo password
- MONGOEXPRESS_LOGIN - your mongo login name
- MONGOEXPRESS_PASSWORD - your mongo password
- secret_key - your secret key for Flask (this can be a random string).

### Run
To run this application use below command ( you have to be in backend directory ):

```shell
python3 app.py
```

Then you can safely start application in main directory by command bellow:
```shell
docker-compose up
```
<br>
<br>