const canvas = document.getElementById("convex");
const ctx = canvas.getContext("2d");
const startGraham = document.getElementById("start-graham");
const resetHullBtn = document.getElementById('reset-points');
const plotRandomBtn = document.getElementById('plot-random');
const grahamPerformanceResult = document.getElementById("performance-result");
ctx.lineWidth = 3; // Set line width to 3

function draw(){
    ctx.canvas.width = window.innerWidth / 1.5;
    ctx.canvas.height = window.innerHeight / 1.5;
    ctx.lineWidth = 3;
}

draw();

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

async function doGrahamScan() {
    let grahamscan = new GrahamScan();
	points.forEach((point) => {
        grahamscan.addPoint([point.x, point.y]);	
	})
	let hull = await grahamscan.getHull(); // Await works, now have to do performace.now()
	console.log(hull.performanceTime);
    let hullPoints = [];
	hull.hull.forEach((hullpoint) => {
        hullPoints.push({x: hullpoint[0], y: hullpoint[1]});
	})
	console.log(hullPoints);
    grahamPerformanceResult.innerText = `Algorithm Used: Graham Scan\nTime Taken: ${hull.performanceTime}ms`;
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
    grahamPerformanceResult.innerText = "";
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    })
});

startGraham.addEventListener("click", () => {
    doGrahamScan();
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

function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points) {
    points.sort(function(a, b) {
        return a.x == b.x ? a.y - b.y : a.x - b.x;
    });

    var lower = [];
    for (var i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }

    var upper = [];
    for (var i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
}


const X = 0;
const Y = 1;
const REMOVED = -1;

class GrahamScan {

    constructor() {
        /** @type {[Number, Number][]} */
        this.points = [];
        this.totalPerformace = 0,
        this.timeBefore,
        this.timeAfter;
    }

    clear() {
        this.points = [];
    }

    getPoints() {
        return this.points;
    }

    setPoints(points) {
        this.points = points.slice();  // copy
    }

    addPoint(point) {
        this.points.push(point);
    }

    /**
     * Returns the smallest convex hull of a given set of points. Runs in O(n log n).
     *
     * @return {[Number, Number][]}
     */
    async getHull() {
        this.timeBefore = performance.now();
        const pivot = this.preparePivotPoint();

        let indexes = Array.from(this.points, (point, i) => i);
        const angles = Array.from(this.points, (point) => this.getAngle(pivot, point));
        const distances = Array.from(this.points, (point) => this.euclideanDistanceSquared(pivot, point));

        // sort by angle and distance
        indexes.sort((i, j) => {
            const angleA = angles[i];
            const angleB = angles[j];
            if (angleA === angleB) {
                const distanceA = distances[i];
                const distanceB = distances[j];
                return distanceA - distanceB;
            }
            return angleA - angleB;
        });

        // remove points with repeated angle (but never the pivot, so start from i=1)
        for (let i = 1; i < indexes.length - 1; i++) {
            if (angles[indexes[i]] === angles[indexes[i + 1]]) {  // next one has same angle and is farther
                indexes[i] = REMOVED;  // remove it logically to avoid O(n) operation to physically remove it
            }
        }

        const hull = [];
        this.timeAfter = performance.now();
        this.totalPerformace += this.timeAfter - this.timeBefore; // This calculates time before loop starts
        for (let i = 0; i < indexes.length; i++) {
            this.timeBefore = performance.now();
            const index = indexes[i];
            const point = this.points[index];

            if (index !== REMOVED) {
                if (hull.length < 3) {
                    hull.push(point);
					// Add an animation here
					// First 3 points are always added in stack
					if (hull.length > 1){
						ctx.strokeStyle = 'green';
						ctx.beginPath();
						ctx.moveTo(hull[i-1][0], hull[i-1][1])
						ctx.lineTo(hull[i][0], hull[i][1]);
						ctx.stroke();
                        this.timeAfter = performance.now();
                        this.totalPerformace += this.timeAfter - this.timeBefore;
						await this.sleep(200);
						ctx.strokeStyle = 'black';
					}

                } else {
                    this.timeBefore = performance.now();
					let orientationPoint = this.checkOrientation(hull[hull.length - 2], hull[hull.length - 1], point)
                    this.timeAfter = performance.now();
                    this.totalPerformace += this.timeAfter - this.timeBefore;
                    await this.sleep(200);
					while (orientationPoint > 0) {
                        this.timeBefore = performance.now();
                        hull.pop();
						// A point is being popped here after pop reset canvas
						// Draw lines again with the current given hull after pop
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						points.forEach((point) => {
							plotPoints(point.x, point.y);
						})
						ctx.strokeStyle = 'green';
						ctx.beginPath();
						ctx.moveTo(hull[0][0], hull[0][1]);
						for (let i = 0; i < hull.length; i++){
							ctx.lineTo(hull[i][0], hull[i][1]);
						}
						ctx.stroke();
						ctx.strokeStyle = 'black';
						orientationPoint = this.checkOrientation(hull[hull.length - 2], hull[hull.length - 1], point);
						this.timeAfter = performance.now();
                        this.totalPerformace = this.timeAfter - this.timeBefore;
                        await this.sleep(200);
					}
                    this.timeBefore = performance.now();
                    hull.push(point);
					if (i == indexes.length - 1){
						ctx.strokeStyle = 'green';
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						points.forEach((point) => {
							plotPoints(point.x, point.y);
						})
						ctx.beginPath();
						ctx.moveTo(hull[0][0], hull[0][1]);
						for (let i = 0; i < hull.length; i++){
							ctx.lineTo(hull[i][0], hull[i][1]);
						}
						ctx.stroke();
						ctx.lineTo(hull[0][0], hull[0][1]);
						ctx.stroke();
					}
                    this.timeAfter = performance.now();
                    this.totalPerformace = this.timeAfter - this.timeBefore;
                }
            }
        }

        return {
           hull: hull.length < 3 ? [] : hull,
           performanceTime: this.totalPerformace
        };
    }

	/**
	 * A sleep function which utilizes Promise and setTimeout to cause a delay.
	 * 
	 * @param {Number} ms 
	 * @returns {None}
	 */
	sleep(ms){
		return new Promise(resolve => setTimeout(resolve, ms));
	}

    /**
     * Check the orientation of 3 points in the order given.
     *
     * It works by comparing the slope of P1->P2 vs P2->P3. If P1->P2 > P2->P3, orientation is clockwise; if
     * P1->P2 < P2->P3, counter-clockwise. If P1->P2 == P2->P3, points are co-linear.
     *
     * @param {[Number, Number]} p1
     * @param {[Number, Number]} p2
     * @param {[Number, Number]} p3
     * @return {Number} positive if orientation is clockwise, negative if counter-clockwise, 0 if co-linear
     */
    checkOrientation(p1, p2, p3) {
		// Check orientation from p2 to p3 for animation
		ctx.strokeStyle = 'red';
		ctx.beginPath();
		ctx.moveTo(p2[0], p2[1]);
		ctx.lineTo(p3[0], p3[1]);
		ctx.stroke();
		ctx.strokeStyle = 'black';
        return (p2[Y] - p1[Y]) * (p3[X] - p2[X]) - (p3[Y] - p2[Y]) * (p2[X] - p1[X]);
    }

    /**
     * @private
     * @param {[Number, Number]} a
     * @param {[Number, Number]} b
     * @return Number
     */
    getAngle(a, b) {
        return Math.atan2(b[Y] - a[Y], b[X] - a[X]);
    }

    /**
     * @private
     * @param {[Number, Number]} p1
     * @param {[Number, Number]} p2
     * @return {Number}
     */
    euclideanDistanceSquared(p1, p2) {
        const a = p2[X] - p1[X];
        const b = p2[Y] - p1[Y];
        return a * a + b * b;
    }

    /**
     * @private
     * @return {[Number, Number]}
     */
    preparePivotPoint() {
        let pivot = this.points[0];
        let pivotIndex = 0;
        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];
            if (point[Y] < pivot[Y] || point[Y] === pivot[Y] && point[X] < pivot[X]) {
                pivot = point;
                pivotIndex = i;
            }
        }
        return pivot;
    }
}