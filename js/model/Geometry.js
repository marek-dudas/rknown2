/**
 * Created by marek on 30.6.2017.
 */
var Geometry = {
    ellipseLineIntersection: function (a,b,x0,y0,c,d) {
        var eq = new Object();
        eq.a = b*b + a*a*c*c;
        eq.b = 2*a*a*c*d - 2*a*a*c*y0 - 2*b*b*x0;
        eq.c = b*b*x0*x0+a*a*y0*y0+d*d*a*a-a*a*b*b-2*a*a*d*y0;
        var D = eq.b*eq.b - 4*eq.a*eq.c;
        if(D<0) return null;
        else {
            var intersections = [];
            intersections[0] = new Object();
            intersections[1] = new Object();
            intersections[0].x = (-eq.b + Math.sqrt(D))/(2*eq.a);
            intersections[1].x = (-eq.b - Math.sqrt(D))/(2*eq.a);
            intersections[0].y = c*intersections[0].x+d;
            intersections[1].y = c*intersections[1].x+d;
            return intersections;
        }
    },
    
    nearPoint: function(from, points) {
        if(points == null) return null;
        var minDist = Number.MAX_VALUE;
        var minIndex = 0;
        for(var i = 0, l = points.length; i<l; i++) {
            var dist = this.pointDistance(from, points[i]);
            if(dist<minDist) {
                minDist = dist;
                minIndex = i;
            }
        }
        return points[minIndex];
    },
    
    pointDistance: function (a,b) {
        return Math.sqrt( Math.pow(b.x-a.x,2)+ Math.pow(b.y-a.y,2) );
    },

//line y=cx+d
    lineEquation: function (start, end) {
        if((end.x-start.x)==0) return null;
        var lineEq = {};
        lineEq.c = (end.y-start.y)/(end.x-start.x);
        lineEq.d = (start.y - lineEq.c*start.x);
        return lineEq;
    },

//ellipse a,b,x,y
    nearEllipseIntersection: function (ellipse,line, nearTo) {
        lineEq = this.lineEquation(line.start, line.end);
        return this.nearPoint(nearTo, this.ellipseLineIntersection(ellipse.a, ellipse.b, ellipse.x, ellipse.y, lineEq.c, lineEq.d));
    },
    
    rayLineIntersection: function (rayStart, rayEq, lineStart, lineEnd) {
        lineEq = this.lineEquation(lineStart, lineEnd);
        var point = {};
        lineVec = {};
        if(lineEq!=null){
            if(rayEq==null){
                point.x = rayStart.x;
                point.y = lineEq.c*rayStart.x+lineEq.d;
            }
            if((lineEq.c - rayEq.d)==0) return null;
            point.x = (rayEq.d - lineEq.d) / (lineEq.c - rayEq.c);
            point.y = rayEq.c*point.x+rayEq.d;
        }
        else{
            if(rayEq==null) return null;
            point.x = lineStart.x;
            point.y = rayEq.c*point.x+rayEq.d;
        }
        lineVec.x = lineEnd.x - lineStart.x;
        lineVec.y = lineEnd.y - lineStart.y;
        var k = -1;
        if(lineVec.x!=0) k = (point.x - lineStart.x) / lineVec.x;
        else if(lineVec.y!=0) k = (point.y - lineStart.y) / lineVec.y;
        if(k<0 || k>1) return null;
        return point;
    }
};

module.exports = Geometry;