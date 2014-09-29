var debug = require('debug')('rest-spect-routing');
var _ = require('lodash');
var express =  require('express');
var hooks = require('phased-hooks');

exports.strategies = {
	swagger: require('./lib/swagger')
};

function hookDispatcher(hooks){
	return function dispatchAsHook(command, cb){
		debug('%s executing', command.id, command.params);

		hooks.execute(command.id, [command], {}, function(err, data, exdata){
			debug('%s done', command.id, err, data, exdata);
			if(err){
				err.errorId = err.errorId || 500;
				cb(err, err.errorId);
			}
			else{
				data = data || {};
				exdata = exdata || {};
				var status = exdata.status || 200;
				var headers = exdata.http;
				cb(null, status, data, headers);
			}
		});
	};
}
	

exports.useSpec = function(specType, options, dispatch){
	var strategy = this.strategies[specType];
	dispatch = dispatch || hookDispatcher(hooks);

	if(!strategy){
		throw new Error( specType + ' is not a supported specification type');
	}

	var router = express.Router();
	router.hooks = hooks;

	strategy(options, function(verb, routePath, commandFn){
		router[verb](routePath, function(req, res, next){
			var command = _.extend({
				http: {
					req:req,
					res: res
				}
			}, commandFn(req));

			debug('calling %s for %s %s', command.id, verb, routePath);
			
			if(!command.id){
				var err = new Error('Commands should have id properties');
				err.errorId = 500;
				return next(err);
			}
			
			dispatch(command, function (err, status, body, headers){
				if(err){
					next(err);
				}
				else{
					res.set(headers || {});
					res.send(status, body);	
				}
			});
		});
	});

	return router;
};

exports.hooks = hooks;