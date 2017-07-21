/**
 * Created by marek on 21.6.2017.
 */
var Valuation = function Valuation(predicate, value) {

    return {
        predicate: predicate,
        value: value,
        setPredicate: function (node) {
            this.predicate = node;
        },
        setValue: function (value) {
            this.value = value;
        },
        init: function (predicate, value) {
            this.predicate = predicate;
            this.value = value;
        }
    }
};

module.exports = Valuation;
