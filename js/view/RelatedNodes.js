/**
 * Created by marek on 30.6.2017.
 */
var RSettings = require('../settings/appSettings.js');
var d3 = require('d3');
var PS = require('pubsub-js');
var M = require('../vocab/messages');

var RelatedNodes = function(viewCanvas, _mainCanvas, width, height) {
    var relatedCanvas = d3.select("#" + viewCanvas),
        mainCanvas = _mainCanvas,
        relatedSvg = relatedCanvas.append("svg").attr("width", width).attr("height", height),
        relatedNodesGroup = relatedSvg.append("svg:g"), //.selectAll("g"),
        nodesArray = [],
        model,
        dragSvg,
        draggedNode = null,
    
        getNodesD3 = function getNodesD3() {
            return relatedNodesGroup.selectAll("g");
        },

        setDraggedNode = function (node) {
            draggedNode = node.copy();
        
            dragSvg = d3.select("body").append("svg").style("position", "absolute")
                .style("z-index", 9999)
                .attr("overflow", "visible")
                .style("overflow", "visible !important")
                .attr("width", node.width)
                .attr("height", node.height);
        
            var dragButton = dragSvg.append("g").classed("node", true);
        
            var button = dragButton.append("path").attr("d", node.getPathData());
        
            dragButton.append("text").text(node.name)
                .attr("text-anchor", "middle")
                .attr("x", "0") //width/2+5)
                .attr("y", "0")
                .attr("dx", 1)
                .attr("dy", ".35em");
        
            var w = d3.select(window)
                .on("mousemove", mousemove)
                .on("mouseup", mouseup);
        
            d3.event.preventDefault(); // disable text dragging
        
            function mousemove() {
                dragSvg.style("left", d3.mouse(d3.select("body").node())[0] + "px").style("top", d3.mouse(d3.select("body").node())[1] + node.height + "px");
            }
        
            function mouseup() {
                w.on("mousemove", null).on("mouseup", null);
                dragSvg.remove();
                PS.publish(M.relNodePlaced, {location: d3.mouse(mainCanvas.node()), placedNode: draggedNode});
                //RKnown.control.putRelatedNode(d3.mouse(RKnown.view.svg.node()));
            }
        },
            
        nodeInArray = function nodeInArray(node) {
            for(var i=0; i<nodesArray.length; i++) {
                if(nodesArray[i].uri == node.uri) return true;
            }
            return false;
        },
            
        storeNodes = function storeNodes(nodes) {
            for(var i=0; i<nodes.length; i++) {
                if(!nodeInArray(nodes[i])) nodesArray.push(nodes[i]);
            }
        },
        
        getWidth = function getWidth() {
            return relatedSvg.node().getBoundingClientRect().width;
        },
        
        layoutNodes = function layoutNodes() {
            var x =0 ,y =0, n;
            for (var i=0; i<nodesArray.length; i++) {
                n = nodesArray[i];
                x+=n.width/2;
                if(y<=0) y = n.height/2;
                if(x + n.width/2 > getWidth()) {
                    x = n.width/2;
                    y += n.height;
                }
                n.x = x;
                n.y = y;
                x += n.width/2;
            }
            getNodesD3().data(nodesArray, function(d){return d.uri}).attr('transform', function (d) {
                return 'translate( ' + d.x + ', ' + d.y + ')';
            });
        },
        
        updateRelated = function updateRelated(nodesData) {
            storeNodes(nodesData);
            var relatedNodes = getNodesD3().data(nodesArray, function(d){return d.uri});
            var nodesEnter = relatedNodes.enter().append("g")
                .classed("node", true)
                .on("mousedown", function (d) {
                    //RKnown.control.relatedNodeMouseDown(d);
                    //PS.publish(M.relNodeMouseDown, d);
                    setDraggedNode(d);
                });
            nodesEnter.append("path")
                .attr("d", function (d) {
                    return d.getPathData();
                });
            
            nodesEnter.append("text")
                .classed("nodename", true)
                .text(function (d) {
                    return d.name;
                })
                .style("font-size", function (d) {
                    return Math.max(Math.min(16, Math.min(d.width, (d.width - 8)
                            / this.getComputedTextLength() * 14)), 13) + "px";
                })
                .attr("x", "0")//function(d) {return d.width/2+2;})
                .attr("y", "0")
                .attr("dx", 1)
                .attr("dy", ".35em");
            
            //this.nodes.selectAll(".nodename").text(function(d) {return d.name;});
            
            relatedNodes.exit().remove();
            layoutNodes();
        },
        subscribe = function() {
            PS.subscribe(M.modelReset, function(msg, data) {model = data;});
        };
    
    subscribe();
        
    
    return {
        /*
        newRelatedNodes: function(msg, nodes) {
            var x=RSettings.nodeWidth/2;
            var y=RSettings.nodeHeight;
            var svgWidth = getRelatedSvgWidth();
            if(relatedNodesArray.length>0) {
                x = relatedNodesArray[relatedNodesArray.length-1].x+RSettings.nodeWidth;
                y = relatedNodesArray[relatedNodesArray.length-1].y+RSettings.nodeHeight;
            }
            for(var i=0; i<nodes.length; i++) {
                var node = nodes[i];
                var isNew = true;
                for(var j=0; j<relatedNodesArray.length; j++) {
                    if(relatedNodesArray[j].uri == node.uri) isNew = false;
                }
                if(isNew && this.model.getNodeByUri(node.uri) == null) {
                    if(x+RSettings.nodeWidth/2>svgWidth) {
                        x=RSettings.nodeWidth/2;
                        y+=RSettings.nodeHeight;
                    }
                    node.x=x;
                    node.y=y;
                    x+=RSettings.nodeWidth;
                    relatedNodesArray.push(node);
                }
            }
            updateRelated();
        },*/
        modelReset: function modelReset(msg, newModel) {
            model = newModel;
        },
        updateSize: function updateSize(height) {
            var currentSize = relatedCanvas.node().getBoundingClientRect();
            relatedSvg.attr("width", currentSize.width).attr("height", height);
            layoutNodes();
        },
        processNodes: function processNodes(msg, nodes) {
            updateRelated(nodes);
        }
    };
};

module.exports = RelatedNodes;