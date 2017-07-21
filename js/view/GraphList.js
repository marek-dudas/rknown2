/**
 * Created by marek on 30.6.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js')
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');

var GraphList = function() {
    var graphs = d3.select("#graphs").selectAll("p");
    
    return {
        updateGraphList: function (msg, graphsData) {
            graphs = graphs.data(graphsData); //RKnown.control.graphs);
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
        }
    }
};

module.exports = GraphList;