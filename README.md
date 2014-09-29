# rest-spec-routing

A Toolkit for Creating RESTful routes for express applications from swagger specs

## Getting Started

`npm install --save rest-spec-routing`

in your express application `app.js

```
var express = require('express');
var routing = require('rest-spec-routing');

var router = routing.useSpec('swagger', {specDir: __dirname + './specs'});
var app = require('express');
app.use(router);

```
