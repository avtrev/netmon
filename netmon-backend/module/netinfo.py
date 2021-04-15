import subprocess


def getNetinfo():
    host = subprocess.getoutput("echo $HOSTNAME")
    ether = subprocess.getoutput("ifconfig en0 | grep ether | awk '{print $2}'")
    ipv4 = subprocess.getoutput("ifconfig en0 | grep \"inet \" | awk '{print $2}'")
    ipv6 = subprocess.getoutput(
        "ifconfig en0 | grep inet6 | awk '{print $2}' | sed s/$'%en0'//"
    ).split("\n")
    broadcast = subprocess.getoutput("ifconfig en0 | grep 'inet ' | awk '{print $6}'")
    wan = subprocess.getoutput("curl --silent ifconfig.me")
    # data = [
    #     {"host": host},
    #     {"ether": ether},
    #     {"ipv4": ipv4},
    #     {"ipv6": ipv6},
    #     {"broadcast": broadcast},
    # ]
    data = []
    data.append({"host": host})
    data.append({"ether": ether})
    data.append({"ipv4": ipv4})
    for i, v in enumerate(ipv6, start=1):
        data.append({"ipv6": v})
    data.append({"broadcast": broadcast})
    data.append({"wan": wan})
    return data