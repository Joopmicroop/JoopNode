// $ node ./WebServer.js [--port 1337] [--debug] 

// Set require files
var http      = require("http"),
    open      = require('open'),
    colors    = require('colors'),
    url       = require("url"),
    path      = require("path"),
    fs        = require("fs"),
    spawn     = require('child_process').spawn;
    
// Set vars
var port        = 1337,
    serverPath  = __dirname,
    servePath   = process.cwd()



// process argv arguments
if(process.argv){
  process.argv.forEach(function (v, i, a){
    if(v==='--port'){
      function invalidPort(){ console.log('invalid port assignment, use --port {number}'.red); process.exit(); }
      if(a[i+1]===undefined) invalidPort();
      var pmatch = a[i+1].match(/\d{4,5}/);
      if(pmatch===null) invalidPort(); else port = pmatch[0];
    }
  
    if(['--debug-brk', '--debug'].indexOf(v)!==-1){
      // spawn a child process of node-inspector
      // node-inspector can be installed from bash by
      // $ sudo npm install -g node-inspector
      var inspector = spawn('node-inspector'); 
      console.log('node-inspector child process started.'.green);
      inspector.stdout.on('data', function (data) {
        console.log('node-inspector --> '.green + data.toString());
        //open('http://0.0.0.0:8080/debug?port='+process.debugPort.toString());
      });
      inspector.stderr.on('data', function (data) { console.log('Debug-Inspector !!> : '.red + data.toString().red); });
      inspector.on('close', function (code) { console.log('Debug-Inspector process exited with code '.green + code.toString().red); });
    }
  });
}

appendToLog=function(msgObj){
  var now = new Date();
  msgObj.date = now.toJSON();
  var dateAndFile = now.toString().yellow +" "+ (msgObj.file).toString() +"\n";
  if(msgObj.code > 400) console.log( dateAndFile +" "+ (msgObj.code).toString().red + " => " + (msgObj.msg).toString().red );
  else console.log( dateAndFile +" "+ (msgObj.code).toString().green + " => " + (msgObj.msg).toString().green );
  fs.appendFile(serverPath+'logs.json', JSON.stringify(msgObj)+", \n", function (error) {
    if(error){ console.log("appendToLog() error: ".red + error.toString().red) }
  });
}

console.log('      _____                                   '.rainbow);
console.log('     (, /                  ,                  '.rainbow);
console.log('       /  ________  ___      _  __  ________  '.rainbow);
console.log('   ___/__(_)(_) /_)_// (__(_(__/ (_(_)(_) /_)_'.rainbow);
console.log(' /   /       .-/                       .-/    '.rainbow);
console.log('(__ /       (_/                       (_/     '.rainbow);
console.log('------------------WEBSERVER 2013--------------');
console.log("Log File Location at: ".green + serverPath +"logs.json");
console.log( "Serving files out of: ".green + servePath );
console.log('CTRL+C to shutdown'.red);

var webServer = http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname,
      filename = path.join( servePath, uri );

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };
  
  function endResponse(code, write, opt){
    if(!opt) opt = {};
    if(!opt.headers) opt.headers = {"Content-Type": "text/plain"};
    response.writeHead(code, opt.headers);
    if(code !== 200){
      response.write(code+write+"\n");
      appendToLog({"code":code, "file":uri, "msg":write});
    }else{
      var w = [].concat(write);
      response.write.apply(response, w);
      appendToLog({"code":code, "file":uri, "msg":filename});
    }
    response.end();
  }
  
  fs.exists(filename, function(exists) {
    if(!exists) { endResponse(404,'File not Found.'); return; }
    if (fs.statSync(filename).isDirectory()) filename += 'index.html';
    fs.readFile(filename, "binary", function(err, file) {
      if(err) { endResponse(500,err); return; }
      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      endResponse(200, [file, 'binary'], {headers:headers});
    });
  });
}).listen(parseInt(port, 10));
console.log("WebServer running at: ".green + "http://127.0.0.1:" + port.toString() + "/");
open('http://127.0.0.1:'+port.toString()); // opens browser window (mac)