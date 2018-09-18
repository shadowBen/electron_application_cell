/**
 * tty.js
 * Copyright (c) 2012-2014, Christopher Jeffrey (MIT License)
 */

/**
 * Modules
 */
var path = require('path')
  , fs = require('fs')
  , Stream = require('stream').Stream
  , EventEmitter = require('events').EventEmitter;

var pty = require('pty.js')
  , term = require('term.js');

  function tty(){
  	this.TerimnalPool = {};
  }

  tty.prototype.init = function(){

  }

  tty.prototype.newTerminal = function(){
  	
	this.TerimnalPool[id] = term;
  }


module.exports = tty;