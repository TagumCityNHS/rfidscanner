@echo off

echo Starting Notification application...
start cmd /k "cd /d C:\RFID-System\ && node notifications/notificationQueue.js"

echo Starting Messenger application...
start cmd /k "cd /d C:\RFID-System\ && node msgr.js"

sleep 3s 
echo Starting ngrok...
start cmd /k "ngrok http --domain=gannet-key-daily.ngrok-free.app 4000"

echo Starting Electron application...
start cmd /k "cd /d C:\RFID-System\ && electron main.js"

echo Starting Node.js application...
start cmd /k "cd /d C:\RFID-System\ && node app.js"


exit