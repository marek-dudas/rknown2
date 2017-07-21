/**
 * Created by marek on 9.7.2017.
 */

var d3 = require('d3');
var PS = require('pubsub-js')
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');
var $ = require('jquery-browserify');

var GraphNaming = function() {
    d3.select("#btnSave").on("click", function(){
        PS.publish(M.btnGraphSave, $("#modelNameField").val());
    });
    
    var api = {
        displayGraphName: function(msg, model) {
            $("#modelNameField").val(model.getGraphName());
        }
    };
    
    PS.subscribe(M.modelReset, api.displayGraphName);
    
    return api;
};

module.exports = GraphNaming;