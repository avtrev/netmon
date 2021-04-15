import subprocess


def getOpenports():
    tcp = subprocess.getoutput(
        'lsof -i -P -n | grep -E "(TCP.*LISTEN)" | awk \'{print $1,$3,$5,$8,$9}\' | awk \'{split($5,a,":"); print $1,$2,$3,$4,a[length(a)]}\' | awk \'{print $1","$2","$3","$4","$5}\''
    )
    udp = subprocess.getoutput(
        'lsof -i -P -n | grep UDP | awk \'{print $1,$3,$5,$8,$9}\' | awk \'{split($5,a,":"); print $1,$2,$3,$4,a[length(a)]}\' | awk \'{print $1","$2","$3","$4","$5}\''
    )

    def loadObjectArray(ouput):
        array = ouput.split("\n")
        objArray = []
        for i in array:
            entry = i.split(",")
            objArray.append(
                {
                    "service": entry[0],
                    "user": entry[1],
                    "ipv": entry[2],
                    "proto": entry[3],
                    "port": entry[4],
                }
            )
        return objArray

    tcpObjArray = loadObjectArray(tcp)
    udpObjArray = loadObjectArray(udp)
    data = {"tcp": tcpObjArray, "udp": udpObjArray}
    print(data)
    return data