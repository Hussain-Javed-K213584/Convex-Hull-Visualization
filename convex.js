const canvas = document.getElementById("convex");
const ctx = canvas.getContext("2d");
const startGraham = document.getElementById("start-graham");
const resetHullBtn = document.getElementById('reset-points');
const plotRandomBtn = document.getElementById('plot-random');

let points = [];
// Thank u stack overflow
function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

// re-draws the whole canvas again
function reDraw(points) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(element => {
        plotPoints(element.x, element.y);
    });
}


function plotPoints(mouseX, mouseY) {
    const circle = new Path2D();
    circle.arc(mouseX, mouseY, 3, 0, 2 * Math.PI);
    ctx.fill(circle);
}

function drawHullLine(moveX, moveY, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(moveX, moveY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
}

let currentGrahamIndex = 0;
function drawGrahamHull(hullPoints) {
    ctx.beginPath();
    ctx.moveTo(hullPoints[currentGrahamIndex].x, hullPoints[currentGrahamIndex].y);
    ++currentGrahamIndex;
    if (currentGrahamIndex == hullPoints.length){
        ctx.moveTo(hullPoints[currentGrahamIndex - 1].x, hullPoints[currentGrahamIndex - 1].y);
        ctx.lineTo(hullPoints[0].x, hullPoints[0].y);
        ctx.stroke();
        ctx.closePath();
        currentGrahamIndex = 0;
        return;
    }
    ctx.lineTo(hullPoints[currentGrahamIndex].x, hullPoints[currentGrahamIndex].y);
    ctx.stroke();
    setTimeout(drawGrahamHull, 500, hullPoints);
}

function doGrahamScan() {
    let hull = new ConvexHullGrahamScan()
    points.forEach((point) => {
        hull.addPoint(point.x, point.y);
    })
    let hullP = hull.getHull();
    console.log(hullP);
    drawGrahamHull(hullP);
}

function generateRandomPoints(){
    let cWidth = canvas.width, cHeight = canvas.height;
    let randomInterval = function (min, max){
        return (Math.random() * (max - min + 1) + min);
    }
    for (let i = 0; i < 100; i++){
        let point = {
            x: randomInterval(10, cWidth-10),
            y: randomInterval(10, cHeight-10)
        }
        points.push(point);
    }
}

canvas.addEventListener("click", (e) => {
    let currentPosition = getMousePos(canvas, e);
    console.log(currentPosition);
    plotPoints(currentPosition.x, currentPosition.y);
    points.push(currentPosition);
});

resetHullBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    })
});

startGraham.addEventListener("click", () => {
    doGrahamScan();
});

plotRandomBtn.addEventListener("click", () => {
    generateRandomPoints();
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    });
});

function reDrawLines(fromX, toY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    })
}

/**
 * Graham's Scan Convex Hull Algorithm
 * @desc An implementation of the Graham's Scan Convex Hull algorithm in JavaScript.
 * @author Brian Barnett, brian@3kb.co.uk, http://brianbar.net/ || http://3kb.co.uk/
 * @version 1.0.5
 */
function ConvexHullGrahamScan() {
    this.anchorPoint = undefined;
    this.reverse = false;
    this.points = [];
}

ConvexHullGrahamScan.prototype = {

    constructor: ConvexHullGrahamScan,

    Point: function (x, y) {
        this.x = x;
        this.y = y;
    },

    _findPolarAngle: function (a, b) {
        var ONE_RADIAN = 57.295779513082;
        var deltaX, deltaY;

        //if the points are undefined, return a zero difference angle.
        if (!a || !b) return 0;

        deltaX = (b.x - a.x);
        deltaY = (b.y - a.y);

        if (deltaX == 0 && deltaY == 0) {
            return 0;
        }

        var angle = Math.atan2(deltaY, deltaX) * ONE_RADIAN;

        if (this.reverse) {
            if (angle <= 0) {
                angle += 360;
            }
        } else {
            if (angle >= 0) {
                angle += 360;
            }
        }

        return angle;
    },

    addPoint: function (x, y) {
        //Check for a new anchor
        var newAnchor =
            (this.anchorPoint === undefined) ||
            (this.anchorPoint.y > y) ||
            (this.anchorPoint.y === y && this.anchorPoint.x > x);

        if (newAnchor) {
            if (this.anchorPoint !== undefined) {
                this.points.push(new this.Point(this.anchorPoint.x, this.anchorPoint.y));
            }
            this.anchorPoint = new this.Point(x, y);
        } else {
            this.points.push(new this.Point(x, y));
        }
    },

    _sortPoints: function () {
        var self = this;

        return this.points.sort(function (a, b) {
            var polarA = self._findPolarAngle(self.anchorPoint, a);
            var polarB = self._findPolarAngle(self.anchorPoint, b);

            if (polarA < polarB) {
                return -1;
            }
            if (polarA > polarB) {
                return 1;
            }

            return 0;
        });
    },

    _checkPoints: function (p0, p1, p2) {
        var difAngle;
        var cwAngle = this._findPolarAngle(p0, p1);
        var ccwAngle = this._findPolarAngle(p0, p2);

        if (cwAngle > ccwAngle) {

            difAngle = cwAngle - ccwAngle;

            return !(difAngle > 180);

        } else if (cwAngle < ccwAngle) {

            difAngle = ccwAngle - cwAngle;

            return (difAngle > 180);

        }

        return true;
    },

    getHull: function () {
        var hullPoints = [],
            points,
            pointsLength;

        this.reverse = this.points.every(function (point) {
            return (point.x < 0 && point.y < 0);
        });

        points = this._sortPoints();
        pointsLength = points.length;

        //If there are less than 3 points, joining these points creates a correct hull.
        if (pointsLength < 3) {
            points.unshift(this.anchorPoint);
            return points;
        }

        //move first two points to output array
        hullPoints.push(points.shift(), points.shift());

        //scan is repeated until no concave points are present.
        while (true) {
            var p0,
                p1,
                p2;

            hullPoints.push(points.shift());

            p0 = hullPoints[hullPoints.length - 3];
            p1 = hullPoints[hullPoints.length - 2];
            p2 = hullPoints[hullPoints.length - 1];

            if (this._checkPoints(p0, p1, p2)) {
                hullPoints.splice(hullPoints.length - 2, 1);
            }

            if (points.length == 0) {
                if (pointsLength == hullPoints.length) {
                    //check for duplicate anchorPoint edge-case, if not found, add the anchorpoint as the first item.
                    var ap = this.anchorPoint;
                    //remove any udefined elements in the hullPoints array.
                    hullPoints = hullPoints.filter(function (p) { return !!p; });
                    if (!hullPoints.some(function (p) {
                        return (p.x == ap.x && p.y == ap.y);
                    })) {
                        hullPoints.unshift(this.anchorPoint);
                    }
                    return hullPoints;
                }
                points = hullPoints;
                pointsLength = points.length;
                hullPoints = [];
                hullPoints.push(points.shift(), points.shift());
            }
        }
    }
};

// EXPORTS

if (typeof define === 'function' && define.amd) {
    define(function () {
        return ConvexHullGrahamScan;
    });
}
if (typeof module !== 'undefined') {
    module.exports = ConvexHullGrahamScan;
}

function bruteForceConvexHull() {
    const n = points.length;
    let hull = [];

    // Check all possible combinations of three points
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = j + 1; k < n; k++) {
                const a = points[i];
                const b = points[j];
                const c = points[k];

                //for (let i = 0; i < 3; i++){
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                reDraw(points);
                window.requestAnimationFrame(bruteForceConvexHull);


                if (orientationCH(a, b, c) === 2) {
                    // Points a, b, c form a counter-clockwise turn
                    if (!pointInsideHull(hull, a)) hull.push(a);
                    if (!pointInsideHull(hull, b)) hull.push(b);
                    if (!pointInsideHull(hull, c)) hull.push(c);
                }
            }
        }
    }
    return hull;
}

function orientationCH(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0; // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or counterclockwise
}

function pointInsideHull(hull, p) {
    // Check if point p is already in the convex hull
    for (let i = 0; i < hull.length; i++) {
        if (hull[i].x === p.x && hull[i].y === p.y) {
            return true;
        }
    }
    return false;
}


