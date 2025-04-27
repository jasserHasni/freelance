#!/bin/bash


# Give permission for everything in the Express app directory
sudo chmod -R 777 /home/ubuntu/E-learning

# Navigate into the working directory where we have all our GitHub files
cd /home/ubuntu/E-learning

sudo npm i dotenv

sudo node server1.js 

until curl -s --fail http://localhost:80; do
  sleep 5
done

touch /home/ubuntu/E-learning/done.txt