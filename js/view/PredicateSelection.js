/**
 * Created by marek on 7.7.2017.
 */
var utils = require('./ViewUtils');
var PS = require('pubsub-js');
var $ = require('jquery-browserify');
var M = require('../vocab/messages');
var d3 = require('d3');

var PredicateSelection = function(inputFieldId, modelState) {
    var inputField = inputFieldId,
        ms = modelState;
    var show = function (visible) {
        d3.select('#predicateSelection').style("display", visible ? "block" : "none");
        if (visible) {
            //this.justShownSuggestions = true;
            $(inputField).focus();
            $(inputField).val("");
            //utils.moveToMousePos(d3.select('#predicateSelection'));
            utils.moveNextTo(ms.getSelNodeElement(), '#predicateSelection');
        }
    };
    var init = function() {
        $(inputField).keyup(function(e){
            if(e.keyCode == 13)
            {
                PS.publish(M.predicateInputEnter, $(inputField).val());
            }
            else {
                if($(this).val() != "") {
                    PS.publish(M.predicateInputKeyUp, $(inputField).val());
                }
            }
        });
        PS.subscribe(M.suggestionPropertySelect, function(msg, data) {
            show(false);
        });
    };
    
    init();
    
    return {
        show: show
    }
};

module.exports = PredicateSelection;