#!/bin/bash

cd ./netmon-db
bash ./netmon-db.sh &
cd ../netmon-backend
bash ./netmon-backend.sh &
cd ../
npm start
