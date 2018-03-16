
const Aria2 = require('aria2');
const fs = require('fs');
const { URL } = require('url');
const log4js = require('log4js');
const cheerio = require('cheerio');
const request = require('request');
const Promise = require('bluebird');

const logger = log4js.getLogger();
logger.level = 'info';


let options={
    host: 'localhost',
    port: 6800,
    secure: false,
    secret: '',
    path: '/jsonrpc'
}
var aria2 = new Aria2([options]);


aria2.onopen = function() {
    console.log('aria2 open');
};

aria2.onsend = function(m) {
    console.log('aria2 OUT', m);
};
aria2.onmessage = function(m) {
    console.log('aria2 IN', m);
};


aria2.getVersion().then(
    function (res) {
        console.log('result', res)
    },
    function (err) {
        console.log('error', err)
    }
)

// OR

aria2.send('getVersion').then(
    function (res) {
        console.log('result', res)
    },
    function (err) {
        console.log('error', err)
    }
)

aria2.onDownloadStart = function(gid) {
    console.log(gid);
};