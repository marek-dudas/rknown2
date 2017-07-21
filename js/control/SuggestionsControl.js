/**
 * Created by marek on 3.7.2017.
 */
var URIS = require('../vocab/uris');
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var RSettings = require('../settings/appSettings');

var SuggestionsControl = function SuggestionsControl(suggestedElementType,
                                                     searchValueElement,
                                                     viewCallback) {
    
    var elementType = suggestedElementType;
    var suggestionsViewCallback = viewCallback;
    var valElement = searchValueElement;
    var timeControl;
    var model;
    
    function SuggestionsTimeControl(searchCallback) {
        
        var searchSuggestionsCallback = searchCallback;
        var lastTickCount = 0;
        
        return {
            
            keyPressed: function () {
                var now = new Date();
                lastTickCount = now.getTime();
                setTimeout(this.checkWaitAndCall.bind(this), RSettings.suggestionWaitTime);
            },
            
            checkWaitAndCall: function () {
                if (this.suggestionsWaited()) {
                    searchSuggestionsCallback();
                }
            },
            
            suggestionsWaited: function () {
                var now = new Date();
                var ticks = now.getTime();
                var waitedLongEnough = ( (ticks - lastTickCount) >= RSettings.suggestionWaitTime );
                return waitedLongEnough;
            }
        };
    }
    
    function sendSuggestionsToView(objects, isExtra) {
        var areRelevant = false;
        var currentTextInput = $(valElement).val();
        if (currentTextInput == "") return null;
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].uri.includes(currentTextInput) || objects[i].name.includes(currentTextInput)) areRelevant = true;
        }
        if (areRelevant) {
            suggestionsViewCallback(objects, isExtra);
            //PS.publish(publishMessage, {objects: objects, isExtra: isExtra});
        }
    }
    
    function searchForTypeSuggestions() {
        var userInput = $(valElement).val();
        var suggestedTypes = [];
        for (var i = 0; i < model.types.length; i++) {
            var type = model.types[i];
            if (type.label.includes(userInput)) suggestedTypes.push(type);
        }
        sendSuggestionsToView(suggestedTypes, false);
        //PS.publish(publishMessage, {objects: suggestedTypes, isExtra: false});
    }
    
    function searchForSuggestions() {
        //SparqlFace.textSearch($(textSource).val(), type, sendSuggestionsToView); //function(objects){RKnown.view.updateSuggestions(objects);})
        PS.publish(M.suggestionTextSearchRequest, {searchFor: $(valElement).val(), type: elementType, callback: sendSuggestionsToView});
    }
    
    if(elementType == URIS.type) timeControl = SuggestionsTimeControl(searchForTypeSuggestions);
    else timeControl = SuggestionsTimeControl(searchForSuggestions);
    
    PS.subscribe(M.modelReset, function(msg, resetModel) {
        model = resetModel;
    });
    
    return {
        setModel: function setModel(msg, resetModel) {
            model = resetModel;
        },
        processKeyUp: function processKeyUp(msg, searchValue) {
            timeControl.keyPressed();
        }
    };
};

module.exports = SuggestionsControl;