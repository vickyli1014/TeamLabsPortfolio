/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/**
 * Web interface to the expression system, server side.
 * 
 * PS3 instructions: you are free to change this file.
 */

import fs from 'fs';
import Browserify from 'browserify';
import express from 'express';

const app = express();

app.use('/img', express.static('img', { fallthrough: false }));

app.get('/bundle.js', function(req, res, next) {
  res.contentType('application/javascript');
  new Browserify().add('dist/src/web-client.js').bundle().pipe(res, { end: true });
});

app.get('/', function(req, res, next) {
  res.end(fs.readFileSync('lib/web.html', { encoding: 'utf-8' }));
});

const port = 8080;
const server = app.listen(port, function() {
  console.log(`Memely web server listening on http://localhost:${port}`);
});
