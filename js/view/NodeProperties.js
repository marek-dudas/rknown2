/**
 * Created by marek on 30.6.2017.
 */
//TODO need to keep jscolor in <script>
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var Valuation = require('../model/Valuation');
var $ = require('jquery-browserify');
var d3 = require('d3');
var Label = require('../model/Label');
var ViewUtils = require('./ViewUtils');
    
var NodeProperties = function NodeProperties(modelState) {
    var ms = modelState;
    var internal = {
    
        
    
        showNodeLabels: function (node) {
            d3.select('#labelsTable').selectAll('tr').remove();
            var valuations = d3.select('#labelsTable').selectAll('tr');
            valuations = valuations.data(node.labels);
            var lines = valuations.enter()
                .append('tr');
            var properties = lines.append('td').text(function (d) {
                return d.text;
            });
            lines.append('td').text(function (d) {
                return d.lang
            });
            lines.append('td').append("a")
                .attr("href", "#")
                .on("click", function (d) {
                    //RKnown.control.editNodeLabel(d);
                    PS.publish(M.btnEditLabel, d);
                })
                .append("img")
                .attr("src", "png/glyphicons-31-pencil.png");
            lines.append('td').append("a")
                .attr("href", "#")
                .on("click", function (d) {
                    //RKnown.control.deleteNodeLabel(d);
                    PS.publish(M.btnDeleteLabel, d);
                })
                .append("img")
                .attr("src", "png/glyphicons-208-remove.png");
        
            d3.select('#addLabelButton').on('click',
                function () {
                    //RKnown.control.addNodeLabelButtonClick.bind(RKnown.control)
                    PS.publish(M.btnAddLabel);
                })
        }
        ,
    
        showNodeProperties: function (node, nodeElement) {
        
            function makeLinks(selection) {
                selection.each(function (d) {
                    if (d.value.startsWith('http://'))
                        $(this).wrap("<a target=\"_blank\" href=\"" + d.value + "\"></a>");
                });
            }
            
            if(!node) node = ms.getSelectedNode();
            if(!nodeElement) nodeElement = ms.getSelNodeElement();
            
        
            var location = ViewUtils.getElementInfoLocation(nodeElement);
            d3.select('#propertiesWidget').style("display", "block")
                .style("left", location.x + "px")
                .style("top", location.y + "px");
            d3.select('#propertiesTable').selectAll('tr').remove();
            
            
            var valuations = d3.select('#propertiesTable').selectAll('tr');
            valuations = valuations.data(node.valuations);
            var lines = valuations.enter()
                .append('tr');
            var properties = lines.append('td').classed("valuationProperty", true).text(function (d) {
                    return d.predicate.name;
                })
                .on('mouseover', function (d) {
                    //RKnown.control.valuationMouseOver(d);
                    PS.publish(M.valuationMouseOver, d);
                });
            lines.append('td').text(function (d) {
                return d.value
            });
            lines.append('td').append("a")
                .attr("href", "#")
                .on("click", function (d) {
                    //RKnown.control.editNodeProperty(d);
                    PS.publish(M.btnEditValuation, d);
                    d3.event.stopPropagation();
                })
                .append("img")
                .attr("src", "png/glyphicons-31-pencil.png");
            lines.append('td').append("a")
                .attr("href", "#")
                .on("click", function (d) {
                    //RKnown.control.deleteNodeProperty(d);
                    PS.publish(M.btnDeleteValuation, d)
                    d3.event.stopPropagation();
                })
                .append("img")
                .attr("src", "png/glyphicons-208-remove.png");
            properties.call(makeLinks);
        
        }
        ,
    
        showNodeTypes: function (node) {
            /*d3.select('#typesWidget').style("display", "block")
             .style("left", d3.mouse(d3.select("body").node())[0]-50+"px")
             .style("top", d3.mouse(d3.select("body").node())[1]+10+"px");*/
        
            d3.select('#typesTable').selectAll('tr').remove();
            var types = d3.select('#typesTable').selectAll('tr');
            types = types.data(node.types);
            var rows = types.enter()
                .append('tr');
            var buttons = rows.append('td').append('button')
                .attr("class", function (d) {
                    return "jscolor {valueElement:null,value:'" + d.getColor() + "'}";
                })
                .on("change", function (d) {
                    d.setColor(this.jscolor);
                    //RKnown.view.updateView();
                    PS.publish(M.modelChanged);
                })
                //.style('color', function(d) {return d.getColor();})
                .text(function (d) {
                    return "#" + d.label
                });
            rows.append('td').append("a")
                .attr("href", "#")
                .on("click", function (d) {
                    //RKnown.control.deleteNodeType(d);
                    PS.publish(M.btnDeleteNodeType, d);
                })
                .append("img")
                .attr("src", "png/glyphicons-208-remove.png");
        
            function addColorPicker(selection) {
                selection.each(function (d) {
                    var picker = new jscolor(this, {
                        closable: true,
                        closeText: 'Close',
                        valueElement: null,
                        onFineChange: function colorChange() {
                            picker._relatedRKnownType.setColor('#'+picker);
                            PS.publish(M.colorPickerChange, this);
                            PS.publish(M.modelChanged);
                        }//'RKnown.control.setColorFromPicker(this)'
                    });
                    picker._relatedRKnownType = d;
                    picker.fromString(d.getColor());
                })
            }
        
            buttons.call(addColorPicker);
        }
    };
        
    return {
        showNodeProperties: function showNodeProperties(msg, data) {
            if(!data.node) {
                data = {
                    node: ms.getSelectedNode(),
                    nodeElement: ms.getSelNodeElement()
                }
            }
            internal.showNodeProperties(data.node, data.nodeElement);
            internal.showNodeTypes(data.node);
            internal.showNodeLabels(data.node);
        },
        showLabelInput: function showLabelInput(msg, data) {
            internal.showLabelInput(data.node, data.label);
        },
        //TODO listen for or integrate this
        valuationMouseOver: function(valuation) {
            if(valuation.value.startsWith('http')) {
                d3.select('#webFrame').attr('src', valuation.value);
                var mousePos = ViewUtils.moveNextTo('#propertiesWidget', '#webInfo'); //this.moveToMousePos(d3.select('#webInfo'));
                var winHeight = $(window).height();
                var winWidth = $(window).width();
                var webHeight = winHeight-mousePos[1]-12;
                var webWidth = $(window).width()-mousePos[0]-12;
                if(webHeight<winHeight/3.0) webHeight = winHeight/3;
                if(webWidth<winWidth/3.0) webWidth = winWidth/3;
                d3.select('#webInfo').style("display", "block")
                    .style("width", webWidth+"px")
                    .style("height", webHeight+"px")
                    .style("top",(winHeight-webHeight)+"px")
                    .style("left",(winWidth-webWidth)+"px");
            }
            else d3.select('#webInfo').style("display", "none");
        },
        /*
        nodeMouseOver: function(node) {
            if(!d3.event.shiftKey) {
                this.selectNode(node, false);
                this.view.updateView();
                if(node.valuations.length > 0 || node.types.length > 0) {
                    this.view.showNodeProperties(node);
                    this.view.showNodeTypes(node);
                }
                else {
                    this.view.showNodeProperties(node);
                    this.view.showNodeLabels(node);
                }
            }
        }*/
        //TODO listen for or integrate this
        hideNodeProperties: function() {
            d3.select('#propertiesWidget').style("display", "none");
        }
    
        /*
        //TODO listen for or integrate this
        hideNodeTypes: function() {
            d3.select('#typesWidget').style("display", "none");
        }*/
    
    
       
    };
};

module.exports = NodeProperties;