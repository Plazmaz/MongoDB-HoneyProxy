var net = require('net');
var ref = require('ref')
var fs = require('fs');
var BSON = require('bson');
var parseArgs = require('minimist')
var bson = new BSON();
var args = parseArgs(process.argv);
process.on('uncaughtException', function (err) {
  console.log("Client triggered an error.");
  console.log(err.message);
})

if(args.h || args.help) {
	console.log("Help:");
	console.log("--address, -a: The ip of the dummy mongodb instance");
	console.log("			    Default: 127.0.0.1");
	console.log("--port, -p:    The port of the dummy mongodb instance");
	console.log("			    Default: 27017");
	console.log("-l, --listen:  The port to listen on");
	console.log("			    Default: 27016");
	console.log("-o, --out:     The file to output logs to");
	console.log("			    Default: proxy.log");
	console.log("-h, --help:	Displays this message and returns");
	process.exit()
}

const EXTERNAL_PORT = args.listen || args.l || 27016;
const MONGODB_HOST = args.address || args.a || "127.0.0.1"
const MONGODB_PORT = args.port || args.p || 27017;
const LOG_FILE = args.out || args.o || "proxy.log";

//A really hacky logging method.
var oldLog = console.log;
console.log = function(data) {
	fs.appendFile(LOG_FILE, "[" + new Date().toISOString() + "] " + data + "\r\n");
	oldLog("[" + new Date().toISOString() + "] " + data)
}

var server = net.createServer(function (socket) {
	var clientID = socket.remoteAddress + ":" + socket.remotePort;
	var tag = "[" + clientID + "] ";
	console.log(clientID + " connected.")
    socket.on('data', function (msg) {
        //console.log('<< From client to proxy ', msg.toString());
        var serviceSocket = new net.Socket();
		console.log(clientID + " -> Server:");
		parseMessage(msg)
        serviceSocket.connect(MONGODB_PORT, MONGODB_HOST, function () {
            serviceSocket.write(msg);
        });
        serviceSocket.on("data", function (data) {
            //console.log('<< From remote to proxy', data.toString());
			console.log("Server -> " + clientID + ":");
			parseMessage(data);
            socket.write(data);
            //console.log('>> From proxy to client', data.toString());
        });
    });
});
server.listen(EXTERNAL_PORT);
console.log("Proxy listening on " + EXTERNAL_PORT + ".");


var offset = 0;
function parseMessage(data) {
	offset = 0;
	var header = new MsgHeader(data);
	//Only opcodes 2004(QUERY) and 1(REPLY) are currently implemented.
	//Though there are other opcodes, these are not used as frequently.
	//This should cover a decent amount of data.
	switch(header.opCode) {
		case 2004:
			console.log(new OpQuery(data).toString());
			break;
		case 1:
			console.log(new OpReply(data).toString());
		default:
			console.log("Unimplemented opcode " + header.opCode)
			console.log("Raw packet data: " + data.toString())
			break;
	}
	
}

function OpReply(data) {
	this.flags = readInt32(data);
	this.cursorId = readInt64(data);
	this.startingFrom = readInt32(data);
	this.docCount = readInt32(data);
	var docs = [];
	bson.deserializeStream(data, offset, this.docCount, docs, 0);
	this.documents = docs;
	this.toString = function() {
		var result = "";
		if(this.flags > 0) {
			result += "Flags: " + this.flags + "\n";
		}
		if(this.documents.length > 0) {
			result += "Documents: " + JSON.stringify(this.documents) + "\n";
		}
		return result;
	}
}

function OpQuery(data) {
	this.flags = readInt32(data);
	this.collectionName = readCString(data);
	this.numToSkip = readInt32(data);
	this.numToReturn = readInt32(data);
	var returnCount = this.numToReturn;
	var docs = [];
	bson.deserializeStream(data, offset, 1, docs, this.numToSkip);
	this.query = docs;
	//We're not finished yet, which implies the optional returnFieldsSelector is set.
	if(offset < data.length) {
		var fields = [];
		bson.deserializeStream(data, offset, 1, fields, this.numToSkip);
		this.returnFieldsSelector = fields
	}
	this.toString = function() {
		var result = "";
		if(this.flags > 0) {
			result += "Flags: " + this.query + "\n";
		}
		if(this.query.length > 0) {
			result += "Query: " + JSON.stringify(this.query) + "\n";
		}
		if(this.returnFieldsSelector) {
			result += "Return Fields: " + JSON.stringify(this.returnFieldsSelector) + "\n";
		}
		return result;
	}
}

function readCString(data) {
	var cstring = ref.readCString(data, offset);
	console.log(cstring);
	offset += Buffer.byteLength(cstring, 'utf8') + 1;
	return cstring;
}

function parseQuery(data) {
}

function MsgHeader(data) {
	this.messageLength = readInt32(data);
	this.requestID = readInt32(data);
	this.responseTo = readInt32(data);
	this.opCode = readInt32(data);
}

function readBinary(stream) {
	var length = readInt32(stream);
	var binary = "";
	for(var i = 0; i < length; i++) {
		binary += stream[offset + i];
	}
	offset += length + 1;
	return binary;
}

function ObjectId(stream) {
	this.epoch = new Buffer(stream[offset++], stream[offset++], stream[offset++], stream[offset++])
	this.machineId = new Buffer(stream[offset++], stream[offset++], stream[offset++])
	this.processId = new Buffer(stream[offset++], stream[offset++])
	this.counter = new Buffer(stream[offset++], stream[offset++], stream[offset++])
	this.toString = function() {
		var buf = Buffer.concat([this.epoch, this.machineId, this.processId, this.counter]);
		return buf.toString('hex');
	}
}

function readDouble(stream) {
	var value = stream.readDoubleLE(offset);
	offset += 8;
	return value;	
}

function readByte(stream) {
	return stream[offset++];
}

function readInt32(data) {
	var value = data.readInt32LE(offset);
	offset += 4;
	return value;
}
function readInt64(data) {
	var value = ref.readInt64LE(data, offset);
	offset += 8;
	return value;
}