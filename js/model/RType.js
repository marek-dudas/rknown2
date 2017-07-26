/**
 * Created by marek on 22.6.2017.
 */
var URIS = require('../vocab/uris');

var RType = {
    init: function(uri, label, color) {
        this.uri = uri;
        this.label = label;
        this.name = label;
        this.color = color;
    },
    setColor: function(color) {
        this.color = color;
    },
    getColor: function() {
        return this.color;
    },
    triplify: function() {
        var triples = Triple.create(this.uri, URIS.rdfType, URIS.rdfsClass).str();
        triples += Triple.create(this.uri, URIS.rdfsLabel, "\""+this.label+"\"").str();
        triples += Triple.create(this.uri, URIS.colorPredicate, "\""+this.color+"\"").str();
        return triples;
    }
};

module.exports = RType;