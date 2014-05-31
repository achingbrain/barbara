var config = require('rc')('database'),
  Container = require('wantsit').Container,
  Nano = require('nano'),
  Columbo = require('columbo'),
  Hapi = require('hapi'),
  winston = require('winston'),
  path = require('path'),
  Seaport = require('seaport');

var container = new Container();
container.register('config', config);

// set up logging
var logger = container.createAndRegister('logger', winston.Logger, {
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true
    })
  ]
});

// database
var connection = new Nano('http://' + config.couchdb.host + ':' + config.couchdb.port);
container.register('connection', Nano);

// create collections
connection.db.create('barbara_brews');
container.register('brewsDb', connection.use('barbara_brews'));

// handlers
container.createAndRegisterFunction('nanoErrorTranslator', 'translate', require('./components/NanoErrorTranslator'));

// repositories
container.createAndRegister('brewRepository', require('./repositories/BrewRepository'));

// create a REST api
container.createAndRegister('columbo', Columbo, {
  resourceDirectory: path.resolve(__dirname, './resources'),
  resourceCreator: function(resource, name) {
    return container.createAndRegister(name + 'Resource', resource);
  },
  logger: logger
});

var seaport = Seaport.connect({host: config.seaport.host, port: config.seaport.port});
seaport.on('connect', function() {
  logger.info('Seaport connected');

  // start REST database server
  var columbo = container.find('columbo');
  var server = Hapi.createServer('0.0.0.0', seaport.register(config.rest.name + '@' + config.rest.version), {
    cors: true
  });
  server.route(columbo.discover());
  server.ext('onPreResponse', container.find('nanoErrorTranslator'));
  server.start();

  logger.info('RESTServer', 'Running at', 'http://localhost:' + server.info.port);
});
seaport.on('disconnect', function() {
  logger.info('Seaport disconnected');
});
seaport.on('error', function(error) {
  logger.info('Seaport error', error);
});
container.register('seaport', seaport);

/*// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register('seaport', {
  query: function() {
    return [];
  }
});

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
    server.route(columbo.discover());
    server.start();

    container.find('logger').info('RESTServer', 'Running at', 'http://localhost:' + port);
  }
});
bonvoyageClient.find(function(error, seaport) {
  if(error) {
    container.find('logger').error('Error finding seaport', error);

    return;
  }

  container.find('logger').info('Found seaport server');
});
bonvoyageClient.on('seaportUp', function(seaport) {
  container.register('seaport', seaport);
});
 */