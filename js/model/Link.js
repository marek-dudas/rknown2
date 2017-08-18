/**
 * Created by marek on 22.6.2017.
 */
var uriTool = require('./Uri.js');
var URIS = require('../vocab/uris.js');
var Point = require('./Point');
var Triple = require('./Triple');


var Link = {
    init: function(start, end, uri, name) {
        this.type = "link";
        this.start = start;
        this.end = end;
        this.source = start;
        this.target = end;
        this.from = start;
        this.to = end;
        this.right = true;
        this.left = false;
        this.id = -1;
        this.uri = uriTool.stripBrackets(uri);
        this.name = name;
        //if(typeof name.then !== 'undefined') name.then(this.setName.bind(this));
        Promise.resolve(name).then(this.setName.bind(this));
        if(typeof name.then !== 'undefined') {
            this.name = uriTool.nameFromUri(this.uri);
        }
    },
    triplify: function() {
        var triples = Triple.create(this.start.uri, this.uri, this.end.uri).str();
        triples += Triple.create(this.uri, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "http://www.w3.org/2002/07/owl#ObjectProperty").str();

        triples += Triple.create(this.uri, URIS.rKnownTypePredicate,
            "http://www.w3.org/2002/07/owl#ObjectProperty").str();
        triples += "<"+this.uri+"> <http://www.w3.org/2000/01/rdf-schema#label> \""+this.name+"\" .\r\n";
        return triples;
    },
    setEnd: function(end) {
        this.end = end;
        this.target = end;
        this.to = end;
    },
    setUri: function(uri) {
        this.uri = uri;
    },
    setName: function(name){
        this.name = name;
    },
    dashed: function() {
        return "";
    },
    connectedTo: function(node) {
        if (this.start == node || this.end == node) return true;
        else return false;
    },
    
    countEndFromIntersection: function() {
        var intersection = this.end.linkIntersection(this, this.start);
        this.endX = intersection.x;
        this.endY = intersection.y;
    },

    countStartFromIntersection: function() {
        var intersection = this.start.linkIntersection(this, this.end);
        this.startX = intersection.x;
        this.startY = intersection.y;
    },

    getMiddlePoint: function() {
        var lineVec = new Point();
        lineVec.x = this.end.x - this.start.x;
        lineVec.y = this.end.y - this.start.y;
        var middle = new Point();
        middle.x = this.start.x + 0.5*lineVec.x;
        middle.y = this.start.y + 0.5*lineVec.y;
        return middle;
    }
};

module.exports = Link;