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
    var wantNewSuggestions = true;
    var suggestions = [];
    
    function NotInSuggestions(object) {
        var isThere = false;
        suggestions.forEach(function (s) {
            if (s.uri == object.uri) isThere = true;
        });
        
        return !isThere;
    }
    
    function IsRelevantFor(object, inputString) {
        if(inputString == "") return false;
        var uppercasedInput = inputString.toUpperCase();
        if(object.uri.toUpperCase().includes(uppercasedInput) || object.name.toUpperCase().includes(uppercasedInput)) return true;
        else return false;
    }
    
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
    
    function sendSuggestionsToView(objects) {
        var currentTextInput = $(valElement).val();
        if (currentTextInput != "") {
            for (var i = 0; i < objects.length; i++) {
                if(IsRelevantFor(objects[i], currentTextInput) && NotInSuggestions(objects[i])) suggestions.push(objects[i]);
            }
        }
        for (var j = 0; j < suggestions.length; j++) {
            if(!IsRelevantFor(suggestions[j], currentTextInput)) {
                suggestions.splice(j, 1);
                j--;
            }
        }
        if(wantNewSuggestions) suggestionsViewCallback(suggestions);
        /*
        if (areRelevant || objects.length == 0) {
            suggestionsViewCallback(objects);
            //PS.publish(publishMessage, {objects: objects, isExtra: isExtra});
        }*/
    }
    
    function searchForTypeSuggestions() {
        var userInput = $(valElement).val();
        var suggestedTypes = [];
        if(userInput != "") {
            for (var i = 0; i < model.types.length; i++) {
                var type = model.types[i];
                if (type.label.includes(userInput)) suggestedTypes.push(type);
            }
        }
        sendSuggestionsToView(suggestedTypes);
        //PS.publish(publishMessage, {objects: suggestedTypes, isExtra: false});
    }
    
    function searchForSuggestions() {
        //SparqlFace.textSearch($(textSource).val(), type, sendSuggestionsToView); //function(objects){RKnown.view.updateSuggestions(objects);})
        wantNewSuggestions = true;
        PS.publish(M.suggestionTextSearchRequest, {searchFor: $(valElement).val(), type: elementType, callback: sendSuggestionsToView});
    }
    
    if(elementType == URIS.type) timeControl = SuggestionsTimeControl(searchForTypeSuggestions);
    else timeControl = SuggestionsTimeControl(searchForSuggestions);
    
    PS.subscribe(M.modelReset, function(msg, resetModel) {
        model = resetModel;
    });
    
    PS.subscribe('suggestion.*.selected', function(){
        wantNewSuggestions = false;
    });
    PS.subscribe(M.suggestionCancel, function(){
        wantNewSuggestions = false;
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