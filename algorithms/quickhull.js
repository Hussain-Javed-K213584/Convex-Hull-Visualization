const startQuickHull = document.getElementById('start-quickhull');

let currentQuickHullIndex = 0;
function drawQuickHull(hullPoints) {
    ctx.beginPath();
    ctx.moveTo(hullPoints[currentQuickHullIndex].x, hullPoints[currentQuickHullIndex].y);
    currentQuickHullIndex++;
    if (currentQuickHullIndex == hullPoints.length) {
        return;
    }
    ctx.lineTo(hullPoints[currentQuickHullIndex].x, hullPoints[currentQuickHullIndex].y);
    ctx.stroke();
    if (currentQuickHullIndex == hullPoints.length) {
        return;
    }
    else {
        setTimeout(drawQuickHull, 500, hullPoints);
    }
}


async function doQuickHull() {
    // const quickHull1 = performance.now();
    let hullP = await QuickHull(points);
    await sleep(800);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    });
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(hullP[0].x, hullP[0].y);
    for (let i = 0; i < hullP.length; i++){
        ctx.lineTo(hullP[i].x, hullP[i].y);
    }
    ctx.stroke();
    // const quickHull2 = performance.now();
    // drawQuickHull(hullP);
    // return quickHull2 - quickHull1;
}

startQuickHull.addEventListener("click", (e) => {
    const quickHullResult = doQuickHull();
    // grahamPerformanceResult.innerText = `Algorithm Used: Quick Hull\nTime Taken: ${quickHullResult}ms`;
})

var hull = [];
var previousHullPoints = [];
var animationIndex;
async function QuickHull(points) {
    hull = [];
    var prevLen = 0;
    //if there are only three points, this is a triangle, which by definition is already a hull
    if (points.length == 3) {
        points.push(points[0]); //close the poly
        return points;
    }
    var baseline = getMinMaxPoints(points);
    previousHullPoints.push(baseline);
    // Create a line between the min and max points
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(baseline[0].x, baseline[0].y);
    ctx.lineTo(baseline[1].x, baseline[1].y);
    ctx.stroke();
    await addSegments(baseline, points);
    ctx.lineTo(hull[0].x, hull[0].y);
    ctx.stroke();
    ctx.strokeStyle = 'blue';
    await addSegments([baseline[1], baseline[0]], points); //reverse line direction to get points on other side
    // Print till previous length  
    //add the last point to make a closed loop
    hull.push(hull[0]);
    return hull;
}

function getMinMaxPoints(points) {
    var i;
    var minPoint;
    var maxPoint;

    minPoint = points[0];
    maxPoint = points[0];

    for (i = 1; i < points.length; i++) {
        if (points[i].x < minPoint.x)
            minPoint = points[i];
        if (points[i].x > maxPoint.x)
            maxPoint = points[i];
    }

    return [minPoint, maxPoint];
}

function distanceFromLine(point, line) {
    var vY = line[1].y - line[0].y;
    var vX = line[0].x - line[1].x;
    return (vX * (point.y - line[0].y) + vY * (point.x - line[0].x))
}

function distalPoints(line, points) {
    var i;
    var outer_points = [];
    var point;
    var distal_point;
    var distance = 0;
    var max_distance = 0;

    for (i = 0; i < points.length; i++) {
        point = points[i];
        distance = distanceFromLine(point, line);

        if (distance > 0) outer_points.push(point);
        else continue; //short circuit

        if (distance > max_distance) {
            distal_point = point;
            max_distance = distance;
        }

    }

    return { points: outer_points, max: distal_point };
}

function reDrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    });
}

function drawLine(point_1, point_2) {
    ctx.beginPath();
    ctx.moveTo(point_1.x, point_1.y);
    ctx.lineTo(point_2.x, point_2.y);
    ctx.stroke();
}

var newCalcPoints = [];

async function addSegments(line, points) {
    // reDrawCanvas();
    // if (previousHullPoints.length === 0){
    //     ctx.beginPath();
    //     ctx.moveTo(line[0].x, line[0].y);
    //     ctx.lineTo(line[1].x, line[1].y);
    //     ctx.stroke();
    // }
    // else if (previousHullPoints !== 0)
    // {
    //     // Draw the new polygon gained from the recursive call
    // }
    var distal = distalPoints(line, points);
    // After his point, save the line and distal.max together
    if (!distal.max) return hull.push(line[0]);
    // distal.max has the max point where i have to draw the triangle
    newCalcPoints.push([line, distal.max]);
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    ctx.lineTo(distal.max.x, distal.max.y);
    ctx.stroke();
    ctx.moveTo(line[1].x, line[1].y);
    ctx.lineTo(distal.max.x, distal.max.y);
    ctx.stroke();
    await sleep(800);
    // redraw again, then from baseline to line[0] to distmax, to line[1] to dismax to baseline
    await addSegments([line[0], distal.max], distal.points);
    await addSegments([distal.max, line[1]], distal.points);
}

if (((typeof require) != "undefined") &&
    ((typeof module) != "undefined") &&
    ((typeof module.exports) != "undefined"))
    module.exports = QuickHull;