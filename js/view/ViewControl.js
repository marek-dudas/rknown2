/**
 * Created by marek on 30.6.2017.
 */
var RelatedNodes = require('./RelatedNodes.js');
var NodeProperties = require('./NodeProperties');
var SuggestionsView = require('./Suggestions');
var SuggestionsCtrl = require('../control/SuggestionsControl');
var GraphList = require('./GraphList');
var GraphNaming = require('./GraphNaming');
var GraphSharing = require('../control/GraphSharing');
var ModelState = require('../model/ModelState');
var EntitySelection = require('./EntitySelection');
var LiteralSelection = require('./LiteralSelection');
var MainView = require('./MainView');
var NodeButtons = require('./NodeButtons');
var TypeSelection = require('./TypeSelection');
var PredicateSelection = require('./PredicateSelection');
var LabelSelection = require('./LabelSelection');


var M = require('../vocab/messages');
var PS = require('pubsub-js');
var URIS = require('../vocab/uris');

var ViewControl = function() {
    
    var MS = ModelState.getInstance(),
        graphList = GraphList(),
        mainView = MainView({viewingElement: 'canvas', width: 1100, height: 900}),
        relNodesView = RelatedNodes('suggestions', mainView.getCanvas(), 300, 900),
        nodeProps = NodeProperties(MS),
        nodeButtons = NodeButtons(mainView.getCanvas()),
        
        entitySel = EntitySelection("#newEntityField", MS),
        literalSel = LiteralSelection(MS),
        typeSel = TypeSelection("#typeField",MS),
        predicateSel = PredicateSelection("#newPredicateField",MS),
        labelSel = LabelSelection(MS),
        
        typeSuggestions = SuggestionsView({suggestionsElement: "#suggestionTable", inputFieldId: "#typeField", parent: typeSel}),
        entitySuggestions = SuggestionsView({suggestionsElement: "#suggestionTable", inputFieldId: "#newEntityField", parent: entitySel}),
        objectPropertySuggestions = SuggestionsView({suggestionsElement: "#suggestionTable", inputFieldId: "#newPredicateField", parent: predicateSel}),
        dataPropertySuggestions = SuggestionsView({suggestionsElement: "#suggestionTable", inputFieldId: "#literalPredicateField", parent:literalSel}),
        
        typeSugCtrl = SuggestionsCtrl(URIS.type, "#typeField", typeSuggestions.showTypes),
        entitySugCtrl = SuggestionsCtrl(URIS.object, "#newEntityField", entitySuggestions.showEntities),
        dataPropSugCtrl = SuggestionsCtrl(URIS.owlDataProperty, "#literalPredicateField", dataPropertySuggestions.showProperties),
        objPropSugCtrl = SuggestionsCtrl(URIS.owlObjectProperty, "#newPredicateField", objectPropertySuggestions.showProperties),
        
        hideAllPopups = function() {
            nodeButtons.hide();
            entitySel.hide();
            literalSel.hide();
            typeSel.show(false);
            predicateSel.show(false);
            nodeProps.hideNodeProperties();
            labelSel.hide();
            typeSuggestions.hide();
            entitySuggestions.hide();
            objectPropertySuggestions.hide();
            dataPropertySuggestions.hide();
        },
        
        updateSize = function() {
            var height = mainView.updateSize();
            relNodesView.updateSize(height);
        },
        
        suggestionsConfig = function() {
            PS.subscribe(M.entityInputKeyUp, entitySugCtrl.processKeyUp);
            PS.subscribe(M.literalPredicateInputKeyUp, dataPropSugCtrl.processKeyUp);
            PS.subscribe(M.typeInputKeyUp, typeSugCtrl.processKeyUp);
            PS.subscribe(M.predicateInputKeyUp, objPropSugCtrl.processKeyUp);
        },
        
        defaultSubscriptions = function() {
            mainView.subscribe();
    
            PS.subscribe(M.graphListChanged, graphList.updateGraphList);
            PS.subscribe(M.relNodesChanged, relNodesView.processNodes);
    
            PS.subscribe(M.nodeMouseOver, function(msg, data) {
                if(MS.isLinkCreation() == false && MS.isModalActive() == false) {
                    nodeProps.showNodeProperties(msg, data);
                    nodeButtons.show({x: data.node.x + 60, y: data.node.y});
                }
            });
            
            PS.subscribe(M.canvasMouseDown, hideAllPopups);
            //PS.subscribe(M.selNodeDeleted, hideAllPopups);
            
            PS.subscribe(M.modelChanged, function() {
               if(MS.getSelectedNode() == null) {
                   nodeProps.hideNodeProperties();
                   nodeButtons.hide();
               }
            });
            
            PS.subscribe(M.nodePropsChanged, nodeProps.showNodeProperties);
    
            PS.subscribe(M.btnAddLiteral, function (msg, onNode) {
                literalSel.showLiteralInput(onNode, null);
            });
            PS.subscribe(M.btnNodeLiteral, function (msg, onNode) {
                literalSel.showLiteralInput(null, null);
            });
            PS.subscribe(M.btnNodeType, function (msg, onNode) {
                typeSel.show(true);
            });
            PS.subscribe(M.btnEditValuation, function (msg, valuation) {
                literalSel.showLiteralInput(MS.getSelectedNode(), valuation);
            });
            PS.subscribe(M.btnNodeLink, function() {
                hideAllPopups();
            });
    
            PS.subscribe(M.linkCreated, function (msg, data) {
                predicateSel.show(true);
            });
        
            window.addEventListener('resize', updateSize);
    
            window.addEventListener('load', updateSize);
        },
        
        initGraphControl = function() {
            GraphNaming();
            GraphSharing(MS);
        },
        
        initAll = function() {
            initGraphControl();
            defaultSubscriptions();
            suggestionsConfig();
        };
    
    
    return {
        initAll: initAll,
        updateMainView: function() {
            mainView.modelChanged();
        },
        updateSize: updateSize
    }
};

module.exports = ViewControl;