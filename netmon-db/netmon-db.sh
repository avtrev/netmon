touch log/mongod.log
mongod --config mongod.conf -v |
while read i;
do echo $i | tee -a log/mongod.log;
done;