/**
 * Created by marek on 24.2.2017.
 */
var ConnectionSettings = {
    sparqlProxy: "server/sparql-proxy.php",
    sparqlEndpoint: "http://localhost:8080/openrdf-sesame/repositories/rknown2",
    userDbEndpoint: "http://localhost:8080/openrdf-sesame/repositories/rknown-users",
    sparqlUpdateProxy: "server/sparql-update-proxy.php",
    sparqlUpdateEndpoint: "http://localhost:8080/openrdf-sesame/repositories/rknown2/statements",
    graphLinkServiceUrl: "server/register-shared-graph.php",
    externalEndpoint: "http://rknown.vserver.cz:8080/rdf4j-server/repositories/external"
};

module.exports = ConnectionSettings;