var M = require('../vocab/messages');
var Label = require('../model/Label');
var PS = require('pubsub-js');
var d3 = require('d3');
var $ = require('jquery-browserify');

var LabelSelection = function(modelState) {
    var ms = modelState;
    var hide = function hide() {
        d3.select('#entityLabelWidget')
            .style("display", "none");
    };
    var showLabelInput = function showLabelInput(node, label) {
        d3.select('#entityLabelWidget')
            .style("display", "block")
            .style("left", node.x + "px")
            .style("top", (node.y + 120) + "px");
        
        if (label != null) {
            $('#entityLabelField').val(label.text);
            $('#labelLangField').val(label.lang);
        }
        else {
            $('#entityLabelField').val("");
            $('#labelLangField').val("");
        }
        
        d3.select('#saveLabelButton').on('click', function () {
            PS.publish(M.btnSaveLabel, Label($('#entityLabelField').val(), $('#labelLangField').val()));
            hide();
        });
    };
    
    var init = function init() {
        PS.subscribe(M.btnEditLabel, function(msg, label) {
            showLabelInput(ms.getSelectedNode(), label);
        });
        PS.subscribe(M.btnAddLabel, function() {
            showLabelInput(ms.getSelectedNode(), null);
        });
    };
    
    init();
    
    return {
        show: showLabelInput,
        hide: hide
    }
};

module.exports = LabelSelection;