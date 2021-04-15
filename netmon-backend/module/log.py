import json
from flask_socketio import emit

# local imports
import module.mongo as mongo


def getMasterLog():
    dbData = list(
        mongo.db["ips"].aggregate(
            [
                {
                    "$lookup": {
                        "from": "connections",
                        "localField": "remoteip",
                        "foreignField": "remoteip",
                        "as": "connections",
                    }
                },
                {
                    "$lookup": {
                        "from": "domains",
                        "localField": "remoteip",
                        "foreignField": "remoteip",
                        "as": "domains",
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "remoteip": 1,
                        "remoteport": 1,
                        "service": {
                            "$ifNull": [
                                {"$arrayElemAt": ["$connections.service", 0]},
                                "N/A",
                            ]
                        },
                        "user": {
                            "$ifNull": [
                                {"$arrayElemAt": ["$connections.user", 0]},
                                "N/A",
                            ]
                        },
                        "dns": {
                            "$ifNull": [{"$arrayElemAt": ["$domains.dns", 0]}, "N/A"]
                        },
                    }
                },
                {"$sort": {"remoteip": 1}},
            ]
        )
    )
    mongo.client.close()
    emit("log", json.dumps({"tableType": "master", "tableData": dbData}))


def getIpLog():
    dbData = list(mongo.db["ips"].find({}, {"_id": 0}).sort("remoteip", 1))
    mongo.client.close()
    emit(
        "log",
        json.dumps(
            {
                "tableType": "ips",
                "tableData": dbData,
            }
        ),
    )


def getConnectionsLog():
    dbData = list(mongo.db["connections"].find({}, {"_id": 0}).sort("remoteip", 1))
    mongo.client.close()
    emit(
        "log",
        json.dumps(
            {
                "tableType": "connections",
                "tableData": dbData,
            }
        ),
    )


def getDomainsLog():
    dbData = list(mongo.db["domains"].find({}, {"_id": 0}).sort("remoteip", 1))
    mongo.client.close()
    emit(
        "log",
        json.dumps(
            {
                "tableType": "domains",
                "tableData": dbData,
            }
        ),
    )


def handle_getLog(data):
    data = json.loads(data)
    tableType = data["tableType"]
    print(f"{tableType} request")
    if tableType == "master":
        getMasterLog()
    if tableType == "ips":
        getIpLog()
    if tableType == "connections":
        getConnectionsLog()
    if tableType == "domains":
        getDomainsLog()