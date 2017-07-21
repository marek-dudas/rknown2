/**
 * Created by marek on 21.6.2017.
 */
var uri = require('./Uri.js');
var Triple = {
    init: function(subject, predicate, object) {
        this.s = uri.stripBrackets(subject);
        this.p = uri.stripBrackets(predicate);
        this.o = uri.stripBrackets(object);
    },
    create: function(subject, predicate, object) {
        var triple = Object.create(Triple);
        triple.init(subject, predicate, object);
        return triple;
    },
    str: function() {
        if(this.o.match(/^".*"$/g)!=null)
            return "<"+this.s+"> <"+this.p+ "> "+this.o+" .\r\n";
        else return "<"+this.s+"> <"+this.p+ "> <"+this.o+"> .\r\n";
    }
}

module.exports = Triple;