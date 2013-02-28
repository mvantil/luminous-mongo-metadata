var _Metadata = require('./_metadata');

function Metadata() {
    this.list = function(callback) {
        callback('happy days');
    };
}

Metadata.prototype = new _Metadata();

module.exports = _Metadata;
