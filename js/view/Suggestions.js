/**
 * Created by marek on 30.6.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js');
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');

//TODO expects #suggestionTable in config suggestionsElement
var Suggestions = function(config) {
    var suggestionsElement = d3.select(config.suggestionsElement);
    var relatedInputField = config.inputFieldId;
    var parentWindow = config.parent || null;
    var getSuggestionsD3 = function() {
        return suggestionsElement.selectAll("tr");
    };
    var hide = function() {
        d3.select("#suggestionsWidget").style("display", "none");
    };
    
    var internal = {
        updateSuggestions: function (data) {
            //this.suggestions.selectAll('tr').remove();
            d3.select('.no-records-found').remove();
            var suggestions = getSuggestionsD3().data(data, function (d) {
                if (d !== undefined) return d.uri;
                else return 0;
            });
            var suggestionsEnter = suggestions.enter().append("tr")
                .on("click", function (d) {
                    //RKnown.control.addEntity(d.uri, d.name);
                    d3.select("#suggestionsWidget").style("display", "none");
                    PS.publish(M.suggestionEntitySelect, d);
                })
                .on('mouseover', function () {
                    d3.select(this).style("background", "#ddd")
                })
                .on('mouseleave', function () {
                    d3.select(this).style("background", "#fff")
                });
            suggestionsEnter.append("td").append("a")
                .attr("href", "#")
                .text(function (d) {
                    return d.name;
                });
            suggestionsEnter.append("td").text(function (d) {
                d.getComment();
            });
            suggestions.exit().remove();
            if (data.length > 0) d3.select("#suggestionsWidget").style("display", "block");
            else hide();
            //if (isExtra) d3.select("#searchingMore").style("display", "none");
            //else d3.select("#searchingMore").style("display", "block");
            //$("#suggestionTable").bootstrapTable();
            d3.select("#searchingMore").style("display", "none");
        },
    
        updateTypeSuggestions: function (data) {
            //this.suggestions.selectAll('tr').remove();
            if (data.length > 0) {
                d3.select('.no-records-found').remove();
                var suggestions = getSuggestionsD3().data(data, function (d) {
                    if (d !== undefined) return d.uri;
                    else return 0;
                });
                var suggestionsEnter = suggestions.enter().append("tr").on("click", function (d) {
                        //RKnown.control.setTypeFromField(d);
                        d3.select("#suggestionsWidget").style("display", "none");
                        PS.publish(M.suggestionTypeSelect, d);
                    })
                    .on('mouseover', function () {
                        d3.select(this).style("background", "#ddd")
                    })
                    .on('mouseleave', function () {
                        d3.select(this).style("background", "#fff")
                    });
                suggestionsEnter.append("td").append("a")
                    .attr("href", "#")
                    .text(function (d) {
                        return "#" + d.label;
                    });
                suggestions.exit().remove();
                d3.select("#suggestionsWidget").style("display", "block");
            }
            else hide();
            d3.select("#searchingMore").style("display", "none");
            //$("#suggestionTable").bootstrapTable();
        },
    
        updatePropSuggestions: function (data) {
            //this.suggestions.selectAll('tr').remove();
            d3.select('.no-records-found').remove();
            var suggestions = getSuggestionsD3().data(data, function (d) {
                if (d !== undefined) return d.uri;
                else return 0;
            });
            var suggestionsEnter = suggestions.enter().append("tr")
                .on("click", function (d) {
                    //RKnown.control.predicateSelected(d);
                    d3.select("#suggestionsWidget").style("display", "none");
                    //RKnown.control.showPredicateSelection(false);
                    PS.publish(M.suggestionPropertySelect, d);
                })
                .on('mouseover', function () {
                    d3.select(this).style("background", "#ddd")
                })
                .on('mouseleave', function () {
                    d3.select(this).style("background", "#fff")
                });
            suggestionsEnter.append("td").append("a")
                .attr("href", "#")
                .text(function (d) {
                    return d.name;
                })
                .on("click", function (d) {
                    RKnown.control.predicateSelected(d);
                    /*RKnown.control.creationLink.setUri(d.uri);
                     RKnown.control.creationLink.setName(d.name);*/
                    d3.select("#suggestionsWidget").style("display", "none");
                    RKnown.control.showPredicateSelection(false);
                });
            suggestions.exit().remove();
            if (data.length > 0) d3.select("#suggestionsWidget").style("display", "block");
            else hide();
            d3.select("#searchingMore").style("display", "none");
            //$("#suggestionTable").bootstrapTable();
        },
        
        setLocation: function(inputFieldId) {
            if(parentWindow ==null || parentWindow.visible()) {
                d3.select("#suggestionsWidget").style("left", $(inputFieldId).offset().left + "px")
                    .style("top", ($(inputFieldId).offset().top + $(inputFieldId).outerHeight()) + "px");
            }
            else {
                hide();
            }
        },
        
        subscribe: function subscribe() {
            PS.subscribe(M.windowClosed, function(msg, data) {
                if(data == parentWindow) hide();
            });
        }
    
    };
    
    internal.subscribe();
    
    return {
        showTypes: function(data) {internal.updateTypeSuggestions(data); internal.setLocation(relatedInputField); },
        showEntities: function(data, isExtra) {internal.updateSuggestions(data, isExtra); internal.setLocation(relatedInputField); },
        showProperties: function(data) {internal.updatePropSuggestions(data); internal.setLocation(relatedInputField); },
        hide: hide
    }
};

module.exports = Suggestions;
