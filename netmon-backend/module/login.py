import hashlib
import os
import json
from flask_socketio import emit

users = {
    "admin": {
        "salt": b"S\xde}U\xb3i\xbf\xc5b\xc7\x00/H]\xeb\xa4@\ntZI/z/\xc5\xf5/\xa9w+\x13\x11",
        "key": b"\x06z91\xff\xa0\xa3|/z3\x12M\x06{lF\x98\xdd*\x81e\xca=R\xd0\r\xf4\xe6\xd7\xdc\x99\xe6\x013\x18\x16\x92\xae&\x8e\x9fD\xe6\xcf\x0c\xea\xce(\x02\xc9k=^vYs45\xab\x98\xa1\xa7;\x03q\xd3L\x90`\\\x84\x8dP\xc6;<8>\n\xd5\xb9\x9b\x1b3\x10\x82\x02\xb3\x0e\xc2g\xac\xe4\xc5E_\x83w\xcew\xc8\x12\xa6$ii\x0b\xe6\x04\xd8\x16-\x1fVV\xc2\xc8E\x16{*\xa7\x84\xb3\x0c\x1e\xba",
    }
}


def addUser(username, password):
    salt = os.urandom(32)  # rembember this
    key = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, 100000, dklen=128
    )

    users[username] = {"salt": salt, "key": key}


def checkUserPass(username, pass_to_check):
    if not users[username]:
        return False
    salt = users[username]["salt"]
    key = users[username]["key"]

    new_key = hashlib.pbkdf2_hmac(
        "sha256", pass_to_check.encode("utf-8"), salt, 100000, dklen=128
    )

    if new_key == key:
        print(f"{username} password match")
        return True
    else:
        print(f"{username} password failed")
        return False


def handle_login(data):
    print(data)
    data = json.loads(data)
    username = data["username"]
    password = data["password"]
    match = checkUserPass(username, password)
    emit("login", json.dumps(match))
