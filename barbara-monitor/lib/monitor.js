var config = require('rc')('database'),
  winston = require("winston"),
  Container = require("wantsit").Container,
  express = require("express"),
  http = require("http"),
  path = require("path"),
  mdns = require("mdns2"),
  path = require("path");

var container = new Container();
container.register("config", config);

// set up logging
var logger = container.createAndRegister('logger', winston.Logger, {
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true
    })
  ]
});

// web controllers
container.createAndRegister("homeController", require(path.resolve(__dirname, "./routes/Home")));

// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register("seaport", {
  query: function() {
    return [];
  }
});

var seaport = Seaport.connect({host: config.seaport.host, port: config.seaport.port});
seaport.on('connect', function() {
  logger.info('Seaport connected');
/*
  // start REST database server
  var columbo = container.find('columbo');
  var server = Hapi.createServer('0.0.0.0', seaport.register(config.rest.name + '@' + config.rest.version), {
    cors: true
  });
  server.route(columbo.discover());
  server.ext('onPreResponse', container.find('nanoErrorTranslator'));
  server.start();

  logger.info('RESTServer', 'Running at', 'http://localhost:' + server.info.port);
*/
  var app = express();

  var route = function(controller, url, method) {
    var component = container.find(controller);

    app[method](url, component[method].bind(component));
  }

  // all environments
  app.set("port", seaport.register(config.www.name + '@' + config.www.version));
  app.set("views", path.resolve(__dirname, "./views"));
  app.set("view engine", "jade");
  app.use(express.logger("dev"));
  app.use(express.urlencoded())
  app.use(express.json())
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.resolve(__dirname, "./public")));

  // development only
  app.use(express.errorHandler());

  route("homeController", "/", "get");

  http.createServer(app).listen(app.get("port"), function(){
    LOG.info("Express server listening on port " + app.get("port"));
  });
});
seaport.on('disconnect', function() {
  logger.info('Seaport disconnected');
});
seaport.on('error', function(error) {
  logger.info('Seaport error', error);
});
container.register('seaport', seaport);
/*
var bonvoyageClient = container.createAndRegister("seaportClient", bonvoyage.Client, {
  serviceType: nconf.get("registry:name")
});
bonvoyageClient.register({
  role: nconf.get("www:role"),
  version: nconf.get("www:version"),
  createService: function(port) {
    var app = express();

    var route = function(controller, url, method) {
      var component = container.find(controller);

      app[method](url, component[method].bind(component));
    }

    // all environments
    app.set("port", port);
    app.set("views", path.resolve(__dirname, "./views"));
    app.set("view engine", "jade");
    app.use(express.logger("dev"));
    app.use(express.urlencoded())
    app.use(express.json())
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.resolve(__dirname, "./public")));

    // development only
    app.use(express.errorHandler());

    route("homeController", "/", "get");

    http.createServer(app).listen(app.get("port"), function(){
      LOG.info("Express server listening on port " + app.get("port"));
    });

    // publish via Bonjour
    var advert = mdns.createAdvertisement(mdns.tcp("http"), port, {
      name: "barbara-monitor"
    });
    advert.start();
  }
});
bonvoyageClient.on("seaportUp", function(seaport) {
  container.register("seaport", seaport);
});
*/