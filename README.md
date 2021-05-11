# Netmon

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.1.0.

This project is a work in progress and is still in the development stage.
The netmon repo is for code example purposes.
The repo does not contain all the files needed to execute the application.
This application is for MacOs

# Description

This application acts as a host network monitor utility as well as displays useful network information.

Application Parts:

  netinfo
  
    - displays local host info [ hostname|macAddress|ipv4|ipv6|broadcast|wan ]

  openports
  
    - displays open TCP/UDP ports and which services they belong to

  connections
  
    - displays current running services that have established connections

    - displays [ service|user|ipVersion|localIp|localPort|remoteIp|remotePort ]

    - searchable

  packets
  
    - uses tcpdump to display packet traffic

    - option 1: displays realtime packet dump raw output

    - option 2: displays realtime incoming packets in table form

  hostscan
  
    - scans the local network for host

    - resolves hostname (not in all cases)

    - displays [ ip|macAddress|hostname ]

  log
  
    - displays information on past host network activity, collected and dumped into the database

    - displays in table form

    - searchable

# Stack

Angular | Python | Flask | SocketIO | Mongodb

# FrontEnd Location

netmon/src/app/

Angular component files:

netmon/src/app/view/

# BackEnd Location

netmon/netmon-backend/

Main Python server file:

netmon/netmon-backend/

- netmon_backend_server.py

Module Files:

netmon/netmon-backend/module/

- connections.py
- hostscan.py
- log.py
- login.py
- mongo.py
- netinfo.py
- nslookup.py
- openports.py
- tcpdump.py






