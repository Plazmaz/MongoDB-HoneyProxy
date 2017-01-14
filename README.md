**DO NOT USE THIS WITH A REAL DATABASE**

## Intro
MongoDB-HoneyProxy was created in response to the ['MongoDB Apocolypse'](https://www.bleepingcomputer.com/news/security/mongodb-apocalypse-is-here-as-ransom-attacks-hit-10-000-servers/)

## Pre-requisites:
  * `sudo apt-get install nodejs npm gcc`
  * You'll also need to install MongoDB for this to function, as this project works as a logging proxy.

## Setup
* Create a MongoDB database. Some good dummy data can be found [here](https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json).
* Then, install the project
~~~~
git clone https://github.com/Plazmaz/MongoDB-HoneyProxy.git`
cd MongoDB-HoneyProxy
sudo npm install
~~~~
* To run the project, simply use `npm start` or `node index.js`
