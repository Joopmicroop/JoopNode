JoopNode
========

a bootplate webserver project written in node.js including node debugger and auto open for easy developing.
Everything that you put next to the index.html will be accesable trough the webservice. Once started a new
browser window will open displaying your index.html file which can be replaced you the owner.
If you've enabled debug mode an additional window would open with the chrome debug tools showing and linked
to the webserver.js file so you can add and debug your own services.

## Requirements:
  - node.js (including npm)
  - node-inspector (optional)  
    Only needed if you want to debug the node.js file.  
    exectue the following command in the terminals after having installed node.js and thereby also npm.
    `sudo npm install -g node-inspector`
    once the node-inspector install has finished you'll be able to debug node.js.
    `node Servers/WebServer.js --debug`

## Howto:
  copy JoopNode content to any folder on your disk to share it as a webserver.  
  With any JoopNode folder as cwd you can enter the following commands to share.
  
  `node Servers/WebServer.js` to start the webserver by default  
  `node Servers/WebServer.js --PORT 9999` to start the webserver on port 9999  
  
  The webserver will automaticly open a new browser window displaying your index.html file.  
  Or you can open it yourself at `http://127.0.0.1:1337` as indicated by the server itself.  
  The webserver will also always create a logs.json file with the files that where requested
  and their status described in it.
  
  
