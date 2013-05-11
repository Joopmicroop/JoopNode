// $ node ./WebServer.js [port] 
// [port] : Number (default : 1337)

console.log('      _____                                   ');
console.log('     (, /                  ,                  ');
console.log('       /  ________  ___      _  __  ________  ');
console.log('   ___/__(_)(_) /_)_// (__(_(__/ (_(_)(_) /_)_');
console.log(' /   /       .-/                       .-/    ');
console.log('(__ /       (_/                       (_/     ');
console.log('------------------WEBSERVER 2013--------------');
//console.log('CTRL + C to shutdown'.red);

// Set require files
var http      = require("http"),
    httpProxy = require('http-proxy'),
    open      = require('open'),
    util      = require('util'),
    colors    = require('colors'),
    url       = require("url"),
    path      = require("path"),
    fs        = require("fs"),
    e         = require("events"),
    spawn     = require('child_process').spawn;
// Set vars
var port        = 1337,
    serverpath  = "./";

// if WebServer.js is located in a directory called 'Servers'
// then serve files out of parent directory
// else use the current working directory
var currDirName = /[^/]*$/.exec(process.cwd())[0];
if(currDirName == "Servers"){
  try{
    process.chdir( process.cwd() + "/../" );
    serverpath = "./Servers/";
  }catch (err) { console.log('chdir: '+err ); }
}
console.log("Log File Location at: ".green + serverpath.blue +"logs.json".blue);
console.log( "Serving files out of: ".green + (process.cwd()).blue );

// process argv arguments
process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val); // for debugging
  switch (index){
    case 2: // [port] : Number (default : 1337)
      port = process.argv[index];
    break;
  }
});

// process execArgv arguments
if(process.execArgv)
  process.execArgv.forEach(function (val, index, array){
    switch(index){
      case 0:
        if(val == "--debug-brk" || val == "--debug"){
          // spawn a child process of node-inspector
          // node-inspector can be installed from bash by
          // $ sudo npm install -g node-inspector
          var inspector   = spawn('node-inspector'); 
          console.log('node-inspector child process started.'.green);
          inspector.stdout.on('data', function (data) {
            console.log('node-inspector --> '.green + data.toString().blue);
            //open('http://0.0.0.0:8080/debug?port='+process.debugPort.toString());
          });

          inspector.stderr.on('data', function (data) {
            console.log('Debug-Inspector !!> : '.red + data.toString().red);
          });

          inspector.on('close', function (code) {
            console.log('Debug-Inspector process exited with code '.green + code.toString().red);
          });
        } 
      break;
    }
  });

var webServer = http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname
    , filename = path.join( process.cwd(), uri );

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };
  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      appendToLog({"errorCode":404, "file":uri, "msg":"File not found."});
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += 'index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write("500 " + err + "\n");
        response.end();
        appendToLog({"errorCode":500, "file":uri, "msg":err});
        return;
      }
      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
      appendToLog({"errorCode":200, "file":uri, "msg":"response send"})
    });
  });
}).listen(parseInt(port, 10));
console.log("WebServer running at: ".green + "http://127.0.0.1:".blue + port.toString().red + "/");
open('http://127.0.0.1:'+port.toString()); // opens browser window (mac)


appendToLog=function(msgObj){
  var now = new Date();
  msgObj.date = now.toJSON();
  var dateAndFile = now.toString().yellow +" "+ (msgObj.file).toString().blue +"\n";
  if(msgObj.errorCode > 400) console.log( dateAndFile +" "+ (msgObj.errorCode).toString().red + " => " + (msgObj.msg).toString().red );
  else console.log( dateAndFile +" "+ (msgObj.errorCode).toString().green + " => " + (msgObj.msg).toString().green );
  fs.appendFile(serverpath+'logs.json', JSON.stringify(msgObj)+", \n", function (error) {
    if(error){ console.log("appendToLog() error: ".red + error.toString().red) }
  });
}
