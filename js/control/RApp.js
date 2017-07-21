/**
 * Created by marek on 12.7.2017.
 */

var SparqlFace = require('./SparqlFace');
var ViewControl = require('../view/ViewControl');
var LinkControl = require('./LinkControl');
var NodeControl = require('./NodeControl');
var NodeSearch = require('./NodeSearch');
var MS = require('../model/ModelState');

var RApp = function(_userMail, _userToken) {
    var userMail = _userMail;
    var userToken = _userToken;
    var sFace;
    var ms;
    var vc;
    var internal = {
        gup: function (name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null)
                return null;
            else
                return results[1];
        },
    
        registerSharing: function (graphid) {
            $.get("server/register-shared-graph.php?token=" + userToken + "&graphid=" + graphid, null,
                this.loadGraphFromUrl.bind(this));
        
        },
    
        loadGraphFromUrl: function () {
            sFace.loadGraph(this.graphFromUrl);
        },
    
        processUrlParams: function () {
            this.graphFromUrl = this.gup('graphurl');
            this.graphidFromUrl = this.gup('graphid');
            
            if (this.graphidFromUrl != null) {
                this.registerSharing(this.graphidFromUrl);
            }
            else if (this.graphFromUrl != null) {
                this.loadGraphFromUrl();
            }
        }
    }
    
    
    return {
        go: function() {
            ms = MS.getInstance();
            ms.setUser(userMail, userToken);
            sFace = SparqlFace();
            sFace.initAll();
        
            vc = ViewControl();
            vc.initAll();
            LinkControl(sFace, ms).initAll();
            NodeControl(sFace, ms).initAll();
            NodeSearch().initAll();
        
            sFace.getAllGraphs();
    
            if(userToken !== undefined) internal.processUrlParams();
            vc.updateSize();
        }
    };
};

module.exports = RApp;
