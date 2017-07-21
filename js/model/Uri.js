/**
 * Created by marek on 21.6.2017.
 */
var Uri = {
    stripBrackets: function (uri) {
        return uri.replace(/[<>]/g, "");
    },
    nameFromUri: function(uri) {
        return uri.match("[^\/#]+$");
    }
}

module.exports = Uri;