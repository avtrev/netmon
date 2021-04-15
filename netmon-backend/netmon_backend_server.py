from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

import multiprocessing
import threading

# local imports
import module.netinfo as netinfo
import module.openports as openports
import module.connections as connections
import module.tcpdump as tcpdump
import module.hostscan as hostscan
import module.log as log

# import module.nslookup as ns

# from module.mongo import db

app = Flask(__name__)


app.config["JSON_SORT_KEYS"] = False

CORS(app)

# SOCKET IO CONFIG
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return "ROOT"


# NETINFO ###########################################################
@app.route("/netinfo", methods=["POST", "GET"])
def netinfo_route():
    if request.method == "GET":
        data = netinfo.getNetinfo()
        print(data)
        return jsonify(data)


# OPENPORTS ###########################################################
@app.route("/openports", methods=["POST", "GET"])
def openports_route():
    if request.method == "GET":
        data = openports.getOpenports()
        print("OPENPORTS DATA")
        print(data)
        return jsonify(data)


# CONNECTIONS ###########################################################


def connectionsProcess(data):
    p = multiprocessing.Process(target=connections.handle_connections(data))
    # t = threading.Thread(target=connections.handle_connections(data))
    p.start()
    # p.join()


socketio.on_event("connections", connectionsProcess)

# GET version flask route version
# @app.route("/connections", methods=["POST", "GET"])
# def connections_route():
#     if request.method == "GET":
#         data = connections.getConnections()
#         print("sending main connections")
#         return jsonify(data)

# GET version flask route version
# @app.route("/connections-master", methods=["GET"])
# def connectionsMaster_route():
#     if request.method == "GET":
# data = [{"service": "tempService", "user": "tempUser"}]
# data = connections.loadMasterConnectionsDb()
# print("sending master connections data")
# return jsonify(data)


# TCPDUMP ###########################################################
def tcpdumpProcess(data):
    p = multiprocessing.Process(target=tcpdump.handle_tcpdump(data))
    p.start()


socketio.on_event("tcpdump", tcpdumpProcess)  # module.tcpdump


# def updateMasterProcess():
#     p = multiprocessing.Process(target=tcpdump.handle_updateMasterIpDb)
#     p.start()


socketio.on_event("updateMasterIpDb", tcpdump.handle_updateMasterIpDb)  # module.tcpdump

# HOSTSCAN ###########################################################
def hostscanProcess(data):
    p = multiprocessing.Process(target=hostscan.handle_hostscan(data))
    p.start()


socketio.on_event("hostscan", hostscanProcess)  # module.hostscan

# LOG ###########################################################
def logProcess(data):
    p = multiprocessing.Process(target=log.handle_getLog(data))
    p.start()


socketio.on_event("log", logProcess)

# SOCKET IO ###########################################################
@socketio.on("connect")
def test_connect():
    emit("connection event", "connected to socket server")
    print("new connection")


@socketio.on("disconnect")
def test_disconnect():
    print("Client disconnected")


if __name__ == "__main__":

    app.debug = True
    context = ("tls/server.crt", "tls/server.key")
    # context = ("ssl/server.cert", "ssl/server.key")

    # working ssl https server
    socketio.run(app, host="127.0.0.1", port="5000", ssl_context=context)

    # app.run(host="127.0.0.1", port="5000")
    # socketio.run(app, ssl_context=("server.cert", "server.key"))
    # socketio.run(app, ssl_context=("cert.pem", "key.pem"))
    # app.run(ssl_context=("cert.pem", "key.pem"))
    # vsocketio.run(app, ssl_context="adhoc")