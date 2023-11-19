// const canvas = document.getElementById("circle");
const resultDisplay = document.getElementById("result");
const startButton = document.getElementById("start-button");
// const ctx = canvas.getContext("2d");
// let previousPoints = {}  // List that holds tuple of previous points. Store as dictionarry
// function draw(mouseX, mouseY){

//   // Start at one point, draw a straight line to the other point
//   ctx.beginPath();
//   // If array is 0 means it's our first point
//   if (Object.keys(previousPoints).length === 0){
//     ctx.moveTo(mouseX, mouseY);
//   }
//   else {
//     ctx.moveTo(previousPoints.x, previousPoints.y); // Set cursor to previous point
//     ctx.lineTo(mouseX, mouseY); // Create a line from previous points to new points
//     ctx.closePath();
//     ctx.stroke();
//   }
// }

// function plotPoints(mouseX, mouseY){
//   const circle = new Path2D();
//   circle.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
//   ctx.fill(circle);
//   draw(mouseX, mouseY); // Once point is plotted, create a line pointing to next circle
// }

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

// canvas.addEventListener("click", (e) => {
//   // draw(e.pageX, e.pageY);
//   currentPoints = getMousePos(canvas, e);
//   console.log("New points are: " + currentPoints.x + "," + currentPoints.y);
//   plotPoints(currentPoints.x, currentPoints.y);
//   previousPoints = currentPoints;
//   console.log("Prev points are: " + previousPoints.x + "," + previousPoints.y);
// });


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

const newCanvas = document.getElementById("circle");
const newCtx = newCanvas.getContext("2d");

let L1Points = [
  {
    x: 0,
    y: 0
  },
  {
    x: 0,
    y: 0
  }
]
let L2Points = [
  {
    x: 0,
    y: 0
  },
  {
    x: 0,
    y: 0
  }
]

function plotPoints(x, y){
  const circle = new Path2D();
  circle.arc(x, y, 5, 0, 2*Math.PI);
  newCtx.fill(circle);
}

function drawTwoLines(x1, y1, x2, y2){
  newCtx.beginPath();
  newCtx.moveTo(x1, y1);
  newCtx.lineTo(x2, y2);
  newCtx.closePath();
  newCtx.stroke();
}

newCanvas.addEventListener("click", (e) => {
  if (L1Points[0].x == 0 && L1Points[0].y == 0) {
    FirstMousePoints = getMousePos(newCanvas, e);
    L1Points[0].x = FirstMousePoints.x;
    L1Points[0].y = FirstMousePoints.y;
    plotPoints(L1Points[0].x, L1Points[0].y);
  }
  else if (L1Points[1].x == 0 && L1Points[1].y == 0) {
    SecondMousePoints = getMousePos(newCanvas, e);
    L1Points[1].x = SecondMousePoints.x;
    L1Points[1].y = SecondMousePoints.y;
    plotPoints(L1Points[1].x, L1Points[1].y);
    drawTwoLines(L1Points[0].x, L1Points[0].y, L1Points[1].x, L1Points[1].y);
  }
  else if (L2Points[0].x == 0 && L2Points[0].y == 0) {
    FirstMousePoints = getMousePos(newCanvas, e);
    L2Points[0].x = FirstMousePoints.x;
    L2Points[0].y = FirstMousePoints.y;
    plotPoints(L2Points[0].x, L2Points[0].y);
  }
  else if (L2Points[1].x == 0 && L2Points[1].y == 0) {
    SecondMousePoints = getMousePos(newCanvas, e);
    L2Points[1].x = SecondMousePoints.x;
    L2Points[1].y = SecondMousePoints.y;
    plotPoints(L2Points[1].x, L2Points[1].y);
    drawTwoLines(L2Points[0].x, L2Points[0].y, L2Points[1].x, L2Points[1].y);
    console.log(doIntersect(L1Points, L2Points));
  }

});

startButton.addEventListener("click", (e) => {

});