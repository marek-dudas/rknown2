/**
 * Created by marek on 30.6.2017.
 */
var PS = require('pubsub-js');
var M = require('../vocab/messages');


var ModelState = (function() {
    var instance;
    
    function init() {
        var selectedNode = null,
            linkStart = null,
            selectedLabel = null,
            blankNode = null,
            newNodeLocation = null,
            userToken = null,
            userMail = null,
            learning = false,
            selNodeElement = null,
            linkCreationInProgress = false,
            model,
            nodeSelection = function nodeSelection(msg, data) {
                for(var i=0; i<model.nodes.length; i++){
                    model.nodes[i].selected = false;
                }
                if(data.node!=null) {
                    data.node.selected = true;
                    //this.view.showNodeButtons(node.x, node.y);
                }
                selectedNode = data.node;
                selNodeElement = data.nodeElement;
                PS.publish(M.modelChanged);
            },
            canvasClick = function canvasClick(msg, location) {
                //if(blankNode != null)
                nodeSelection(null, {node:null, nodeElement:null});
            },
            dblClick = function dblClick(msg, data) {
                newNodeLocation = {x: data.canvasMouse[0], y: data.canvasMouse[1]};
            },
            learningChange = function(msg, isSet) {
                learning = isSet;
            };
                        
        return {
            getSelectedNode: function getSelectedNode() {
                return selectedNode;
            },
            getSelNodeElement: function getSelNodeElement() {
                return selNodeElement;
            },
            selectLabel: function selectLabel(label) {
                selectedLabel = label;
            },
            getSelectedLabel: function getSelectedLabel() {
                return selectedLabel;
            },
            isLinkCreation: function isLinkCreation() {
                return linkCreationInProgress;
            },
            setLinkCreation: function(value) {
                linkCreationInProgress = value;
            },
            isLearning: function isLearning() {
                return learning;
            },
            setUser: function(email, token) {
                userToken = token;
                userMail = email;
            },
            getUserToken: function() {
                return userToken;
            },
            getUserEmail: function() {
                return userMail;
            },
            getNewNodeLocation: function() {
                return newNodeLocation;
            },
            setBlankNode: function(node) {
                blankNode = node;
            },
            subscribe: function subscribe() {
                PS.subscribe(M.modelReset, function(msg,data){
                    model = data;
                });
                PS.subscribe(M.nodeMouseOver, nodeSelection);
                PS.subscribe(M.nodeMouseDown, nodeSelection);
                PS.subscribe(M.canvasMouseDown, canvasClick);
                PS.subscribe(M.canvasDblClick, dblClick);
                PS.subscribe(M.learningChanged, learningChange);
                PS.subscribe(M.selNodeDeleted, function(msg, data){
                    nodeSelection(null, {node:null, nodeElement:null});
                });
            }
    
            //listen for canvasMouseDown and nodeMouseOver
            
        };
        
    }
            
    return {
        getInstance: function getInstance() {
            if(!instance) {
                instance = init();
                instance.subscribe();
            }
            return instance;
        }
    };
})();

module.exports = ModelState;

