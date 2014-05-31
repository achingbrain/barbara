var Autowire = require("wantsit").Autowire;

Config = function() {
  this._config = Autowire;
};

Config.prototype.retrieveOne = function(request, response) {
  /*var config = {
    type: "registry"
  };*/

  response(null, this._config);
};

Config.prototype.toString = function() {
  return "Config resource"
};

module.exports = Config;