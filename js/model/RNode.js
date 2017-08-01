/**
 * Created by marek on 21.6.2017.
 */
var Label = require('./Label.js');
var uriTool = require('./Uri.js');
var Geometry = require('./Geometry.js');
var URIS = require('../vocab/uris');
var RSettings = require('../settings/appSettings');
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var Point = require('../model/Point');

function Line(start, end) {
    this.start = start;
    this.end = end;
};

var Node = {
    init: function(uri, name, type) {
        this.selected = false;
        this.uri = uriTool.stripBrackets(uri);
        this.id = -1;
        this.visible = true;
        this.typeNode = false;
        this.valuations = [];
        this.type = URIS.object;
        this.types = [];
        this.predicateUri = null;
        this.color = RSettings.defaultNodeColor;
        this.mainType = null;
        if(type != null) this.type = type;
        this.name = name;
        this.updateDimensions();
        this.searchHighlight = false;
        this.labels = [];
        Promise.resolve(name).then(this.setName.bind(this));
        if(typeof name.then !== 'undefined') {
            this.name = uriTool.nameFromUri(this.uri);
        }
    },

    updateDimensions: function() {
        if(this.name != "") {
            this.width = RSettings.nodeWidth;
            this.height = RSettings.nodeHeight;
        }
        else {
            this.width = RSettings.emptyNodeWidth;
            this.height = RSettings.emptyNodeHeight;
        }
    },

    setName: function(name) {
        this.name = name;
        if(this.labels.length==0) {
            this.addLabel(Label(name));
        }
    },

    addType: function(type) {
        var typeExists = false;
        for(var i=0; i<this.types.length; i++) if(this.types[i].uri == type.uri) typeExists = true;
        if(typeExists == false && this.types.length == 0 && this.color == RSettings.defaultNodeColor) {
            this.setMainType(type);
        }
        if(typeExists == false) {
            this.types.push(type);
            PS.publish(M.modelChanged);
        }
    },

    getColor: function() {
        if(this.mainType!=null) return this.mainType.color;
        else return this.color;
    },

    setMainType: function(type) {
        this.color = type.color;
        this.mainType = type;
    },

    deleteType: function(type) {
        var index = this.types.indexOf(type);
        if(index >= 0) this.types.splice(index, 1);
        if(this.types.length > 0) this.setMainType(this.types[0]);
        else {
            this.mainType = null;
            this.color = RSettings.defaultNodeColor;
        }
    },

    addLabel: function(label) {
        this.labels.push(label);
    },

    removeLabel: function(label) {
        var index = this.labels.indexOf(label);
        if(index>0) this.labels.splice(index,1);
    },

    updateLabel: function() {
        this.setName(this.labels[0].text);
    },

    brUri: function() {
        return "<"+this.uri+">";
    },

    setPredicateUri: function(uri) {
        this.predicateUri = uriTool.stripBrackets(uri);
    },

    setTypeNode: function() {
        this.typeNode = true;
    },

    equals: function(node) {
        return this.uri == node.uri;
    },

    triplify: function(model) {
        if(this.visible == false) return "";
        var tripleString = "<"+this.uri+"> <http://rknown.com/xcoord> "+this.x+" . \r\n";
        tripleString += "<"+this.uri+"> <http://rknown.com/ycoord> "+this.y+" . \r\n";
        tripleString += "<"+this.uri+"> " + URIS.rKnownTypePredicate + " " +this.type+" . \r\n";
        tripleString += "<"+this.uri+"> <http://www.w3.org/2000/01/rdf-schema#label> \""+this.name+"\" . \r\n";
        if(this.predicateUri!=null) {
            tripleString += "<"+this.uri+"> <http://rknown.com/predicate> <"+this.predicateUri+"> . \r\n" +
                "<"+this.predicateUri+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#ObjectProperty>;\r\n" +
                "<http://www.w3.org/2000/01/rdf-schema#label> \"" + this.name + "\" . \r\n" ;
        }

        if(this.mainType != null) {
            tripleString +=  "<"+this.uri+"> " + URIS.mainTypePredicate + " <" + this.mainType.uri + "> . ";
        }

        for(var i=0; i<this.types.length; i++) {
            tripleString += "<"+this.uri+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <"+this.types[i].uri+"> . \r\n";
        }

        for(var i=0; i<this.valuations.length; i++) {
            tripleString += "<"+this.uri+"> <"+this.valuations[i].predicate.uri+"> \""+this.valuations[i].value+"\" .\r\n";
            tripleString += "<"+this.valuations[i].predicate.uri+"> <http://www.w3.org/2000/01/rdf-schema#label> \""+this.valuations[i].predicate.name+"\" ;\r\n" +
                "				<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#DataProperty> . \r\n";
            tripleString += Triple.create(this.valuations[i].predicate.uri, URIS.rKnownTypePredicate, "<http://www.w3.org/2002/07/owl#DataProperty>").str();
        }

        if(this.type == URIS.relation) {
            var link = model.getRelationFor(this);
            if(link!=null) tripleString += link.triplify();
        }
        return tripleString;
    },

    copy: function() {
        var nodeCopy = Object.create(Node);
        nodeCopy.init(this.uri, this.name);
        return nodeCopy;
    },

    getComment: function() {
        return "this is some entity";
    },

    addValuation: function(valuation) {
        this.valuations.push(valuation);
    },

    deleteValuation: function(valuation) {
        var index = this.valuations.indexOf(valuation);
        if(index>=0) this.valuations.splice(index,1);
    },
    
    linkIntersection: function(link, nearTo){
        if(this.type == "<http://rknown.com/RKnownRelation>") return this.diamondIntersection(link, nearTo);
        else return this.rectIntersection(link, nearTo);
    },

    ellipseIntersection: function(link, nearTo){
        var ellipse = {};
        ellipse.a = this.width/2;
        ellipse.b = this.height/2;
        ellipse.x = this.x;
        ellipse.y = this.y;
        return Geometry.nearEllipseIntersection(ellipse, link, nearTo);
    },

    rectIntersection: function(link, nearTo){
        var lines = [
            new Line(new Point(this.x-this.width/2, this.y-this.height/2), new Point(this.x+this.width/2, this.y-this.height/2)),
            new Line(new Point(this.x-this.width/2, this.y-this.height/2), new Point(this.x-this.width/2, this.y+this.height/2)),
            new Line(new Point(this.x+this.width/2, this.y-this.height/2), new Point(this.x+this.width/2, this.y+this.height/2)),
            new Line(new Point(this.x+this.width/2, this.y+this.height/2), new Point(this.x-this.width/2, this.y+this.height/2)),
        ];
        var intersections = [];
        for(var i=0; i<4; i++) {
            var inters = Geometry.rayLineIntersection(link.start, Geometry.lineEquation(link.start,link.end), lines[i].start, lines[i].end);
            if(inters!=null) intersections.push(inters);
        }
        if(intersections.length==0) return null;
        return Geometry.nearPoint(nearTo, intersections);
    },

    diamondIntersection: function(link, nearTo){
        var lines = [
            new Line(new Point(this.x-this.width/2, this.y), new Point(this.x, this.y-this.height/2)),
            new Line(new Point(this.x-this.width/2, this.y), new Point(this.x, this.y+this.height/2)),
            new Line(new Point(this.x+this.width/2, this.y), new Point(this.x, this.y-this.height/2)),
            new Line(new Point(this.x+this.width/2, this.y), new Point(this.x, this.y+this.height/2)),
        ];
        var intersections = [];
        for(var i=0; i<4; i++) {
            var inters = Geometry.rayLineIntersection(link.start, Geometry.lineEquation(link.start,link.end), lines[i].start, lines[i].end);
            if(inters!=null) intersections.push(inters);
        }
        if(intersections.length==0) return null;
        return Geometry.nearPoint(nearTo, intersections);
    },
    
    getPathData: function() {
        if(this.type == "<http://rknown.com/RKnownRelation>")
            return this.diamondPath(this.width, this.height);
        else return this.rectPath(this.width, this.height);
    },

    path: function(width, height) {
        return "M"+(0)+","+(-height/2)+" a"+width/2+" "+height/2+" 0 1 0 1,0 z";
    },

    rectPath: function(width, height) {
        return "M"+(-width/2)+","+(-height/2)+" l "+width+","+(0)+" l "+(0)+","+(height)+" l "+(-width)+","+(0)+" z";
    },

    diamondPath: function(width, height) {
        return "M"+(-width/2)+","+(0)+" l "+width/2+","+height/2+" l "+width/2+","+(-height/2)+" l "+(-width/2)+","+(-height/2)+" z";
    },
    
    getPoint: function getPoint() {
        return Point(this.x, this.y);
    },
    
    distanceFrom: function distanceFrom(somePoint) {
        return somePoint.distance(this.getPoint());
    }

};

module.exports = Node;


