var Autowire = require("wantsit").Autowire;

Config = function() {
  this._config = Autowire;
};

Config.prototype.retrieveOne = function(request, response) {
  var config = {
    type: "database",
    upstream: [],
    downstream: []
  };

  // add registry connection
  config.upstream.push({
    role: "seaport",
    version: this._config.seaport.version,
    host: this._config.seaport.host + ":" + this._config.seaport.port,
    weight: 0.5
  });

  response(null, config);
};

module.exports = Config;
