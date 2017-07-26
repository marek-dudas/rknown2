/**
 * Created by marek on 7.7.2017.
 */

var utils = require('./ViewUtils');
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var $ = require('jquery-browserify');
var d3 = require('d3');

var TypeSelection = function(typeInputFieldId, modelState) {
    var typeInputField = typeInputFieldId,
        isVisible = false,
        self,
        ms = modelState,
        
        showTypeSelection = function (visible) {
            //this.justShownSuggestions = true;
            isVisible = visible;
            d3.select('#typeSelection').style("display", visible ? "block" : "none");
            if(visible) {
                $(typeInputField).val("");
                $(typeInputField).focus();
                utils.moveNextTo(ms.getSelNodeElement(), '#typeSelection');
            }
            else {
                PS.publish(M.windowClosed, self);
            }
        };
        
        init = function() {
            $(typeInputField).keyup(function(e){
                if(e.keyCode == 13)
                {
                    //$(this).trigger("enterKey");
                    PS.publish(M.typeInputEnter, $(typeInputField).val());
                    showTypeSelection(false);
                }
                else {
                    //RKnown.control.typeInputControl.keyPressed();
                    PS.publish(M.typeInputKeyUp, $(typeInputField).val());
                }
            });
            PS.subscribe(M.suggestionTypeSelect, function(msg, data){
                showTypeSelection(false);
            });
        };
        
        init();
        
        return {
            show: function(visible) {
                showTypeSelection(visible);
            },
            visible: function() {
                return isVisible;
            }
        };
};

module.exports = TypeSelection;