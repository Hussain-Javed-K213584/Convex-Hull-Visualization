const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const points = [{ x: 10, y: 20 }, { x: 50, y: 40 }, { x: 100, y: 30 }];

function drawPoints() {
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
  }
}

function orientation(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) {
        return 0; // Collinear
    } else {
        return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
    }
}

function checkValidConvexHullLine(point1, point2) {
  for (const point of points) {
    if (point === point1 || point === point2) continue;

    const orientationCheck = orientation(point1, point2, point);
    if (orientationCheck === 0) continue; // Point lies on the line

    if (orientationCheck > 0) return false; // Point lies on the wrong side
  }

  return true;
}

function drawConvexHullLines() {
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (checkValidConvexHullLine(points[i], points[j])) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.strokeStyle = '#f00';
        ctx.stroke();
      }
    }
  }
}

function visualizeStep() {
  drawPoints();
  drawConvexHullLines();

  setTimeout(() => {
    // Clear canvas for next step
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    visualizeStep(); // Repeat for each step
  }, 1000); // Adjust delay for desired animation speed
}

visualizeStep();
