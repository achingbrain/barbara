var Hapi = require('hapi'),
  Autowire = require('wantsit').Autowire;

var errors = [];
errors[400] = Hapi.error.badRequest;
errors[401] = Hapi.error.unauthorized;
errors[403] = Hapi.error.forbidden;
errors[404] = Hapi.error.notFound;
errors[405] = Hapi.error.methodNotAllowed;
errors[406] = Hapi.error.notAcceptable;
errors[407] = Hapi.error.proxyAuthRequired;
errors[408] = Hapi.error.clientTimeout;
errors[409] = Hapi.error.conflict;
errors[410] = Hapi.error.resourceGone;
errors[411] = Hapi.error.lengthRequired;
errors[412] = Hapi.error.preconditionFailed;
errors[413] = Hapi.error.entityTooLarge;
errors[414] = Hapi.error.uriTooLong;
errors[415] = Hapi.error.unsupportedMediaType;
errors[416] = Hapi.error.rangeNotSatisfiable;
errors[417] = Hapi.error.expectationFailed;
errors[501] = Hapi.error.notImplemented;
errors[502] = Hapi.error.badGateway;
errors[503] = Hapi.error.serverTimeout;
errors[504] = Hapi.error.gatewayTimeout;
errors[500] = Hapi.error.badImplementation;

var NanoErrorTranslator = function() {
  this._logger = Autowire;
};

NanoErrorTranslator.prototype.translate = function(request, next) {
  var response = request.response;

  if(response instanceof Error) {
    return next(null, this._translate(response));
  }

  return next();
};

NanoErrorTranslator.prototype._translate = function(response) {
  if(!response.status_code) {
    return response;
  }

  if(errors[response.status_code]) {
    return errors[response.status_code](response.message);
  }

  this._logger.warn('NanoErrorTranslator: Don\'t know what to do with Nano error', response);

  return Hapi.error.badImplementation('Missing error mapping');
};

module.exports = NanoErrorTranslator;