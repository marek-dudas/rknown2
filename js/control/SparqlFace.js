/**
 * Created by marek on 22.6.2017.
 */
//TODO userToken and userEmail has to be added to config calls
    //TODO decouple from RView and RControl and RKnown

var UriTools = require('../model/Uri.js');
var SPARQL = require('./sparql.js');
var ConnSettings = require('../settings/connectionSettings.js');
var AppSettings = require('../settings/appSettings');
var URIS = require('../vocab/uris.js');
var RType = require('../model/RType.js');
var RModel = require('../model/RModel.js');
var Link = require('../model/Link.js');
var Node = require('../model/RNode.js');
var Valuation = require('../model/Valuation.js');
var PathBuilder = require('./pathQueryBuilder.js');
var PS = require('pubsub-js');
var M = require('../vocab/messages.js');
var MS = require('../model/ModelState');

var SparqlFace = function() {
    var userToken = MS.getInstance().getUserToken();
    var textSearchRuns = -1;
    function getAllBindings(json, placeholder) {
        var results = [];
        for (var j = 0; j < json.results.bindings.length; j++) {
            var binding = json.results.bindings[j];
            results.push(binding[placeholder].value);
        }
        return results;
    }
    
    var incrementTextSearchCounter = function resetTextSearchCounter() {
        textSearchRuns++;
        if (textSearchRuns > 1) textSearchRuns = -1;
    };
    
    var internal = {
         config: function () {
            this.queryService = Object.create(SPARQL);
            this.queryService.Service(ConnSettings.sparqlProxy, ConnSettings.sparqlEndpoint);
            this.queryService.setMethod('GET');
            this.queryService.setToken(userToken);
            this.externalService = Object.create(SPARQL);
            this.externalService.Service(ConnSettings.sparqlProxy, ConnSettings.externalEndpoint);
            this.externalService.setMethod('GET');
            this.externalService.setToken(userToken);
            this.userDbService = Object.create(SPARQL);
            this.userDbService.Service(ConnSettings.sparqlProxy, ConnSettings.userDbEndpoint);
            this.userDbService.setMethod('GET');
            this.userDbService.setToken(userToken);
            this.textSearchRuns = -1;
            this.userToken = MS.getInstance().getUserToken();
            this.userEmail = MS.getInstance().getUserEmail();
        },
        getGraphName: function () {
            return UriTools.nameFromUri(this.currentGraph);
        },
        query: function (queryText, callback) {
            var query = this.queryService.createQuery();
            query.query(queryText, {
                failure: function () {
                    alert("Query failed:" + queryText)
                },
                success: callback
            });
        },
        saveGraph: function (triplesInString) {
            $.ajax("server/save-temp-graph.php" + "?filename=test.ttl", {
                data: triplesInString,
                contentType: 'text/plain',
                type: 'POST',
                success: this.clearThenLoad.bind(this)
            });
        },
        loadGraph: function (graph) {
            this.currentGraph = graph;
            this.model = Object.create(RModel);
            this.model.init(this.currentGraph);
        
            var query = "SELECT DISTINCT * FROM <" + graph + "> WHERE {" +
                "?a " + URIS.rdfType + " " + URIS.rdfsClass + " ; " +
                URIS.colorPredicate + " ?color ; " +
                "	<http://www.w3.org/2000/01/rdf-schema#label> ?label ." +
                "}";
            this.query(query, this.saveTypesAndContinue.bind(this));
        },
        newGraph: function() {
            this.model = Object.create(RModel);
            this.model.init("unnamed");
            PS.publish(M.modelReset, this.model);
        },
        saveTypesAndContinue: function (json) {
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var typeUri = binding["a"].value;
                var typeLabel = binding["label"].value;
                var typeColor = binding["color"].value;
                var type = Object.create(RType);
                type.init(typeUri, typeLabel, typeColor);
                this.model.addType(type);
            }
        
            var query = "SELECT DISTINCT * FROM <" + this.currentGraph + "> WHERE {" +
                "?a " + URIS.rKnownTypePredicate + " ?type ;" +
                "	<http://rknown.com/xcoord> ?x ;" +
                "	<http://rknown.com/ycoord> ?y ;" +
                "	<http://www.w3.org/2000/01/rdf-schema#label> ?label ." +
                "OPTIONAL {?a <http://rknown.com/predicate> ?predicateUri .}" +
                "OPTIONAL {?a " + URIS.mainTypePredicate + " ?mainRdfType . " +
                "?mainRdfType " + URIS.rdfType + " " + URIS.rdfsClass + " ; " +
                URIS.colorPredicate + " ?color ; " +
                "<http://www.w3.org/2000/01/rdf-schema#label> ?rdfTypeLabel . }" +
                "   FILTER(?type = <http://rknown.com/RKnownObject> || ?type = <http://rknown.com/RKnownRelation> )" +
                "}";
            this.query(query, this.saveObjectsAndContinue.bind(this));
        },
    
        saveLinksAndContinue: function (json) {
            //this.links = [];
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var linkUri = binding["link"].value;
                var startUri = binding["a"].value;
                var endUri = binding["b"].value;
                var start = null;
                var end = null;
                for (var i = 0; i < this.model.nodes.length; i++) {
                    if (this.model.nodes[i].uri == startUri) start = this.model.nodes[i];
                    if (this.model.nodes[i].uri == endUri) end = this.model.nodes[i];
                }
                if (start != null && end != null) {
                    var link = Object.create(Link);
                    link.init(start, end, linkUri, UriTools.nameFromUri(linkUri));
                    this.model.addLink(link);
                }
            }
        
            var query = "SELECT DISTINCT * FROM <" + this.currentGraph + "> WHERE {" +
                "?a " + URIS.rKnownTypePredicate + " ?type ;" +
                "	?predicate ?value ." +
                "?predicate <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
                "FILTER(?type = <http://rknown.com/RKnownObject> || ?type = <http://rknown.com/RKnownRelation> )" +
                "FILTER(?predicate != <http://rknown.com/xcoord> && ?predicate != <http://rknown.com/ycoord> && ?predicate != <http://www.w3.org/2000/01/rdf-schema#label>)" +
                "FILTER(isLiteral(?value))" +
                "}";
        
            this.query(query, this.saveLiteralsAndContinue.bind(this));
        
        },
        findLabel: function (uri) {
            uri = UriTools.stripBrackets(uri);
            var query = "SELECT ?label WHERE { <" + uri + "> <http://www.w3.org/2000/01/rdf-schema#label> ?label . }";
            return new Promise(function (resolve, reject) {
                internal.query(query, function (json) {
                    if (json.results.bindings.length <= 0) resolve(UriTools.nameFromUri(uri));
                    else {
                        var binding = json.results.bindings[0];
                        var label = binding["label"].value;
                        resolve(label);
                        PS.publish(M.modelChanged, null);
                    }
                })
            });
        },
        loadLiteralsForObject: function (node) {
            var query = "SELECT DISTINCT * WHERE { <" + node.uri + "> ?predicate ?value ." +
                "?predicate <http://www.w3.org/2000/01/rdf-schema#label> ?label . " +
                "FILTER(?predicate != <http://rknown.com/xcoord> && ?predicate != <http://rknown.com/ycoord> && ?predicate != <http://www.w3.org/2000/01/rdf-schema#label>)" +
                "FILTER(isLiteral(?value))" +
                "}";
            this.query(query, function (json) {
                for (var j = 0; j < json.results.bindings.length; j++) {
                    var binding = json.results.bindings[j];
                    var predicate = Object.create(Node);
                    var predicateName = binding["label"].value;
                    var predicateUri = binding["predicate"].value;
                    var value = binding["value"].value;
                    predicate.init(predicateUri, predicateName);
                    var valuation = Valuation(predicate,value);
                    node.addValuation(valuation);
                }
            });
        },
        saveLiteralsAndContinue: function (json) {
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var predicate = Object.create(Node);
                var objUri = binding["a"].value;
                var predicateName = binding["label"].value;
                var predicateUri = binding["predicate"].value;
                var value = binding["value"].value;
                predicate.init(predicateUri, predicateName);
                var valuation = Valuation(predicate, value);
                var node = this.model.getNodeByUri(objUri);
                if (node != null) node.addValuation(valuation);
            }
        
            var query = "SELECT DISTINCT * FROM <" + this.currentGraph + "> WHERE {" +
                "?a " + URIS.rKnownTypePredicate + " ?type ;" +
                URIS.rdfType + " ?rdfType ." +
                "?rdfType " + URIS.rdfType + " " + URIS.rdfsClass + " ;" +
                URIS.rdfsLabel + " ?label; " +
                URIS.colorPredicate + " ?color ." +
                "FILTER(?type = <http://rknown.com/RKnownObject> || ?type = <http://rknown.com/RKnownRelation> )" +
                "}";
        
            this.query(query, this.saveTypesForNodesAndContinue.bind(this));
        
            //this.loadGraphCallback(this.model);
        },
        saveTypesForNodesAndContinue: function (json) {
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var objUri = binding["a"].value;
                var label = binding["label"].value;
                var color = binding["color"].value;
                var typeUri = binding["rdfType"].value;
                var nodeType = Object.create(RType);
                nodeType.init(typeUri, label, color);
                var node = this.model.getNodeByUri(objUri);
                if (node != null) this.model.addTypeToNode(node, nodeType);//node.addType(nodeType);
            }
        
            //this.loadGraphCallback(this.model);
            PS.publish(M.modelReset, this.model);
        },
    
        saveObjectsAndContinue: function (json) {
            //this.objects = [];
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var object = Object.create(Node);
                var objUri = binding["a"].value;
                var name = binding["label"].value;
                var type = "<" + binding["type"].value + ">";
            
                object.init(objUri, name, type);
                if (typeof binding["predicateUri"] !== 'undefined') {
                    var predicateUri = binding["predicateUri"].value;
                    object.setPredicateUri(predicateUri);
                }
                if (typeof binding["mainRdfType"] !== 'undefined') {
                    var label = binding["rdfTypeLabel"].value;
                    var color = binding["color"].value;
                    var typeUri = binding["mainRdfType"].value;
                    var nodeType = Object.create(RType);
                    nodeType.init(typeUri, label, color);
                    object.addType(nodeType);
                }
                object.x = parseFloat(binding["x"].value);
                object.y = parseFloat(binding["y"].value);
                this.model.addNode(object);
            }
            var query = "SELECT ?a ?link ?b FROM <" + this.currentGraph + "> WHERE {" +
                "{?a " + URIS.rKnownTypePredicate + " <http://rknown.com/RKnownObject> ." +
                "?b " + URIS.rKnownTypePredicate + " <http://rknown.com/RKnownRelation> ." +
                "?a ?link ?b .}" +
                "UNION " +
                "{?a " + URIS.rKnownTypePredicate + " <http://rknown.com/RKnownRelation> ." +
                "?b " + URIS.rKnownTypePredicate + " <http://rknown.com/RKnownObject> ." +
                "?a ?link ?b .}" +
                "UNION " +
                "{?a " + URIS.rKnownTypePredicate + " <http://rknown.com/RKnownRelation> ." +
                "?b " + URIS.rKnownTypePredicate + " <http://rknown.com/RKnownRelation> ." +
                "?a ?link ?b .}" +
                "}";
            this.query(query, this.saveLinksAndContinue.bind(this))
        },
        processObjectSuggestions: function (json) {
            var results = getAllBindings(json, "a");
            this.objectSuggestionCallback(results);
        },
        processPredicateSuggestions: function (json) {
            var results = getAllBindings(json, "a");
            this.predicateSuggestionCallback(results);
        },
        processRelatedNodes: function (json) {
            var results = []; //this.getAllBindings(json, "a");
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var object = Object.create(Node);
                var objUri = binding["a"].value;
                var name = binding["label"].value;
                if(this.model.getNodeByUri(objUri) == null) {
                    object.init(objUri, name, URIS.object);
                    results.push(object);
                }
            }
        
            //this.relatedCallback(results);
            PS.publish(M.relNodesChanged, results);
        },
        
        getGraphs: function () {
            var queryText = "SELECT DISTINCT ?graph WHERE { ?graph <http://purl.org/dc/terms/creator> \"" + this.userEmail + "\" .}"; //graph ?graph {?s ?p ?o.}
        
            var query = this.userDbService.createQuery();
            query.query(queryText, {
                failure: function () {
                    alert("Getting graphs failed.");
                },
                success: function (json) {
                    //callback(getAllBindings(json, "graph"));
                    var graphUris =getAllBindings(json, "graph");
                    var graphs = []
                    for (var i = 0; i < graphUris.length; i++) graphs.push({uri: graphUris[i], id: graphUris[i]});
    
                    PS.publish(M.graphListChanged, graphs);
                }
            });
        
            //this.runQuery(query, "Getting graphs failed.", function(json){callback(SparqlFace.getAllBindings(json, "graph"))})
        },
        textSearchListener: function (msg, data) {
            this.textSearch(data.searchFor, data.type, data.callback);
        },
        textSearch: function (text, type, callback) {
            //if (textSearchRuns >= 0) return null;
        
            this.textSearchCallback = callback;
            var searchQuery = "SELECT DISTINCT ?a ?label WHERE " +
                "{ ?a <http://www.w3.org/2000/01/rdf-schema#label> ?label ." +
                "  ?a " + URIS.rKnownTypePredicate + " " + type + " . " +
                " FILTER(contains(LCASE(?a), LCASE(\"" + text + "\")) || contains(LCASE(?label), LCASE(\"" + text + "\"))) } LIMIT " + AppSettings.suggestionsLimit;
        
            var query = this.queryService.createQuery();
            var externalQuery = this.externalService.createQuery();
            textSearchRuns = 0;
            this.objects = [];
            query.query(searchQuery, {
                failure: function () {
                    incrementTextSearchCounter();
                    alert("Search failed - query failure");
                },
                success: this.processTextSearch.bind(this)
            });
            externalQuery.query(searchQuery, {
                failure: function () {
                    incrementTextSearchCounter();
                    alert("Search failed - external query failure");
                },
                success: this.processTextSearch.bind(this)
            });
        },
        processTextSearch: function (json) {
            for (var j = 0; j < json.results.bindings.length; j++) {
                var binding = json.results.bindings[j];
                var object = Object.create(Node);
                var objUri = binding["a"].value;
                var objName = binding["label"].value;
                object.init(objUri, objName, null);
                this.objects.push(object);
            }
            //if (textSearchRuns == 1) this.textSearchCallback(this.objects, true);
            //else if(textSearchRuns == 0) this.textSearchCallback(this.objects, false);
            this.textSearchCallback(this.objects, true);
            incrementTextSearchCounter();
        },
        runQuery: function (searchQuery, failureMessage, successCallback) {
            var query = this.queryService.createQuery();
            query.query(searchQuery, {
                failure: function () {
                    alert(failureMessage)
                },
                success: successCallback
            });
        },
        getAllEntities: function () {
            var searchQuery = "SELECT DISTINCT ?a WHERE { {?a ?b ?c} UNION {?x ?y ?a} FILTER(!isLiteral(?a))}";
            this.runQuery(searchQuery, "Getting entity list failed - query failure", this.processObjectSuggestions.bind(this));
        },
        getAllPredicates: function () {
            var searchQuery = "SELECT DISTINCT ?a WHERE { {?b ?a ?c} UNION {?x ?a ?y} }";
            this.runQuery(searchQuery, "Getting predicate list failed - query failure", this.processPredicateSuggestions.bind(this));
        },
        getRelatedNodes: function (node) {
            var b = "<" + node.uri + ">"
            var searchQuery = "SELECT DISTINCT ?a ?label WHERE { {?a ?pred " + b + "} " +
                "UNION {" + b + " ?pred ?a} UNION {?a ?pred1 ?c. ?c ?pred2 " + b + ".} " +
                "UNION {" + b + " ?pred1 ?c. ?c ?pred2 ?a.}" +
                "?a " + URIS.rKnownTypePredicate + " " + URIS.object + " . " +
                "?a <http://www.w3.org/2000/01/rdf-schema#label> ?label .} " +
                "LIMIT" + AppSettings.suggestionsLimit;
            this.runQuery(searchQuery, "Getting related nodes failed - query failure", this.processRelatedNodes.bind(this));
        },
        clearGraph: function clearGraph(graph, callback) {
            var updateQuery = "CLEAR GRAPH <" + graph + ">";
    
            $.get("server/sesame-proxy.php?token=" + this.userToken + "&query=" + encodeURIComponent(updateQuery), null, callback);
        },
        justClear: function justClear(graph) {
            this.clearGraph(graph, this.getGraphs.bind(this));
        },
        clearThenLoad: function () {
            this.clearGraph(this.currentGraph, this.runLoadQuery.bind(this));
        },
        runLoadQuery: function () {
            var updateQuery = "LOAD <http://localhost/rknown/server/graphs/test.ttl> INTO GRAPH <" + this.currentGraph + ">"
        
            $.get("server/sesame-proxy.php?query=" + encodeURIComponent(updateQuery) + "&token=" + this.userToken, null, this.graphSavedCallback);
        
            /*query.query(updateQuery, {failure: function(){alert("Saving graph failed - query failure")},
             success: function(json) {
             alert("Graph saved successfully")
             }});*/
        
        },
        initLinkFinding: function () {
            this.processedBuilders = 0;
            this.builders = [];
        },
        findLinksBetween: function (a, b) {
            for (var i = 1; i < AppSettings.maxPathLength; i++) {
                var builder = Object.create(PathBuilder);
                this.builders.push(builder);
                builder.init(a, b, i, i + 1, this);
                for (var j = 1; j <= i; j++) {
                    var builder = Object.create(PathBuilder);
                    this.builders.push(builder);
                    builder.init(a, b, i, j, this);
                }
            }
        
        },
        pathBuilderProcessed: function () {
            this.processedBuilders++;
            if (this.processedBuilders == this.builders.length) {
                for (var i = 0; i < this.builders.length; i++) {
                    if (this.builders[i].pathFound) {
                        for (var p = 0; p < this.builders[i].placeholders.length; p++) {
                            var pLink = this.builders[i].placeholders[p];
                            this.model.addNodeFromUri(pLink.s, this.findLabel(pLink.s));
                            this.model.addNodeFromUri(pLink.o, this.findLabel(pLink.o));
                            this.model.addLinkByUris(UriTools.stripBrackets(pLink.p),
                                this.findLabel(pLink.p),
                                UriTools.stripBrackets(pLink.s),
                                UriTools.stripBrackets(pLink.o));
                        }
                    }
                }
            }
            //RKnown.control.view.updateView();
            PS.publish(M.modelChanged);
        },
        putRelatedNode: function (msg, data) {
            var relatedNode = data.placedNode;
            var location = data.location;
            relatedNode.x = location[0];
            relatedNode.y = location[1];
            this.model.addNode(relatedNode);
            this.loadLiteralsForObject(relatedNode);
        
            if (MS.getInstance().isLearning()) {
                this.initLinkFinding();
                for (var i = 0; i < this.model.nodes.length - 1; i++) {
                    this.findLinksBetween(this.model.nodes[i], relatedNode);
                }
            }
        
            PS.publish(M.modelChanged);
        },
    
        save: function (graphName) {
            this.model.name = AppSettings.graphUriBase + this.userEmail + "/" + encodeURIComponent(graphName);
            this.currentGraph = this.model.name;
            this.graphSavedCallback = this.getGraphs.bind(this);
            this.saveGraph(this.model.getRdf());
        },
    
        //TODO integrate this
        getEntityUriBase: function () {
            return this.model.getEntityUriBase();
        },
    
        createUriFromName: function (name) {
            var localUri = name.replace(/[^a-zA-Z0-9]/g, "");
            return this.getEntityUriBase() + localUri;
        }
    };
    
    return {
        saveGraph: function(graphName) {
            internal.save(graphName);
        },
        loadGraph: function(graphUri) {
            internal.loadGraph(graphUri);
        },
        initAll: function subscribe() {
            internal.config();
            PS.subscribe(M.relNodePlaced, internal.putRelatedNode.bind(internal));
            PS.subscribe(M.suggestionTextSearchRequest, internal.textSearchListener.bind(internal));
            PS.subscribe(M.btnGraphSave, function(msg, graphName) {
                internal.save(graphName);
            });
            PS.subscribe(M.btnGraphLoad, function(msg, graphUri) {
                internal.loadGraph(graphUri);
            });
            PS.subscribe(M.btnGraphDelete, function(msg, graph) {
                internal.justClear(graph.uri);
            });
        },
        createUriFromName: function(name) {
            return internal.createUriFromName(name);
        },
        initLinkFinding: function() {
            internal.initLinkFinding();
        },
        findLinksBetween: function(a,b) {
            internal.findLinksBetween(a,b);
        },
        addRelatedNodesFor: function(node) {
            internal.getRelatedNodes(node);
        },
        getAllGraphs: function() {
            internal.getGraphs();
        },
        newGraph: function() {
            internal.newGraph();
        }
    };
};

module.exports = SparqlFace;