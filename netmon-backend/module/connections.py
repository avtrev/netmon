import subprocess
import json
from flask_socketio import emit
from time import sleep

# local imports
import module.mongo as mongo
import module.nslookup as ns

# variables
sessionServiceSet = set()  # not currently used


def loadMasterServiceSet():
    dataSet = set()
    allData = mongo.db["connections"].find()
    mongo.client.close()
    for data in allData:
        service = data["service"]
        remoteip = data["remoteip"]
        dataSet.add((service, remoteip))
        # print("masterServiceSet added " + service + " " + remoteip)
    print("LOADED MASTER SERVICE SET")
    return dataSet


masterServiceSet = set(loadMasterServiceSet())


def getConnections():
    lsof = subprocess.getoutput(
        'lsof -nP +c30 | grep -i established | awk \'{print $1","$3","$5","$9}\''
    )
    lines = lsof.split("\n")
    data = []
    for line in lines:
        la = line.split(",")
        service = la[0]
        user = la[1]
        ipv = la[2]
        localip = None
        localport = None
        remoteip = None
        remoteport = None

        if ipv.lower() == "ipv4" or (
            ipv.lower() == "ipv6" and line.__contains__("127.0.0.1")
        ):
            localip = la[3].split("->")[0].split(":")[0]
            localport = la[3].split("->")[0].split(":")[1]
            remoteip = la[3].split("->")[1].split(":")[0]
            remoteport = la[3].split("->")[1].split(":")[1]
            ns.addSingle(remoteip)
        elif ipv.lower() == "ipv6":
            localip = la[3].split("->")[0].split("]:")[0].replace("[", "")
            localport = la[3].split("->")[0].split("]:")[1]
            remoteip = la[3].split("->")[1].split("]:")[0].replace("[", "")
            remoteport = la[3].split("->")[1].split("]:")[1]
        data.append(
            {
                "service": service,
                "user": user,
                "ipv": ipv,
                "localip": localip,
                "localport": localport,
                "remoteip": remoteip,
                "remoteport": remoteport,
            }
        )
        # add to services database collection
        if not ((service, remoteip) in masterServiceSet):
            mongo.db["connections"].insert_one(
                {
                    "service": service,
                    "user": user,
                    "ipv": ipv,
                    "localip": localip,
                    "localport": localport,
                    "remoteip": remoteip,
                    "remoteport": remoteport,
                }
            )

        # add service name to serviceSet
        masterServiceSet.add((service, remoteip))
    return data


def loadMasterConnectionsDb():
    allData = (
        mongo.db["connections"]
        .find({}, {"_id": 0})
        .sort([("service", 1), ("remoteip", 1)])
    )
    outputData = []
    # print("PRINTING DATA")
    for data in allData:
        outputData.append(
            {
                "service": data["service"],
                "user": data["user"],
                "ipv": data["ipv"],
                "localip": data["localip"],
                "localport": data["localport"],
                "remoteip": data["remoteip"],
                "remoteport": data["remoteport"],
            }
        )
        # print(data)
    return list(outputData)


# boolean var for
listenTrue = False


def updateConnections():
    emit(
        "connections",
        json.dumps(
            {"mainData": getConnections(), "masterData": loadMasterConnectionsDb()}
        ),
    )


def loopUpdate(data):
    cnt = 0
    print("starting loop")
    print(f"listenTrue = {listenTrue}")
    while listenTrue:
        cnt += 1
        updateConnections()
        print(f"connections loop count = {cnt}")
        sleep(data["loopInterval"])


def handle_connections(data):
    data = json.loads(data)
    global listenTrue
    listenTrue = data["listenTrue"]
    print(f"listenTrue = {listenTrue}")
    print(data)
    if listenTrue:
        loopUpdate(data)
    else:
        updateConnections()
    mongo.client.close()  # close mongo connections
