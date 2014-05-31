var Autowire = require("wantsit").Autowire,
  util = require("util"),
  Repository = require("nano-repository");

BrewRepository = function() {
  Repository.call(this, Autowire({
    name: 'brewsDb'
  }), Autowire);
};
util.inherits(BrewRepository, Repository);

BrewRepository.prototype.afterPropertiesSet = function() {
  this.updateViews(__dirname + "/BrewRepository.json");
};

module.exports = BrewRepository;
