/**
 * Created by marek on 7.7.2017.
 */
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var Node = require('../model/RNode');
var RType = require('../model/RType');
var Label = require('../model/Label');

var NodeControl = function NodeControl(_sparqlFace, _ms) {
    var ms = _ms,
        sparqlFace = _sparqlFace,
        model,
        selectedPredicate,
        selectedValuation,
        selectedLabel,
        internal = {
            saveLiteralButtonClick: function (valuation) {
                var newValuation = valuation;
                if (selectedPredicate == null) {
                    selectedPredicate = Object.create(Node);
                    selectedPredicate.init(sparqlFace.createUriFromName(newValuation.predicate), newValuation.predicate);
                }
                newValuation.setPredicate(selectedPredicate);
                if (selectedValuation == null) ms.getSelectedNode().addValuation(newValuation);
                else {
                    selectedValuation.setPredicate(newValuation.predicate);
                    selectedValuation.setValue(newValuation.value);
                }
                selectedPredicate = null;
                selectedValuation = null;
                PS.publish(M.nodePropsChanged, ms.getSelectedNode());
            },
            
            selectPredicate: function (predicate) {
                selectedPredicate = predicate;
            },
            
            selectValuation: function (valuation) {
                selectedValuation = valuation;
            },
            
            deleteNodeLabel: function (label) {
                if(ms.getSelectedNode() != null) {
                    ms.getSelectedNode().removeLabel(label);
                    PS.publish(M.modelChanged);
                    PS.publish(M.nodePropsChanged, ms.getSelectedNode());
                }
            },
            
            saveLabel: function (text, lang) {
                if (selectedLabel != null) selectedLabel.init(text, lang);
                else {
                    var label = Label(text, lang);
                    ms.getSelectedNode().addLabel(label);
                }
                ms.getSelectedNode().updateLabel();
                PS.publish(M.modelChanged);
                PS.publish(M.nodePropsChanged, ms.getSelectedNode());
                selectedLabel = null;
            },
            
            deleteNodeProperty: function(valuation) {
                ms.getSelectedNode().deleteValuation(valuation);
                PS.publish(M.nodePropsChanged, ms.getSelectedNode());
            },
            
            addTypeFromName: function(typeName) {
                if(typeName!="") {
                    var type = Object.create(RType);
                    type.init(sparqlFace.createUriFromName(typeName), typeName, null);
                    model.addTypeToNode(ms.getSelectedNode(), type);
                    PS.publish(M.nodePropsChanged, ms.getSelectedNode());
                }
            },
            
            addTypeFromSelection: function(type) {
                model.addTypeToNode(ms.getSelectedNode(), type);
                PS.publish(M.nodePropsChanged, ms.getSelectedNode());
            },
        
            deleteNodeType: function(type) {
                if(ms.getSelectedNode() != null) {
                    ms.getSelectedNode().deleteType(type);
                    PS.publish(M.modelChanged);
                    PS.publish(M.nodePropsChanged, ms.getSelectedNode());
                }
            },
            
            delButtonClick: function() {
                if(ms.getSelectedNode() != null) {
                    model.removeNode(ms.getSelectedNode());
                    PS.publish(M.selNodeDeleted);
                    PS.publish(M.modelChanged);
                }
            },
            
            addNode: function(uri, name) {
                /*var node = Object.create(Node);
                node.init(uri, name);
                node.x = this.newNodeLocation[0];
                node.y = this.newNodeLocation[1];
                this.showEntityWidget(false);
                this.model.addNode(node);*/
                var node = model.addNodeFromUri(uri, name, ms.getNewNodeLocation());
            
                if(ms.isLearning()) {
                    sparqlFace.initLinkFinding();
                    for(var i=0; i<model.nodes.length-1; i++) {
                        sparqlFace.findLinksBetween(model.nodes[i], node);
                    }
                }
                else {
                    sparqlFace.addRelatedNodesFor(node); //.getRelatedNodes(node);
                }
                return node;
            }
        };
    
    return {
        initAll: function() {
            PS.subscribe(M.suggestionEntitySelect, function(msg, data){
                internal.addNode(data.uri, data.name);
            });
            PS.subscribe(M.modelReset, function(msg,data){
                model = data;
            });
            PS.subscribe(M.entityInputEnter, function(msg, data){
                internal.addNode(sparqlFace.createUriFromName(data), data);
            });
            
            PS.subscribe(M.btnSaveLiteral, function(msg, valuation) {
               internal.saveLiteralButtonClick(valuation)
            });
            PS.subscribe(M.btnEditValuation, function(msg,data) {
                selectedPredicate = null;
                internal.selectValuation(data);
            });
            PS.subscribe(M.btnDeleteValuation, function(msg,data) {
                internal.deleteNodeProperty(data);
            });
            PS.subscribe(M.btnAddLiteral, function() {
                selectedPredicate = null;
            });
            
            
            PS.subscribe(M.suggestionPropertySelect, function(msg,data) {
                internal.selectPredicate(data);
            });
            PS.subscribe(M.literalPredicateInputKeyUp, function() {
                internal.selectPredicate(null);
            });
            
            PS.subscribe(M.suggestionTypeSelect, function(msg, type) {
                internal.addTypeFromSelection(type);
            });
            PS.subscribe(M.typeInputEnter, function(msg, typeName) {
                internal.addTypeFromName(typeName);
            });
            
            PS.subscribe(M.btnNodeDelete, function() {
                internal.delButtonClick();
            });
            
            PS.subscribe(M.btnDeleteNodeType, function(msg, data) {
                internal.deleteNodeType(data);
            });
            
            PS.subscribe(M.btnDeleteLabel, function(msg, label) {
                internal.deleteNodeLabel(label);
            });
            PS.subscribe(M.btnAddLabel, function() {
                selectedLabel = null;
            });
            PS.subscribe(M.btnEditLabel, function(msg, label) {
                selectedLabel = label;
            });
            PS.subscribe(M.btnSaveLabel, function(msg, label) {
                internal.saveLabel(label.text, label.lang);
            });
        }
    };
    
};

module.exports = NodeControl;