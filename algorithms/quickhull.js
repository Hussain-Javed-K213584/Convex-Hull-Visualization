const startQuickHull = document.getElementById('start-quickhull');

let currentQuickHullIndex = 0;
function drawQuickHull(hullPoints){
    ctx.beginPath();
    ctx.moveTo(hullPoints[currentQuickHullIndex].x, hullPoints[currentQuickHullIndex].y);
    currentQuickHullIndex++;
    if (currentQuickHullIndex == hullPoints.length){
        return;
    }
    ctx.lineTo(hullPoints[currentQuickHullIndex].x, hullPoints[currentQuickHullIndex].y);
    ctx.stroke();
    if (currentQuickHullIndex == hullPoints.length){
        return;
    }
    else{
        setTimeout(drawQuickHull, 500, hullPoints);
    }
}


function doQuickHull(){
    const quickHull1 = performance.now();
    hullP = QuickHull(points);
    const quickHull2 = performance.now();
    drawQuickHull(hullP);
    return quickHull2 - quickHull1;
}

startQuickHull.addEventListener("click", (e) => {
    const quickHullResult = doQuickHull();
    grahamPerformanceResult.innerText = `Algorithm Used: Quick Hull\nTime Taken: ${quickHullResult}ms`;
})

var hull = [];

function QuickHull(points) {
    hull = [];
    //if there are only three points, this is a triangle, which by definition is already a hull
    if(points.length == 3) {
        points.push(points[0]); //close the poly
        return points;
    }
    var baseline = getMinMaxPoints(points);
    addSegments(baseline, points);
    addSegments([baseline[1], baseline[0]], points); //reverse line direction to get points on other side
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

    for(i=1; i<points.length; i++) {
        if(points[i].x < minPoint.x)
            minPoint = points[i];
        if(points[i].x > maxPoint.x)
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
    var distance=0;
    var max_distance=0;

    for(i=0; i<points.length; i++) {
        point = points[i];
        distance = distanceFromLine(point,line);

        if(distance > 0) outer_points.push(point);
        else continue; //short circuit

        if(distance > max_distance) {
            distal_point = point;
            max_distance = distance;
        }

    }

    return {points: outer_points, max: distal_point};
}

function addSegments(line, points) {
    var distal = distalPoints(line, points);
    if(!distal.max) return hull.push(line[0]);
    addSegments([line[0], distal.max], distal.points);
    addSegments([distal.max, line[1]], distal.points);
}

if(((typeof require) != "undefined") && 
   ((typeof module) != "undefined") && 
   ((typeof module.exports) != "undefined"))
    module.exports = QuickHull;