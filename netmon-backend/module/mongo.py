from pymongo import MongoClient
import yaml

# mongodb settup
config = yaml.load(open("database.yaml"), Loader=yaml.FullLoader)
client = MongoClient(
    config["uri"],
    tls=True,
    tlsAllowInvalidCertificates=True,
    tlsCertificateKeyFile="tls/server_cert_key.pem",
    # tlsCertificateKeyFile="tls/server.crt",
    # ssl_keyfile="tls/server.key",
    tlsCertificateKeyFilePassword="admin",
    tlsCAFile="tls/CA.pem",
    username="netmonadmin",
    password="admin",
    authSource="admin",
)
db = client["netmondb"]
