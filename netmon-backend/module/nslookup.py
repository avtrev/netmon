import subprocess
from time import sleep
import json

# local imports
import module.mongo as mongo


def loadMasterNslookupSet():
    data = mongo.db["domains"].find({}, {"_id": 0, "remoteip": 1}).sort("remoteip")
    mongo.client.close()
    dataSet = set()
    for i in data:
        dataSet.add(i["remoteip"])
        i["remoteip"]
    # print(dataSet)
    print("LOADED MASTER NSLOOKUP SET")
    return dataSet


masterNslookupSet = set(loadMasterNslookupSet())


def getDomainName(ip="8.8.8.8"):
    nameServer = "1.1.1.1"
    nsLookup = f"nslookup {ip} {nameServer}"

    grepAwkSed = "| grep name | awk '{print $4 }' | sed 's/.$//'"
    command = f"{nsLookup} {grepAwkSed}"
    data = ""
    try:
        data = subprocess.getoutput(command)
        if not len(data) > 0:
            data = "N/A"
        # print(data)
    except Exception as e:
        print("EXCEPTION - NSLOOKUP getDomainName(ip)")
        print(e)
    finally:
        return data


def manualLoadNslookup():

    ipSet = set()
    connectionsData = mongo.db["ips"].find({}, {"_id": 0, "remoteip": 1})
    ipData = mongo.db["ips"].find({}, {"_id": 0, "remoteip": 1})

    for i in connectionsData:
        ipSet.add(i["remoteip"])
    for i in ipData:
        ipSet.add(i["remoteip"])

    ipList = []
    for i in ipSet:
        ipList.append(i)

    ipList.sort()

    for i in ipList:
        ip = i
        if not masterNslookupSet.__contains__(ip):
            dns = getDomainName(ip)
            dnsArray = dns.strip().split("\n")
            mongo.db["domains"].insert_one({"remoteip": ip, "dns": dnsArray})
            masterNslookupSet.add(ip)
            print(f"{ip} {dnsArray}")
            sleep(0.5)
        else:
            print(f"ENTRY EXISTS FOR {ip}")


def addSingle(ip):
    if not ip.__contains__("127.0.0.1"):
        if not masterNslookupSet.__contains__(ip):
            dns = getDomainName(ip)
            dnsArray = dns.strip().split("\n")
            mongo.db["domains"].insert_one({"remoteip": ip, "dns": dnsArray})
            mongo.client.close()
            masterNslookupSet.add(ip)
            print(f"{ip} {dnsArray}")
        # else:
        #     print(f"domain entry exits for {ip}")


if __name__ == "__main__":
    getDomainName()