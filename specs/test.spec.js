var Metadata = require('../lib/luminous-mongo-metadata'),
    Luminous = require('luminous-base'),
    Config = Luminous.Config,
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

describe("Luminous Mongo Metadata suite", function() {
    var metadata = new Metadata();

    var todoType = {
        _id: '/todo',
        fields: [{
            field: 'title',
            type: '/string'
        }]
    };

    beforeEach(function(done) {
        dropDatabase(done);
    });

    afterEach(function(done) {
        dropDatabase(done);
    });

    it("must be able to add types", function(done) {
        metadata.add(todoType, function(err) {
            expect(err).toBeFalsy();
            done();
        });
    }, 1000);

    it("must be able to add types and retrieve them", function(done) {
        metadata.add(todoType, function(err) {
            expect(err).toBeFalsy();
            metadata.load(todoType._id, function(err, typeData) {
                expect(err).toBeFalsy();
                expect(typeData).toEqual(todoType);
                done();
            });
        });
    }, 1000);

    it("must be able to retrieve all types", function(done) {
        metadata.add(todoType, function(err) {
            expect(err).toBeFalsy();
            metadata.list(function(err, types) {
                expect(err).toBeFalsy();
                var todoTypeResult = types.reduceRight(function(prev, cur) {
                    return cur._id == todoType._id ? cur : null;
                });
                expect(todoTypeResult).toEqual(todoType);
                done();
            });
        });
    }, 1000);
});

function dropDatabase(callback) {
    var config = new Config();
    config.load(function(err, data) {
        if (err) throw err;
        MongoClient.connect(data.mongoConnection, function(err, db) {
            if (err) throw err;
            db.dropDatabase(function(err) {
                callback();
                db.logout(function() {
                    db.close();
                });
            });
        });
    });
}
