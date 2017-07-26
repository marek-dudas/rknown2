/**
 * Created by marek on 22.6.2017.
 */
var d3 = require('d3');
var Link = require('./Link.js');
var Node = require('./RNode.js');
var UriTools = require('./Uri.js');
var URIS = require('../vocab/uris.js');
var RSettings = require('../settings/appSettings');
var PS = require('pubsub-js');
var M = require('../vocab/messages');

var RModel = {
    init: function(graphUri) {
        this.links = [];
        this.nodes = [];
        this.relations = [];
        this.idCounter = 10;
        this.name = "";
        this.created = Date.now();
        this.types = [];
        this.typeColors = d3.scaleOrdinal(d3.schemeCategory10);
        this.graphUri = graphUri;
        this.newNodeLocation = [100,100];
    },

    getGraphName: function() {
        return UriTools.nameFromUri(this.graphUri);
    },

    addType: function(type) {
        this.types.push(type);
    },

    addTypeToNode: function(node, type) {
        var color = null;
        for(var i=0; i<this.types.length; i++) {
            if(this.types[i].uri == type.uri) {
                color = this.types[i].color;
                type = this.types[i];
            }
        }
        if(color == null) {
            color = this.typeColors((this.types.length-1) % 10);
            this.types.push(type);
        }
        if(type.color == null) type.setColor(color);
        node.addType(type);
    },
    
    addNodeFromUri: function(uri, label, location) {
        uri = UriTools.stripBrackets(uri);
        var node = Object.create(Node);
        node.init(uri, label);
        if(location) {
            node.x = location.x;
            node.y = location.y;
        }
        else {
            node.x = this.newNodeLocation[0];
            node.y = this.newNodeLocation[1];
        }
        this.addNode(node);
        
        return node;
    },

    addNode: function(node) {
        if(this.getNodeByUri(node.uri) == null) {
            node.id = this.idCounter++;
            this.nodes.push(node);
            PS.publish(M.nodelinkChanged, this);
            PS.publish(M.modelChanged, this);
        }
    },

    addSimpleLink: function(from, to) {
        var link = Object.create(Link);
        link.init(from, to, "<http://rknown.com/RKnownLink>", "");
        link.id = this.idCounter++;
        this.links.push(link);
        PS.publish(M.nodelinkChanged, this);
        PS.publish(M.modelChanged, this);
    },

    removeNode: function(node) {
        var index = this.nodes.indexOf(node);
        if(index>=0) {
            for (var i = 0; i < this.links.length; i++) {
                if (this.links[i].connectedTo(node)) {
                    this.links.splice(i, 1);
                    i--;
                }
            }
            this.nodes.splice(this.nodes.indexOf(node), 1);
            PS.publish(M.modelChanged, this);
        }
    },

    removeLink: function(link) {
        var index = this.links.indexOf(link);
        if(index>=0) this.links.splice(this.links.indexOf(link),1);
        PS.publish(M.modelChanged, this);
        //this.updateBTypeLevels();
    },

    empty: function() {
        while(this.links.length) {
            this.links.pop();
        }
        while(this.nodes.length) {
            this.nodes.pop();
        }
    },

    getEntityUriBase: function() {
        return RSettings.uriBase;
    },

    addLink: function(link) {
        link.id = this.idCounter++;
        this.links.push(link);
        PS.publish(M.nodelinkChanged, this);
        PS.publish(M.modelChanged, this);
    },

    addRelationLink: function(link) {
        link.id = this.idCounter++;
        var linkNode = Object.create(Node);
        var linkNodeUri = this.getEntityUriBase() + this.getGraphName() + "/" +
            UriTools.nameFromUri(link.from.uri) + "-" + UriTools.nameFromUri (link.uri) + "-" +
            UriTools.nameFromUri(link.to.uri) + "-" + link.id;
        linkNode.init(linkNodeUri, link.name, "<http://rknown.com/RKnownRelation>");
        linkNode.setPredicateUri(link.uri);
        var connection = Object.create(Link);
        connection.init(link.from, link.to, "", "");
        var middle = connection.getMiddlePoint();
        linkNode.x = middle.x;
        linkNode.y = middle.y;
        this.addNode(linkNode);
        this.addSimpleLink(link.from, linkNode);
        this.addSimpleLink(linkNode, link.to);
        this.relations.push(link);
        PS.publish(M.modelChanged, this);
    },

    getNodeById: function(id) {
        for(var i=0; i<this.nodes.length; i++){
            if(this.nodes[i].id==id) return this.nodes[i];
        }
        return null;
    },

    getNodeByUri: function(uri) {
        for(var i=0; i<this.nodes.length; i++){
            if(this.nodes[i].uri==uri) return this.nodes[i];
        }
        return null;
    },

    linkExists: function(fromUri, toUri) {
        /*
         for(var i=0; i<this.links.length; i++) {
         if(this.links[i].from.uri == fromUri && this.links[i].to.uri == toUri) return true;
         }
         return false;*/
        for(var i=0; i<this.nodes.length; i++) {
            var node = this.nodes[i];
            if(node.type==URIS.relation) {
                var link = this.getRelationFor(node);
                if(link.from.uri == fromUri && link.to.uri == toUri) return true;
            }
        }
        return false;
    },

    addLinkByUris: function(linkUri, linkName, fromUri, toUri) {
        if(!this.linkExists(fromUri, toUri)) {
            var newLink = Object.create(Link);
            newLink.init(this.getNodeByUri(fromUri), this.getNodeByUri(toUri), linkUri, linkName);
            this.addRelationLink(newLink);
        }
    },

    updateCounter: function(idToCheck) {
        if(idToCheck>=this.idCounter) this.idCounter=idToCheck+1;
    },

    getRdf: function() {
        var rdf = "";
        for(var i=0; i<this.links.length; i++) rdf+=this.links[i].triplify();
        for(var i=0; i<this.nodes.length; i++) rdf+=this.nodes[i].triplify(this);
        for(var i=0; i<this.types.length; i++) rdf+=this.types[i].triplify();
        return rdf;
    },

    getLinks: function() {
        return this.links;
    },

    getNodes: function() {
        return this.nodes;
    },

    buildFromRdf: function(rdfData) {

    },

    getRelationFor: function(node) {
        var outgoing = null;
        var incoming = null;
        for(var i=0; i<this.links.length; i++) {
            if(this.links[i].from == node && this.links[i].to.type==URIS.object) outgoing = this.links[i];
            if(this.links[i].to == node && this.links[i].from.type == URIS.object) incoming = this.links[i];
        }
        if(incoming!=null&&outgoing!=null) {
            var link = Object.create(Link);
            link.init(incoming.start, outgoing.end, node.predicateUri, node.name);
            return link;
        }
        else return null;
    }

};

module.exports = RModel;