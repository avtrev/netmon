from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send
import subprocess

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on("connect")
def test_connect():
    emit("connection event", "connected to socket server")
    print("new connection")


@socketio.on("disconnect")
def test_disconnect():
    print("Client disconnected")


@socketio.on("message")
def handle_my_custom_event(data):
    # emit("message", data["data"])
    for i in range(5):
        send(str(i) + " server response")
    print("received new message")


# tcpdump

dumpTrue = False
ip = subprocess.getoutput("ifconfig en0 | grep 'inet ' | awk '{print $2}'")


@socketio.on("tcpdump")
def handle_tcpdump(data):
    emit("tcpdump", {"state": data["dumpTrue"]})
    print(data["dumpTrue"])
    dumpTrue = data["dumpTrue"]

    if dumpTrue == True:
        if data["unfiltered"] == True:
            proc = subprocess.Popen(
                ["tcpdump", "-ien0", "-qntl"], stdout=subprocess.PIPE
            )
            while dumpTrue:
                line = proc.stdout.readline()
                if not line:
                    break
                output = line.decode("utf-8").strip()
                print(output)
                emit("tcpdump", {"output": output})
            print("while loop ended")
        elif data["incoming"]:
            print("incoming dump")
            command = (
                "tcpdump -i en0 ip -qntl dst host "
                + ip
                + " | while read i; do echo $i | awk '{print $2, $4}' | sed  -e 's|:$||' -e 's|\.|,|4' -e 's|\.|,|7' -e 's| |,|'; done"
            )

            cmd = subprocess.Popen(["bash", "-c", command], stdout=subprocess.PIPE)
            while dumpTrue:
                line = cmd.stdout.readline().decode("utf-8").strip()
                if not line:
                    break
                remoteip = None
                remoteport = None
                localip = None
                localport = None
                ls = []
                outputData = {}
                try:
                    ls = line.split(",")
                    remoteip = ls[0]
                    remoteport = ls[1]
                    localip = ls[2]
                    localport = ls[3]
                except:
                    print("out of bounds excepetion")
                    continue
                finally:
                    outputData = {
                        "remoteip": remoteip,
                        "remoteport": remoteport,
                        "localip": localip,
                        "localport": localport,
                    }
                print(outputData)
                emit("tcpdump", {"output": outputData})
            print("while loop ended")

    else:
        subprocess.Popen(("killall", "tcpdump"))
        print("tcpdump terminated")


if __name__ == "__main__":
    socketio.run(app)