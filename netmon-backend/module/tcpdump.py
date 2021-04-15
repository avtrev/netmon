import subprocess
from flask_socketio import emit
import json
import os
import signal
import psutil
from time import sleep
import time

# local imports
import module.mongo as mongo
import module.nslookup as ns


masterIpSet = set()


def loadMasterIpSet():
    allData = mongo.db["ips"].find()
    mongo.client.close()
    for data in allData:
        remoteip = data["remoteip"]
        masterIpSet.add((remoteip))
        # print("masterServiceSet added " + service + " " + remoteip)
    print("LOADED MASTER IP SET")


loadMasterIpSet()


dumpTrue = False
ip = subprocess.getoutput("ifconfig en0 | grep 'inet ' | awk '{print $2}'")
dumppid = None
childProc = []
# child process handler
def handleChildProc(proc, cnt):
    print(f"PROCESS ID = {proc.pid}")
    start = time.time()
    while len(psutil.Process(proc.pid).children(recursive=True)) != cnt:
        print(
            f"child process ready = {len(psutil.Process(proc.pid).children(recursive=True)) == cnt}"
        )
    end = time.time() - start
    print(f"duration = {end}")

    for child in psutil.Process(proc.pid).children(recursive=True):
        childProc.append(child)
        if child.name() == "tcpdump":
            dumppid = child.pid
    print(f"DUMP PID = {dumppid}")


# tcpdump event handler
def handle_tcpdump(data):
    emit("tcpdump", {"state": data["dumpTrue"]})
    print(data["dumpTrue"])
    dumpTrue = data["dumpTrue"]

    if dumpTrue == True:
        global dumppid
        global childProc
        childProc = []
        dumppid = None
        if data["unfiltered"] == True:
            command = "tcpdump -i en0 -qntl"
            proc = subprocess.Popen(["bash", "-c", command], stdout=subprocess.PIPE)

            print(f"PROCESS ID = {proc.pid}")
            dumppid = proc.pid
            print(f"DUMP PID = {dumppid}")

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
            proc = subprocess.Popen(["bash", "-c", command], stdout=subprocess.PIPE)

            print(f"PROCESS ID = {proc.pid}")
            start = time.time()
            while len(psutil.Process(proc.pid).children(recursive=True)) != 2:
                print(
                    f"child process ready = {len(psutil.Process(proc.pid).children(recursive=True)) == 2}"
                )
            end = time.time() - start
            print(f"duration = {end}")

            for child in psutil.Process(proc.pid).children(recursive=True):
                childProc.append(child)
                if child.name() == "tcpdump":
                    dumppid = child.pid
            print(f"DUMP PID = {dumppid}")

            while dumpTrue:
                line = proc.stdout.readline().decode("utf-8").strip()
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

                # add to ips database collection
                if remoteip != None and not ((remoteip) in masterIpSet):
                    mongo.db["ips"].insert_one(
                        {
                            "remoteip": remoteip,
                            "remoteport": remoteport,
                            "localip": localip,
                            "localport": localport,
                        }
                    )
                    mongo.client.close()
                    masterIpSet.add((remoteip))  # add to master  ip set
                    ns.addSingle(remoteip)  # add to nslookup
                    emit("updateMasterIpDb", loadMasterIpsDb())
            print("while loop ended")

    else:
        print(f"PROCESS PID = {str(dumppid)}")
        if len(childProc):
            for child in childProc:
                print(f"proc name = {child.name()} pid = {child.pid}")
                os.kill(child.pid, signal.SIGTERM)
            print("tcpdump terminated")
        else:
            print(f"killed pid = {dumppid}")
            os.kill(dumppid, signal.SIGTERM)


# updateMasterIpDb event handler
def handle_updateMasterIpDb():
    emit("updateMasterIpDb", loadMasterIpsDb())


def loadMasterIpsDb():
    dbData = list(mongo.db["ips"].find({}, {"_id": 0}).sort([("remoteip", 1)]))
    mongo.client.close()

    return dbData