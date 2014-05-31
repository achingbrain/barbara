var Autowire = require("wantsit").Autowire;

Brew = function() {
  this._brewRepository = Autowire;
};

Brew.prototype.retrieve = function(request, response) {
  this._brewRepository.findById(request.params.brewId, response);
};

Brew.prototype.retrieveAll = function(request, response) {
  if(request.query.name) {
    this._brewRepository.findByName(request.query.name, function(error, brew) {
      if(!brew) {
        request.reply({}).code(404);

        return;
      }

      response(null, brew);
    });
  } else {
    this._brewRepository.findAll(response);
  }
};

module.exports = Brew;
