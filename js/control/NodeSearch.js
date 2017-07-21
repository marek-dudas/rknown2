/**
 * Created by marek on 3.7.2017.
 */
var PS = require('pubsub-js');
var M = require('../vocab/messages');

var NodeSearch = function NodeSearch() {
    var model;
    var highlightSearch = function (searchText) {
        for (var i = 0; i < model.nodes.length; i++) {
            var node = model.nodes[i];
            if (searchText != "" && node.name.includes(searchText)) node.searchHighlight = true;
            else node.searchHighlight = false;
        }
        PS.publish(M.modelChanged);
    };
    
    return {
        initAll: function() {
            PS.subscribe(M.nodeSearchEnter, function(msg, value) {
                highlightSearch(value);
            })
        }
    };
};

module.exports = NodeSearch;