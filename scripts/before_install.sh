#!/bin/bash



# Source NVM and install the latest version of Node.js
echo "Installing Node.js..."

sudo apt update
sudo apt install node
sudo apt install npm
sudo npm i 

# Create the working directory if it doesn't exist
DIR="/home/ubuntu/E-learning"
if [ -d "$DIR" ]; then
  echo "${DIR} exists"
else
  echo "Creating ${DIR} directory..."
  mkdir -p ${DIR}
fi
