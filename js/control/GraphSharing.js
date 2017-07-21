/**
 * Created by marek on 3.7.2017.
 */
var RSettings = require('../settings/appSettings.js');
var $ = require('jquery-browserify');
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var ViewUtils = require('../view/ViewUtils')

var GraphSharing = function GraphSharing(_modelStateInstance) {
    var modelState = _modelStateInstance,
    
        getGraphLink = function (msg, graph) {
            $.get("server/get-graph-link.php?graph=<" + graph + ">&token=" + modelState.getUserToken(), null, function (response) {
                $('#graphUrlP').text(response);
                $('#graphUrlMessage').show();
            });
        };
    
    PS.subscribe(M.btnGraphShare, getGraphLink);
    
    $('#graphUrlP').on('click', function() {
        ViewUtils.selectText('graphUrlP');
    });
};

module.exports = GraphSharing;
