/**
 * Created by marek on 11.7.2017.
 */
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var Node = require('../model/RNode');
var Link = require('../model/Link');
var URIS = require('../vocab/uris');

var LinkControl = function(sparqlFace, modelState) {
    var model;
    var ms = modelState;
    var internal = {
        predicateSelected: function (predicate) {
            if (this.creationLink != null) {
                this.creationLink.setUri(predicate.uri);
                this.creationLink.setName(predicate.name);
                this.addRelationLink();
            }
            PS.publish(M.modelChanged, model);
        }
        ,
    
        addRelationLink: function () {
            model.addRelationLink(this.creationLink);
            model.removeLink(this.creationLink);
            this.creationLink = null;
        }
        ,
    
        setPredicateNameFromField: function (enteredName) {
            if (enteredName != "") {
                this.creationLink.setUri(sparqlFace.createUriFromName(enteredName));
                this.creationLink.setName(enteredName);
            }
            else {
                this.creationLink.setUri(URIS.relatedToPredicate);
                this.creationLink.setName("");
            }
            this.addRelationLink();
            PS.publish(M.modelChanged, model);
        }
        ,
    
        nodeClicked: function (node) {
            this.selectedValuation = null;
            if (this.linkStart != null && node != null) {
                this.creationLink.setEnd(node);
                this.linkStart = null;
                /*
                this.selectedNode.selected = false;
                this.selectedNode = null;*/
                PS.publish(M.linkCreated, this.creationLink);
                PS.publish(M.modelChanged, model);
            }
            else if (this.linkStart != null) {
                this.linkStart = null;
                /*
                this.selectedNode.selected = false;
                this.selectedNode = null;*/
                model.removeLink(this.creationLink);
                PS.publish(M.modelChanged, model);
            }
            if (node == null) {
                if (this.creationLink != null) {
                    model.removeLink(this.creationLink);
                    PS.publish(M.modelChanged, model);
                }
                this.creationLink = null;
            }
        },
    
        linkButtonClick: function(location){
            if(this.linkStart == null) {
                if(this.blankNode == null) {
                    this.blankNode = Object.create(Node);
                    this.blankNode.init("", "");
                    this.blankNode.visible = false;
                    this.blankNode.x = location.x;
                    this.blankNode.y = location.y;
                    model.addNode(this.blankNode);
                    ms.setBlankNode(this.blankNode);
                }
                this.linkStart = ms.getSelectedNode();
                this.creationLink = Object.create(Link);
                this.creationLink.init(this.linkStart, this.blankNode, "", "");
                this.model.addLink(this.creationLink);
            }
        },
        
        subscribe: function() {
           PS.subscribe(M.modelReset, function(msg, newModel){
               model = newModel;
           });
           PS.subscribe(M.nodeMouseDown, function(msg, data) {
               internal.nodeClicked(data.node);
           });
           PS.subscribe(M.btnNodeLink, function(msg) {
               var selNode = ms.getSelectedNode();
               internal.linkButtonClick({x:selNode.x+selNode.width+30, y:selNode.y});
           });
        },
        
        init: function() {
            this.linkStart = null;
            this.blankNode = null;
            this.creationLink = null;
            
        }
    };
    
    return {
        initAll: function() {
            internal.init();
            internal.subscribe();
        }
    };
};

module.exports = LinkControl;