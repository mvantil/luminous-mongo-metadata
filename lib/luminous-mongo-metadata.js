var Luminous = require('luminous-base'),
    _Metadata = Luminous.Metadata,
    Config = Luminous.Config,
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    EventEmitter = require('events').EventEmitter;

function Metadata() {
    var emitter = new EventEmitter();
    var config = new Config();

    config.load(function(err, data) {
        emitter.emit('configLoaded', err, data);
        emitter.on('newListener', function(eventName, listener) {
            if (eventName == 'configLoaded') {
                listener(err, data);
            }
        });
    });

    function getCollection(callback) {
        emitter.once('configLoaded', function(err, config) {
            var typeName = config && config.metadata && config.metadata.typeCollection
                ? config.metadata.typeCollection : '/type';

            if (!callback) {
                throw new Error("Must define a callback for getCollection.");
            }
            if (err) return callback(err);

            MongoClient.connect(config.mongoConnection, function(err, db) {
                var collection = db.collection(typeName);
                collection.close = function() {
                    db.logout(function() {
                        db.close();
                    });
                };
                callback(null, collection);
            });
        });
    }


    this.add = function(item, callback) {
        getCollection(function(err, collection) {
            if (err) {
                if (callback) return callback(err);
                throw err;
            }
            collection.update({_id: item._id}, item, {upsert: true, safe: true}, function(err,  result) {
                if (err) {
                    if (callback) return callback(err);
                    throw err;
                }
                callback();
            });

            collection.close();
        });
    };

    this.load = function(typeName, callback) {
        getCollection(function(err, collection) {
            if (err) {
                if (callback) return callback(err);
                throw err;
            }
            collection.findOne({_id: typeName}, function(err, result) {
                callback(err, result);
            });

            collection.close();
        });
    };

    this.list = function(callback) {
        getCollection(function(err, collection) {
            if (err) {
                if (callback) return callback(err);
                throw err;
            }
            collection.find().toArray(function(err, results) {
                callback(err, results);
            });

            collection.close();
        });
    };
}

Metadata.prototype = new _Metadata();

module.exports = Metadata;
