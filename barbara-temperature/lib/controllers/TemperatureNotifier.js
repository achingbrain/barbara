var Autowire = require("wantsit").Autowire;

TemperatureNotifier = function() {
  this._config = Autowire;
  this._temperatureController = Autowire;
  this._seaport = Autowire;
  this._logger = Autowire;
  this._restify = Autowire;
};

TemperatureNotifier.prototype.afterPropertiesSet = function() {
  setInterval(function() {
    // don't post NaN...
    if(isNaN(this._temperatureController.getCelsius())) {
      return;
    }

    // look up database
    var services = this._seaport.query(this._config.database.name + "@" + this._config.database.version);

    if(services.length == 0) {
      this._logger.info("TemperatureNotifier", "No database instance found!");

      return;
    }

    // post the temperature
    var url = "http://" + services[0].host + ":" + services[0].port;
    var path = "/brews/" + this._config.get("brew:id") + "/temperatures";

    this._logger.info("TemperatureNotifier", "Posting", this._temperatureController.getCelsius(), "degC to", url + path);

    var client = this._restify.createJsonClient({
      url: url
    });
    client.post(path, {
      celsius: this._temperatureController.getCelsius()
    }, function(error) {
      if(error) {
        LOG.error("TemperatureNotifier", "Could not report temperature to", url, error.message);

        return;
      }

      this._logger.info("TemperatureNotifier", "Reported temperature OK");
    }.bind(this));
  }.bind(this), this._config.temperature.notificationInterval);
};

module.exports = TemperatureNotifier;