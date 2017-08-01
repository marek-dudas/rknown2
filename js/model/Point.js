/**
 * Created by marek on 26.7.2017.
 */
var Point = function Point(x,y) {
        
    return {
        x: x,
        y: y,
        distance: function distanceFrom(point) {
            return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
        }
    }
};

module.exports = Point;

