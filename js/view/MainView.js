/**
 * Created by marek on 30.6.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js');
var UriTools = require('../model/Uri');
var M = require('../vocab/messages');
var ViewUtils = require('./ViewUtils');

var RView = function(config) {
    var svg,
        dragSvg;
    
    var internal = {
        init: function init(viewingElement, width, height) {
            this.model = null;
            this.width = 800;
            this.height = $(window).height() - 200;
        
            this.layoutRunning = false;
            this.layout = null;
        
            this.viewingElement = d3.select("#" + viewingElement);
        
            this.svg = this.viewingElement
                .append("svg")
                .attr("shape-rendering", "geometricPrecision")
                .attr("width", width)
                .attr("height", this.height);
        
        
            this.svg.append('svg:defs').append('svg:marker')
                .attr('id', 'end-arrow')
                //.attr('viewBox', '0 -5 10 10')
                .attr('refX', 9.5)
                .attr('refY', 6)
                .attr('markerWidth', 13)
                .attr('markerHeight', 13)
                .attr('orient', 'auto')
                .append('svg:path')
                //.attr('d', 'M0,-5L10,0L0,5')
                .attr('d', 'M2,2 L10,6 L2,11')
                .style("stroke", "#777")
                .attr('fill', 'none');
        
            this.svg.append('svg:defs').append('svg:marker')
                .attr('id', 'start-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 4)
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M10,-5L0,0L10,5')
                .attr('fill', '#000');
        
            this.svg.append('svg:defs').append('filter')
                .attr('id', 'blur-filter').append('feGaussianBlur')
                .attr('stdDeviation', 3);
        
            this.rootSvg = this.svg;
        
            this.rootSvg.on("mousemove", function () {
                //RKnown.control.mouseMove(d3.mouse(RKnown.view.svg.node()));
                PS.publish(M.canvasMouseMove, d3.mouse(this));
            });
            this.rootSvg.on("click", function () {
                    //var mouseDown = RKnown.control.canvasMouseDown.bind(RKnown.control);
                    //mouseDown(d3.mouse(this), null);
                    PS.publish(M.canvasMouseDown, d3.mouse(this));
                })
                .on("dblclick", function () {
                    //RKnown.control.dblClick(d3.mouse(RKnown.view.svg.node()));
                    PS.publish(M.canvasDblClick, d3.mouse(this));
                });
    
            svg = this.svg = this.svg.append("svg:g");
        
            this.nodesGroup = this.svg.append("svg:g");
            this.edgesGroup = this.svg.append("svg:g");
        
            // create the zoom listener
            var zoomListener = d3.zoom()
                .scaleExtent([0.1, 2])
                .on("zoom", this.zoomHandler.bind(this));
            // function for handling zoom event
        
            zoomListener(this.rootSvg);
            this.rootSvg.on("dblclick.zoom", null)
                .on("touchstart.zoom", this.touchstart.bind(this));
        
            this.canvas = this.svg.append("svg:g");
        
            $("#checkboxLearning").on("change", this.learningStateChanged.bind(this));
            $("#checkboxFullscreen").on("change", this.fullscreenChanged.bind(this));
    
            $('#textSearchField').keyup(function(e){
                if(e.keyCode == 13) {
                    PS.publish(M.nodeSearchEnter, ($(this).val()));
                }
            });
        
            window.addEventListener('resize', this.updateSize.bind(this));
        
            window.addEventListener('load', this.updateSize.bind(this));
        
            this.last_touch_time = undefined;
        },
    
        updateSize: function (event) {
            var view = this;
            var currentSize = view.viewingElement.node().getBoundingClientRect();
            var headerHeight = $('#canvasHeading').height();
            var height = $(window).height() - currentSize.top - headerHeight - 5;
        
            view.rootSvg.attr("width", currentSize.width).attr("height", height);
            
            return height;
        },
    
        fullscreenChanged: function () {
            var full = $('#checkboxFullscreen').is(':checked');
            if (full) {
                $('#rowGraphName').hide();
                $('#divGraphs').hide();
                $('#divSuggestions').hide();
                $('#divSignIn').hide();
                $('#rowAttributions').hide();
                d3.select('#divCanvas').classed('col-md-8', false);
            }
            else {
                $('#rowGraphName').show();
                $('#divGraphs').show();
                $('#divSuggestions').show();
                $('#divSignIn').show();
                $('#rowAttributions').show();
                d3.select('#divCanvas').classed('col-md-8', true);
            }
            this.updateSize();
        },
    
        learningStateChanged: function () {
            this.layoutRunning = this.learningStateSet();
            this.updateView();
            PS.publish(M.learningChanged, this.learningStateSet())
        },
    
        touchstart: function () {
            var touch_time = d3.event.timeStamp;
            if (touch_time - last_touch_time < 500 && d3.event.touches.length === 1) {
                d3.event.stopPropagation();
                this.last_touch_time = undefined;
                PS.publish(M.canvasDblClick, d3.mouse(svg.node()));
                //RKnown.control.dblClick(d3.mouse(d3.mouse(RKnown.view.svg.node())));
            }
            this.last_touch_time = touch_time;
        },
    
        learningStateSet: function () {
            return $('#checkboxLearning').is(':checked');
        },
    
        getRelatedSvgWidth: function () {
            return this.relatedSvg.node().getBoundingClientRect().width;
        },
    
        zoomHandler: function () {
            var scale = 1 - ( (1 - d3.event.scale) * 0.1 );
            this.svg.attr("transform", "translate(" + d3.event.transform.x + ", " + d3.event.transform.y + ")scale(" + d3.event.transform.k + ")");
        },
    
        startLayout: function () {
            this.tickCounter = 0;
            if (this.layout == null) this.resetLayout();
            this.layout.restart();
        },
    
        resetLayout: function () {
            if (this.layout != null) this.layout.stop();
            this.layout = d3.forceSimulation(this.model.nodes)
                .force("links", d3.forceLink(this.model.links))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter())
                .on("tick", this.tick.bind(this));
        },
    
        tick: function () {
        
            if (this.model.nodes.length > 0) {
                this.getNodesD3().attr('transform', function (d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
            }
        
            if (this.model.links.length > 0) {
                this.getEdgesD3().attr("x1", function (d) {
                        d.countStartFromIntersection();
                        return d.startX;
                    })
                    .attr("y1", function (d) {
                        return d.startY;
                    })
                    .attr("x2", function (d) {
                        d.countEndFromIntersection();
                        return d.endX;
                    })
                    .attr("y2", function (d) {
                        return d.endY;
                    });
            }
        
        },
    
        setData: function (model) {
            this.model = model;
            this.resetLayout();
        },
    
        getEdgesD3: function () {
            return this.edgesGroup.selectAll("line").data(this.model.links, function (d) {
                return d.id;
            });
        },
    
        getNodesD3: function () {
            return this.nodesGroup.selectAll("g").data(this.model.nodes, function (d) {
                return d.id;
            });
        },
    
        updateView: function () {
        
            this.edges = this.getEdgesD3();
            
            this.edges.enter()
                .append("line")
                .style("stroke", "#777")
                .style("stroke-width", 2)
                .style('marker-start', function (d) {
                    return d.left ? 'url(#start-arrow)' : '';
                })
                .style('marker-end', function (d) {
                    return d.right ? 'url(#end-arrow)' : '';
                })
                .style("stroke-dasharray", function (d) {
                    return d.dashed();
                });
        
            this.edges.exit().remove();
        
            var canvasSvg = this.svg;
            this.nodes = this.getNodesD3(); // this.nodesGroup.selectAll("g").data(this.model.nodes, function(d) {return d.id;});
        
            var node_drag = d3.drag()
                .on("start", dragstart)
                .on("drag", dragmove)
                .on("end", dragend);
        
            var view = this;
        
            function dragstart(d, i) {
                view.layout.stop(); // stops the force auto positioning before you start dragging
                d3.event.sourceEvent.stopPropagation();
            }
        
            function dragmove(d, i) {
                d.px += d3.event.dx;
                d.py += d3.event.dy;
                d.x += d3.event.dx;
                d.y += d3.event.dy;
                view.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
            }
        
            function dragend(d, i) {
                d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                view.tick();
                if (view.layoutRunning) view.layout.resume();
            }
        
            var nodesEnter = this.nodes.enter().append("g")
                .on("click", function (d) {
                    //RKnown.control.canvasMouseDown(d3.mouse(this), d);
                    PS.publish(M.nodeMouseDown, {node:d, nodeElement: this});
                    d3.event.stopPropagation();
                })
                .on('dblclick', function (d) {
                    //RKnown.control.nodeDblClick(d);
                    PS.publish(M.nodeDblClick, d);
                    var text = d3.select(this).select("text")[0][0];
                    text.selectSubString(0, 0);
                })
                .on('mouseover', function (d) {
                    //RKnown.control.nodeMouseOver(d);
                    PS.publish(M.nodeMouseOver, {node:d, nodeElement: this});
                })
                .call(node_drag)
                .classed("node", function (d) {
                    return d.type != "<http://rknown.com/RKnownRelation>";
                })
            
                .classed("relationNode", function (d) {
                    return d.type == "<http://rknown.com/RKnownRelation>";
                })
                .style("visibility", function (d) {
                    return d.visible ? "visible" : "hidden";
                });
        
            nodesEnter.append("path")
                .attr("d", function (d) {
                    return d.getPathData();
                })
                .style("fill", function (d) {
                    return d.color;
                });
        
            nodesEnter.append("text")
                .classed("nodename", true)
                .attr("x", "0")//function(d) {return d.width/2+2;})
                .attr("y", "0")
                .attr("dx", 1)
                .attr("dy", "1em");
        
            nodesEnter.merge(this.nodes).call(ViewUtils.showNodeText);
            nodesEnter.merge(this.nodes).selectAll("path")
                .attr("d", function (d) {
                    return d.getPathData();
                })
                .classed("selected", function (d) {
                    return d.selected;
                })
                .style("fill", function (d) {
                    return d.getColor();
                });
        
            function showSearchHighlight(selection) {
                selection.each(function (d) {
                    if (d.searchHighlight) {
                        d3.select(this).append("circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", d.width / 2 + 30)
                            .attr("stroke", "red")
                            .attr("stroke-width", 5)
                            .attr("fill", "none")
                    }
                    else d3.select(this).select("circle").remove();
                });
            }
        
            nodesEnter.merge(this.nodes).call(showSearchHighlight);
        
            this.nodes.exit().remove();
        
            if (this.layoutRunning) this.startLayout();
            else if (this.layout != null) this.layout.stop();
            this.tick();
        }
    };
    
    internal.init(config.viewingElement, config.width, config.height);
    
    return {
        modelChanged: function modelChanged(msg, model) {
            internal.updateView();
        },
        modelReset: function modelReset(msg, model) {
            if(internal.model != null) {
                internal.model.empty();
                internal.updateView();
            }
            internal.setData(model);
            internal.updateView();
            setTimeout(internal.updateView.bind(internal), 300); //TODO this is dirty hack for reload after the lazy fonts arrive
        },
        getCanvas: function() {
            return internal.canvas;
        },
        subscribe: function() {
            PS.subscribe(M.modelChanged, this.modelChanged);
            PS.subscribe(M.modelReset, this.modelReset);
        },
        updateSize: function() {
            internal.updateSize();
        }
    };
};

module.exports = RView;