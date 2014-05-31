var packageJson = require('../package'),
  Seaport = require('seaport'),
  winston = require('winston'),
  config = require('rc')(packageJson.name),
  wantsit = require('wantsit'),
  WebSocketServer = require('ws').Server,
  Columbo = require('columbo'),
  Hapi = require('hapi'),
  path = require('path'),
  freeport = require('freeport');

var container = new wantsit.Container();
container.register('config', config);

// set up logging
container.createAndRegister('logger', winston.Logger, {
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true
    })
  ]
});

// create a REST api
container.createAndRegister('columbo', Columbo, {
  resourceDirectory: path.resolve(__dirname, './resources'),
  resourceCreator: function(resource, name) {
    return container.createAndRegister(name + 'Resource', resource);
  },
  logger: container.find('logger')
});

// start seaport
var seaport = container.register('seaport', Seaport.createServer());
seaport.on('listening', function() {
  container.find('logger').info('Registry', 'Seaport listening on port', seaport.address().port);
});
seaport.on('register', function(service) {
  container.find('logger').info('Registry', 'Service was registered', service.role + '@' + service.version, 'running on', service.host + ':' + service.port, 'node', service._node);

  container.find('webSocketServer').broadcast({registered: service});
});
seaport.on('free', function(service) {
  container.find('logger').info('Registry', 'Service was removed', service.role + '@' + service.version, 'running on', service.host + ':' + service.port, 'node', service._node);

  container.find('webSocketServer').broadcast({removed: service});
});
seaport.listen(config.seaport.port);

freeport(function(er, port) {
  // start REST server
  var columbo = container.find('columbo');
  var server = Hapi.createServer('0.0.0.0', port, {
    cors: true
  });
  server.route(columbo.discover());
  server.start();

  container.find('logger').info('Registry', 'REST server Running at http://localhost:' + port);
});

freeport(function(er, port) {
  // open web socket
  var webSocketServer = container.createAndRegister('webSocketServer', WebSocketServer, {port: port});
  webSocketServer.broadcast = function(data) {
    this.clients.forEach(function(client) {
      client.send(JSON.stringify(data));
    });
  };
  webSocketServer.on('connection', function(client) {
    client.on('message', function(message) {
      var result = seaport.query(message);

      client.send(JSON.stringify({query: result}));
    });
  });

  container.find('logger').info('Registry', 'WebSocketServer Running at http://localhost:' + port);
});

/*
var bonvoyageServer = new bonvoyage.Server({
  serviceType: nconf.get('registry:name')
});
bonvoyageServer.publish(seaport);

var bonvoyageClient = new bonvoyage.Client({
  serviceType: nconf.get('registry:name')
});
bonvoyageClient.register({
  role: nconf.get('rest:name'),
  version: nconf.get('rest:version'),
  createService: function(port) {
    var columbo = container.find('columbo');
    var server = Hapi.createServer('0.0.0.0', port, {
      cors: true
    });
    server.addRoutes(columbo.discover());
    server.start();

    container.find('logger').info('RESTServer', 'Running at', 'http://localhost:' + port);
  }
});
bonvoyageClient.register({
  role: nconf.get('ws:name'),
  version: nconf.get('ws:version'),
  createService: function(port) {
    var webSocketServer = container.createAndRegister('webSocketServer', WebSocketServer, {port: port});
    webSocketServer.broadcast = function(data) {
      this.clients.forEach(function(client) {
        client.send(JSON.stringify(data));
      });
    };
    webSocketServer.on('connection', function(client) {
      client.on('message', function(message) {
        var result = seaport.query(message);

        client.send(JSON.stringify({query: result}));
      });
    });
  }
});
*/

process.on('message', function(message) {
  container.find('logger').info('Registry', 'Incoming message', message);

  if (message == 'shutdown') {
    container.find('logger').info('Registry', 'Received shut down message');

    seaport.close();
  }
});
