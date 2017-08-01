/**
 * Created by marek on 7.7.2017.
 */
var d3 = require('d3');
var PS = require('pubsub-js');
var M = require('../vocab/messages');
var $ = require('jquery-browserify');
var VU = require('./ViewUtils');
var Valuation = require('../model/Valuation');

var LiteralSelection = function(modelState) {
    var ms = modelState;
    var self;
    var isVisible;
    var hide = function() {
        isVisible = false;
        d3.select('#literalInput')
            .style("display", "none");
        PS.publish(M.windowClosed, self);
    };
    var init = function () {
        $('#literalPredicateField').keyup(function (e) {
            //RKnown.control.literalInputControl.keyPressed();
            PS.publish(M.literalPredicateInputKeyUp, this.val());
        });
        d3.select('#saveLiteral').on('click', function () {
            PS.publish(M.btnSaveLiteral,
                Valuation($('#literalPredicateField').val(), $('#literalValue').val()));//RKnown.control.addLiteralButtonClick.bind(RKnown.control));
            hide();
        });
    };
    
    init();
    
    self = {
        showLiteralInput: function (node, valuation) {
            isVisible = true;
            d3.select('#literalInput')
                .style("display", "block");
                //.style("left", node.x + "px")
                //.style("top", (node.y + 120) + "px");
            VU.moveNextTo(ms.getSelNodeElement(), '#literalInput');
            
            if (valuation != null) {
                $('#literalPredicateField').val(valuation.predicate.name);
                $('#literalValue').val(valuation.value)
                    .focus();
            }
            else {
                $('#literalPredicateField').val("");
                $('#literalValue').val("");
                $('#literalPredicateField').focus();
            }
            PS.publish(M.windowOpened, self);
        },
        hide: function() {
            hide();
        },
        visible: function() {
            return isVisible;
        }
    };
    
    return self;
};

module.exports = LiteralSelection;


