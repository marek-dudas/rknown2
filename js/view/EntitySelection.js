/**
 * Created by marek on 7.7.2017.
 */
var RSettings = require('../settings/appSettings.js');
var d3 = require('d3');
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var $ = require('jquery-browserify');
var Utils = require('./ViewUtils');

var EntitySelection = function EntitySelection(inputFieldId, modelState) {
    var inputFieldId = inputFieldId,
        ms = modelState,
        isVisible = false,
        self,
        show = function show(visible) {
            isVisible = visible;
            d3.select('#newEntityWidget').style("display", visible ? "block" : "none");
            if(visible==false) {
                PS.publish(M.windowClosed, self);
            }
            else {
                PS.publish(M.windowOpened, self);
            }
        };
    
    var internal = {
        showEntityWidget: function (visible, location) {
            show(visible);
            if (visible) {
                //this.justShownSuggestions = true;
                $(inputFieldId).focus();
                $(inputFieldId).val("");
                //Utils.moveToMousePos(d3.select('#newEntityWidget'));
                if(location) {
                    Utils.moveElement('#newEntityWidget', location);
                }
                else {
                    Utils.moveNextTo(ms.getSelNodeElement(), '#newEntityWidget');
                }
            }
        },
        init: function() {
            $(inputFieldId).keyup(function (e) {
                if (e.keyCode == 13) {
                    PS.publish(M.entityInputEnter, $(this).val());
                    show(false);
                }
                else {
                    if ($(this).val() != "") {
                        //RKnown.control.entityInputControl.keyPressed();
                        PS.publish(M.entityInputKeyUp, $(this).val())
                    }
                    else d3.select("#suggestionsWidget").style("display", "none");
                }
            });
            PS.subscribe(M.canvasDblClick, function(msg,data){
                var location = {x:data.windowMouse[0], y:data.windowMouse[1]};
                internal.showEntityWidget(true, location);
            });
            PS.subscribe(M.suggestionEntitySelect, function(msg, data){
                internal.showEntityWidget(false);
            });
        }
    };
    
    
    
    internal.init();
    
    self = {
        show: function() {
            internal.showEntityWidget(true);
        },
        hide: function() {
            internal.showEntityWidget(false);
        },
        visible: function() {
            return isVisible;
        }
    };
    return self;
};

module.exports = EntitySelection;
//TODO listen to dblclick this.showEntityWidget(true);