**DO NOT USE THIS WITH A REAL DATABASE**

## Intro
MongoDB-HoneyProxy was created in response to the ['MongoDB Apocalypse'](https://www.bleepingcomputer.com/news/security/mongodb-apocalypse-is-here-as-ransom-attacks-hit-10-000-servers/)

## Pre-requisites:
  * `sudo apt-get install nodejs npm gcc g++`
  * You'll also need to install MongoDB for this to function, as this project works as a logging proxy.


## Setup

* Create a MongoDB database. Some good dummy data can be found [here](https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json). Another good tool is [JSON Generator](http://www.json-generator.com/), which generates fake json that can then be converted to bson.
* Then, install the project
~~~~
git clone https://github.com/Plazmaz/MongoDB-HoneyProxy.git
cd MongoDB-HoneyProxy
npm install
~~~~
* To run the project, simply use `node index.js`


## Docker version

If you want to have a Docker version of that, you can run the following programs:

1) Build a docker image:

```
docker build --tag="changeme" .
```
2) Run a docker image:

```
docker run -d -p 27017:27017 --name="changeme" changeme
```

If you want to get inside of the container run this:
```
docker exec -it changeme bash
```
