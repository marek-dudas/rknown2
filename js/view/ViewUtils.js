/**
 * Created by marek on 7.7.2017.
 */

var d3 = require('d3');
var RSettings = require('../settings/appSettings');

var ViewUtils = {
    moveToMousePos: function (d3Sel) {
        var mousePos = d3.mouse(document.body);
        d3Sel.style("left", mousePos[0] + "px");
        d3Sel.style("top", mousePos[1] + "px");
        return mousePos;
    },
    
    moveElement: function (d3Element, location) {
        d3.select(d3Element).style("left", location.x + "px")
            .style("top", location.y + "px");
    },
    
    getBBox: function(d3Element) {
        return d3.select(d3Element).node().getBoundingClientRect();
    },
    
    getElementInfoLocation: function(d3Element) {
        var box = ViewUtils.getBBox(d3Element);
        return {x: box.left + box.width, y: box.top + box.height};
    },
        
    moveNextTo: function(nextToElement, d3Element) {
        if(nextToElement!=null) {
            var box = ViewUtils.getBBox(nextToElement);
            var location = {x: box.left + box.width, y: box.top};
            ViewUtils.moveElement(d3Element, location);
            return location;
        }
    },
    
    selectText: function(containerid) {
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(document.getElementById(containerid));
            range.select();
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(document.getElementById(containerid));
            window.getSelection().addRange(range);
        }
    },
    
    wrap: function(text, textData, width) {
        text.selectAll("tspan").remove();
        var words = textData.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    },
    
    showNodeText: function(selection) {
        selection.each(function(d) {
            var textSelection = d3.select(this).select("text");
            ViewUtils.wrap(textSelection, d.name, d.width);
            var textSize = textSelection.node().getBBox();
            d.height = textSize.height + RSettings.nodeLabelMargin*2;
            d.width = textSize.width + RSettings.nodeLabelMargin*2;
            var newPosY = -d.height/2 + RSettings.nodeLabelMargin;
            textSelection.attr("y", newPosY);
            textSelection.selectAll("tspan").attr("y", newPosY);
            //wrap(textSelection, d.width);
        });
    }
};

module.exports = ViewUtils;