/**
 * Created by marek on 30.6.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js');
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');

//TODO expects #suggestionTable in config suggestionsElement
var Suggestions = function(config) {
    var suggestions = d3.select(config.suggestionsElement)
        .selectAll("tr");
    var relatedInputField = config.inputFieldId;
    
    var internal = {
        updateSuggestions: function (data, isExtra) {
            //this.suggestions.selectAll('tr').remove();
            d3.select('.no-records-found').remove();
            suggestions = suggestions.data(data, function (d) {
                if (d !== undefined) return d.uri;
                else return 0;
            });
            var suggestionsEnter = this.suggestions.enter().append("tr")
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
            if (data.length > 0 || !isExtra) d3.select("#suggestionsWidget").style("display", "block");
            else d3.select("#suggestionsWidget").style("display", "none");
            if (isExtra) d3.select("#searchingMore").style("display", "none");
            else d3.select("#searchingMore").style("display", "block");
            //$("#suggestionTable").bootstrapTable();
        },
    
        updateTypeSuggestions: function (data) {
            //this.suggestions.selectAll('tr').remove();
            if (data.length > 0) {
                d3.select('.no-records-found').remove();
                suggestions = suggestions.data(data, function (d) {
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
            else d3.select("#suggestionsWidget").style("display", "none");
            //$("#suggestionTable").bootstrapTable();
        },
    
        updatePropSuggestions: function (data) {
            //this.suggestions.selectAll('tr').remove();
            d3.select('.no-records-found').remove();
            suggestions = suggestions.data(data, function (d) {
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
            else d3.select("#suggestionsWidget").style("display", "none");
            //$("#suggestionTable").bootstrapTable();
        },
        
        setLocation: function(inputFieldId) {
            d3.select("#suggestionsWidget").style("left", $(inputFieldId).offset().left + "px")
                .style("top", ($(inputFieldId).offset().top + $(inputFieldId).outerHeight()) + "px");
        }
    
};
    
    return {
        showTypes: function(data) {internal.setLocation(relatedInputField); internal.updateTypeSuggestions(data);},
        showEntities: function(data) {internal.setLocation(relatedInputField); internal.updateSuggestions(data.data, data.isExtra)},
        showProperties: function(data) {internal.setLocation(relatedInputField); internal.updatePropSuggestions(data)}
    }
};

module.exports = Suggestions;
