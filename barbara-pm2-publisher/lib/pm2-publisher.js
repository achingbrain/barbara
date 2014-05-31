var config = require("nconf"),
  bonvoyage = require("bonvoyage"),
  path = require("path");

// set up arguments
config.argv().env().file(path.resolve(__dirname, "config.json"));

var bonvoyageClient = new bonvoyage.Client({
  serviceType: config.get("registry:name")
});
bonvoyageClient.register({
  role: config.get("pm2-rpc:name"),
  version: config.get("pm2-rpc:version"),
  port: config.get("pm2-rpc:port")
});
bonvoyageClient.register({
  role: config.get("pm2-events:name"),
  version: config.get("pm2-events:version"),
  port: config.get("pm2-events:port")
});
