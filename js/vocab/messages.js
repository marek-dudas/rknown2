/**
 * Created by marek on 30.6.2017.
 */
var Messages = {
    modelChanged: "model.changed",
    nodelinkChanged: "model.nodelink.changed",
    modelReset: "model.reset",
    
    relNodesChanged: "model.related.changed",
    relNodeMouseDown: "node.related.mousedown",
    
    btnAddLiteral: "button.literal.add.click",
    btnSaveLiteral: "button.literal.save.click",
    btnSaveLabel: "button.label.save.click",
    btnEditLabel: "button.label.edit.click",
    btnDeleteLabel: "button.label.delete.click",
    btnAddLabel: "button.label.add.click",
    valuationMouseOver: "valuation.mouseOver",
    btnEditValuation: "button.valuation.edit.click",
    btnDeleteValuation: "button.valuation.delete.click",
    btnDeleteNodeType: "button.nodeType.delete.click",
    colorPickerChange: "type.colorPicker.change",
    
    btnGraphLoad: "button.graph.load.click",
    btnGraphShare: "button.graph.share.click",
    btnGraphSave: "button.graph.save.click",
    btnGraphDelete: "button.graph.delete.click",
    graphListChanged: "graphlist.changed",
    
    btnNodeLiteral: "button.node.literal.click",
    btnNodeLink: "button.node.link.click",
    btnNodeType: "button.node.type.click",
    btnNodeDelete: "button.node.delete.click",
    selNodeDeleted: "node.deleted",
    
    suggestionTypeSelect: "suggestion.type.selected",
    suggestionEntitySelect: "suggestion.entity.selected",
    suggestionPropertySelect: "suggestion.property.selected",
    suggestionTextSearchRequest: "suggestion.search",
    suggestionCancel: "suggestion.cancel",
    
    relNodePlaced: "node.related.placed",
    
    nodeMouseDown: "node.mouseDown",
    nodeDblClick: "node.dblClick",
    nodeMouseOver: "node.mouseOver",
    nodePropsChanged: "node.properties.changed",
    
    canvasDblClick: "canvas.dblClick",
    canvasMouseDown: "canvas.mouseDown",
    canvasMouseMove: "canvas.mouseMove",
    
    literalPredicateInputKeyUp: "input.literal.predicate.keyup",
    
    predicateInputKeyUp: "input.predicate.keyup",
    predicateInputEnter: "input.predicate.enter",
    
    entityInputEnter: "input.entity.enter",
    entityInputKeyUp: "input.entity.keyup",
    
    typeInputEnter: "input.type.enter",
    typeInputKeyUp: "input.type.keyup",
    
    learningChanged: "state.learning.changed",
    
    linkCreated: "relation.link.created",
    
    nodeSearchEnter: "input.search.node.enter",
    
    windowClosed: "window.closed",
    windowOpened: "window.opened"
};

module.exports = Messages;