/**
 * Created by marek on 30.6.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js');
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');

var NodeButtons = function(drawingCanvas) {
    var literalButton,
        linkButton,
        typeButton,
        delButton,
        canvas = drawingCanvas;
    var internal = {
        createLiteralButton: function () {
            literalButton = canvas.append("image")
                .attr("xlink:href", "png/glyphicons-31-pencil.png")
                .style("visibility", "hidden")
                .attr('width', 24)
                .attr('height', 24)
                .on("click", function(){
                    PS.publish(M.btnNodeLiteral);
                    d3.event.stopPropagation();
                }); //RKnown.control.literalButtonClick.bind(RKnown.control));
        },
    
        createLinkButton: function () {
            linkButton = canvas.append("image")
                .attr("xlink:href", "png/glyphicons-212-arrow-right.png")
                .style("visibility", "hidden")
                .attr('width', 20)
                .attr('height', 18)
                .on("click", function(){
                    PS.publish(M.btnNodeLink);
                    d3.event.stopPropagation();
                });//RKnown.control.linkButtonClick.bind(RKnown.control));
        },
    
        createTypeButton: function () {
            typeButton = canvas.append("image")
                .attr("xlink:href", "png/glyphicons-501-education.png")
                .style("visibility", "hidden")
                .attr('width', 27)
                .attr('height', 19)
                .on("click", function(){
                    PS.publish(M.btnNodeType);
                    d3.event.stopPropagation();
                });//RKnown.control.typeButtonClick.bind(RKnown.control));
        },
    
        createDeleteNodeButton: function () {
            delButton = canvas.append("image")
                .attr("xlink:href", "png/glyphicons-208-remove.png")
                .style("visibility", "hidden")
                .attr('width', 18)
                .attr('height', 18)
                .on("click", function(){
                    PS.publish(M.btnNodeDelete);
                    d3.event.stopPropagation();
                });//RKnown.control.delButtonClick.bind(RKnown.control));
        },
    
        showNodeButtons: function (x, y) {
            linkButton.attr('transform', "translate(" + (x + 10) + "," + (y - 50) + ")");
            linkButton.style("visibility", "visible");
            typeButton.attr('transform', "translate(" + (x - 30) + "," + (y - 50) + ")");
            typeButton.style("visibility", "visible");
            literalButton.attr('transform', "translate(" + (x - 70) + "," + (y - 50) + ")");
            literalButton.style("visibility", "visible");
            delButton.attr('transform', "translate(" + (x - 110) + "," + (y - 50) + ")");
            delButton.style("visibility", "visible");
        },
    
        hideNodeButtons: function () {
            linkButton.style("visibility", "hidden");
            typeButton.style("visibility", "hidden");
            literalButton.style("visibility", "hidden");
            delButton.style("visibility", "hidden");
        }
    };
    
    internal.createDeleteNodeButton();
    internal.createLinkButton();
    internal.createTypeButton();
    internal.createLiteralButton();
      
    
    return {
        show: function(location) {
            internal.showNodeButtons(location.x, location.y);
        },
        hide: function() {internal.hideNodeButtons();}
    };
};

module.exports = NodeButtons;
    
    