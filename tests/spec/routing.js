'use strict';

/*global describe, it, before */

var expect = require('chai').expect;
var supertest = require('supertest');
var routing = require(__dirname + '/../../');

describe('rest spec routing', function(){
	it('Creates routes from swagger spec', function(){
		var router = routing.useSpec('swagger', {specDir: __dirname + '/../fixtures/swagger'});
		expect(router.stack).to.have.length(4);
	});
});

describe('rest spec commands and callbacks', function(){
	var app;
	before(function(){
		var router = routing.useSpec('swagger', {specDir: __dirname + '/../fixtures/swagger'});

		router.hooks.register('sayHello', function(command, cb){
			cb(null, 'hello world', {status:200});
		});

		router.hooks.register('helloPerson', function(command, cb){
			cb(null, 'hello ' + command.params.person);
		});

		app = require('express')();
		app.use(router);
	});	

	it('Routes http actions', function(done){
		supertest(app)
		.get('/hello')
		.expect(200)
		.end(function(err, res){
			expect(res.text).to.equal('hello world');
			done(err);
		});
	});

	it('routes http path parameters', function(done){
		supertest(app)
		.get('/hello/john')
		.expect(200)
		.end(function(err, res){
			expect(res.text).to.equal('hello john');
			done(err);
		});
	});
});