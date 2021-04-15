import subprocess
from flask_socketio import emit
import re
import json

ipexp = re.compile(
    r"(?<![-\.\d])(?:0{0,2}?[0-9]\.|1\d?\d?\.|2[0-5]?[0-5]?\.){3}(?:0{0,2}?[0-9]|1\d?\d?|2[0-5]?[0-5]?)(?![\.\d])"
)

subnet = subprocess.getoutput(
    "ifconfig en0 | grep 'inet ' | awk '{print $2}' | grep -oE '\\b([0-9]{1,3}\.){3}\\b'"
)


def pingAll():
    emit(
        "scanstatus",
        json.dumps(
            {
                "status": "ping scan subnet",
                "pingscan": True,
            }
        ),
    )
    cnt = 0
    total = 256
    for i in range(0, 256):
        cnt += 1
        percent = (cnt * 100) / total
        print(f"percent = {percent}")
        try:

            ping = subprocess.Popen(
                ["bash", "-c", "ping -t1 -W20 -o -c1 -i0.1 -s8 " + subnet + str(i)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            out, err = ping.communicate()
            if err:
                print(err)
                input("stderr - enter to continue")
                continue
            emit(
                "scanstatus",
                json.dumps({"output": out.decode("utf-8").strip(), "percent": percent}),
            )
            if ping.returncode == 0:
                searchString = out.decode("utf-8").strip()
                results = ipexp.findall(searchString)
                if len(results):
                    emit("scanstatus", json.dumps({"newHost": results[0]}))

            print("returncode = " + str(ping.returncode))
            print(out.decode("utf-8").strip())
        except Exception as e:
            print(e)
            input("Exception - enter to continue")

    emit(
        "scanstatus",
        json.dumps(
            {
                "status": "resolving hostnames",
                "pingscan": False,
            }
        ),
    )
    print("PING DONE")


ipMacCmd = "arp -an -i en0 | grep -iv incomplete | awk '{print $2,$4}'| tr -d \(\) | awk '{print $1\",\"$2}'"

resolveHostCmd = "{ for i in $(arp -an -i en0 | grep -v incomplete | grep -oE '\\b([0-9]{1,3}\.){3}[0-9]{1,3}\\b'); do nslookup -type=PTR -timeout=1 -retry=0 -port=5353 $i 224.0.0.251; done; } | while read i; do echo $i | grep -iE  '(name|out)' | awk '{print $4}' | sed 's/.$//' | sed 's/out/na/' | awk '{print $1 }'; done "


def getData():
    data = []
    try:
        ipMac = subprocess.Popen(
            ["bash", "-c", ipMacCmd], stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        resHost = subprocess.Popen(
            ["bash", "-c", resolveHostCmd],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        while True:
            ipMacLine = ipMac.stdout.readline().decode("utf-8").strip()
            resHostLine = resHost.stdout.readline().decode("utf-8").strip()

            imError = ipMac.stderr.readline().decode("utf-8").strip()
            rhError = ipMac.stderr.readline().decode("utf-8").strip()

            if imError:
                print("ip mac error - imError")
                print(imError)
                input("enter to continue")
                break

            if rhError:
                print("resolve host error - rhError")
                print(rhError)
                input("enter to continue")
                break

            if not ipMacLine or not resHostLine:
                print("resolve loop ended")
                break

            ip = ipMacLine.split(",")[0]
            mac = ipMacLine.split(",")[1]
            hostname = resHostLine

            print(ip + " " + mac + " " + resHostLine)
            emit("scanstatus", json.dumps({"newHost": ip + " " + mac + " " + hostname}))
            # emit("scanstatus", {"output": hLine})
            data.append({"ip": ip, "mac": mac, "hostname": hostname})

    except Exception as e:
        print("ERROR IN getData() FUNCTION")
        if isinstance(e, subprocess.SubprocessError):
            print("SUBPROCESS ERROR")
            print(type(e))
            print(e)
            input("enter to continue")
        else:
            print(type(e))
            print(e)
            input("enter to continue")
    finally:
        return data


hostscanTrue = False


def handle_hostscan(data):
    data = json.loads(data)
    emit("hostscan", json.dumps({"state": data["hostscanTrue"]}))
    print("[SCAN STATE] = " + str(data["hostscanTrue"]))
    hostscanTrue = data["hostscanTrue"]
    pingAll()
    outputData = getData()
    hostscanTrue = False
    emit("hostscan", json.dumps({"state": hostscanTrue, "output": outputData}))
