const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultDisplay = document.getElementById("result");
const orientationButton = document.getElementById("orientation-button");
const crossProdBtn = document.getElementById("cross-product-btn");
const lineSegmentResult = document.getElementById("line-segment-result");

// Thank u stack overflow
function  getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
  scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
  scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
  
  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}


/*
    Everything below this line implements the logic for checking
    wether two lines intersect or not. If this work, this can be added to the project.
*/

function orientationCH(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0; // Collinear
  return (val > 0) ? 1 : -1; // Clockwise or counterclockwise
}

function onSegment(p, q, r) {
  return (
      (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x)) &&
      (q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
  );
}

function doIntersect(L1, L2) {
  const p1 = L1[0], q1 = L1[1];
  const p2 = L2[0], q2 = L2[1];

  const o1 = orientationCH(p1, q1, p2);
  const o2 = orientationCH(p1, q1, q2);
  const o3 = orientationCH(p2, q2, p1);
  const o4 = orientationCH(p2, q2, q1);

  // General case
  if (o1 !== o2 && o3 !== o4) {
      return true;
  }

  // Special Cases
  // p1, q1, and p2 are collinear and p2 lies on segment p1q1
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;

  // p1, q1, and q2 are collinear and q2 lies on segment p1q1
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;

  // p2, q2, and p1 are collinear and p1 lies on segment p2q2
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;

  // p2, q2, and q1 are collinear and q1 lies on segment p2q2
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall in any of the above cases
}

/* 
  Below is the implementation to check if two lines
  intersect using the cross product method
*/

function crossProduct(p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

function lineSegmentIntersectCrossProduct(p1, p2, p3, p4) {
  const cross1 = crossProduct(p1, p2, p3);
  const cross2 = crossProduct(p1, p2, p4);
  const cross3 = crossProduct(p3, p4, p1);
  const cross4 = crossProduct(p3, p4, p2);
  
  // Two alternating cross vairables must have opposite signs
  // To check if two lines intersect or not
  return (cross1 * cross2 < 0) && (cross3 * cross4 < 0);
}

function plotPoints(x, y){
  const circle = new Path2D();
  circle.arc(x, y, 5, 0, 2*Math.PI);
  ctx.fill(circle);
}

function drawLines(points){
  ctx.beginPath();
  if (points.length == 2){
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.closePath();
    ctx.stroke();
  }
  else if (points.length == 4){
    ctx.moveTo(points[2].x, points[2].y);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.closePath();
    ctx.stroke();
  }
}

let linePoints = [];

canvas.addEventListener("click", (event) => {
  // Add points to list of points
  let point = getMousePos(canvas, event);
  linePoints.push(point);
  plotPoints(point.x, point.y);
  if (linePoints.length % 2 == 0){
    drawLines(linePoints);
  }
});

orientationButton.addEventListener("click", (e) => {
  let l1 = [linePoints[0], linePoints[1]], l2 = [linePoints[2], linePoints[3]];
  let condition = doIntersect(l1, l2);
  if (condition){
    console.log("Intersects");
    lineSegmentResult.innerText = "Line Intersects. Orientation Method was used."
  }
  else{
    console.log("Does not intersect");
    lineSegmentResult.innerText = "Lines do not intersect. Orientation Method was used."
  }
});

crossProdBtn.addEventListener("click", () => {
  let condition = lineSegmentIntersectCrossProduct(linePoints[0], linePoints[1], linePoints[2], linePoints[3]);
  if (condition){
    console.log("Line Intersects");
    lineSegmentResult.innerText = "Lines Intersect. Vector Product method was used."
  }
  else{
    console.log("Does not Intersect");
    lineSegmentResult.innerText = "Lines do not intersect. Vector Product method was used."
  }
});