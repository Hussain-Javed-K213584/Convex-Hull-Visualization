const canvas = document.getElementById("convex");
const ctx = canvas.getContext("2d");
const startGraham = document.getElementById("start-graham");
const resetHullBtn = document.getElementById('reset-points');
const plotRandomBtn = document.getElementById('plot-random');
const grahamPerformanceResult = document.getElementById("performance-result");
ctx.lineWidth = 3; // Set line width to 3

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
    const t1 = performance.now();
    let hull = new ConvexHullGrahamScan()
    const t2 = performance.now();
    const grahamPerformance = t2 - t1;
    points.forEach((point) => {
        hull.addPoint(point.x, point.y);
    })
    let hullP = hull.getHull();
    console.log(hullP);
    drawGrahamHull(hullP);
    return grahamPerformance;
}

function generateRandomPoints(){
    let cWidth = canvas.width, cHeight = canvas.height;
    let randomInterval = function (min, max){
        return (Math.random() * (max - min + 1) + min);
    }
    for (let i = 0; i < 500; i++){
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
    grahamPerformanceResult.innerText = "";
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    })
});

startGraham.addEventListener("click", () => {
    const grahamPerformance = doGrahamScan();
    grahamPerformanceResult.innerText = `Algorithm Used: Graham Scan\nTime Taken: ${grahamPerformance}ms`;
});

plotRandomBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Empty canvas
    for (let i = 0; i < points.length; i++){
        points.shift();
    }
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