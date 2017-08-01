/**
 * Created by marek on 30.6.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js')
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');
var $ = require('jquery-browserify');
require('bootstrap/js/modal');


var GraphList = function() {
    var graphsElement = d3.select("#graphs"),
        selectedGraph,
        
        deletionConfirmed = function() {
            PS.publish(M.btnGraphDelete, selectedGraph);
            $('#dlgConfirmDeleteGraph').modal('hide');
        },
        
        getGraphsD3 = function() {
            return graphsElement.selectAll("p");
        },
        
        init = function init() {
            d3.select('#btnConfirmDelete').on('click', deletionConfirmed);
        };
    
    init();
    
    return {
        updateGraphList: function (msg, graphsData) {
            var graphs = getGraphsD3().data(graphsData, function(d) {return d.uri;}); //RKnown.control.graphs);
            var graphPs = graphs.enter().append("p");
        
            graphPs.append("a")
                .attr("href", "#")
                .text(function (d) {
                    return UriTools.nameFromUri(d.uri);
                })
                .on("click", function (d) {
                    PS.publish(M.btnGraphLoad, d.uri);
                    //RKnown.control.loadGraph(d.uri);
                });
        
            graphPs.append("img")
                .attr("src", "png/glyphicons-223-share.png")
                .on("click", function (d) {
                    PS.publish(M.btnGraphShare, d);
                    //RKnown.control.getGraphLink(d);
                });
        
            graphPs.append("img")
                .attr("src", "png/glyphicons-208-remove.png")
                .on("click", function (d) {
                    selectedGraph = d;
                    $('#dlgConfirmDeleteGraph').modal('show');
                    //RKnown.control.getGraphLink(d);
                });
            
            graphs.exit().remove();
        }
    }
};

module.exports = GraphList;