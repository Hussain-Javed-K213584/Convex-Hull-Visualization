const startJarvisMarch = document.getElementById("start-jarvis");
const jarvisCanvas = document.getElementById("convex");
const ctxJarvis = jarvisCanvas.getContext("2d");

let currentJarvisIndex = 0;

async function doJarvisMarch() {
    let boundaryPoints = await JarvisConvexHull(points, points.length);
    let hullP = boundaryPoints;
    grahamPerformanceResult.innerText = `Algorithm Used: Jarvis March/Gift Wrapping\nTime Taken: ${hullP.performanceTime}ms`;
}

startJarvisMarch.addEventListener("click", () => {
    const jarvisPerformance = doJarvisMarch();
});

function JarvisleftIndex(points) {
    // We are trying to find the left mose point here
    min = 0;
    for (let i = 0; i < points.length; i++) {
        if (points[i].x < points[min].x) {
            min = i;
        }
        else if (points[i].x == points[min].x) {
            if (points[i].y > points[min].y) {
                min = i;
            }
        }
    }
    return min; // returns the index of the leftmost point
}

function JarvisorientationTest(p, q, r, JarvisHullPoints) {
    ctxJarvis.beginPath();
    ctxJarvis.moveTo(p.x, p.y);
    ctxJarvis.lineTo(q.x, q.y);
    ctxJarvis.closePath();
    ctxJarvis.stroke();
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0) {
        return 0;
    }
    else if (val > 0) {
        return 1;
    }
    else {
        return 2;
    }
}

function ExpermentalJarvisDraw(hullPointsj) {
    ctxJarvis.beginPath()
    ctxJarvis.strokeStyle = 'green';
    if (hullPointsj.length == 1) {
        ctxJarvis.strokeStyle = 'blue';
        return;
    };
    for (let i = 0; i < hullPointsj.length; i++) {
        ctxJarvis.lineTo(hullPointsj[i].x, hullPointsj[i].y);
    }
    ctxJarvis.stroke();
    ctxJarvis.strokeStyle = 'blue';
}

async function JarvisConvexHull(points, n) {
    let timeBefore,
        timeAfter,
        totalPerformace = 0;
    timeBefore = performance.now();
    if (n < 3) {
        return;
    }

    // Stores the leftmost index
    let l = JarvisleftIndex(points);
    let hull = []; // Stores the valid convex hull points
    let JarvisHullPoints = [];


    // Start with leftmost index
    let p = l;
    let q = 0;
    timeAfter = performance.now();
    totalPerformace += timeAfter - timeBefore;
    while (true) {
        timeBefore = performance.now();
        hull.push(p);
        JarvisHullPoints.push(points[p]);
        timeAfter = performance.now();
        totalPerformace += timeAfter - timeBefore;
        // This hull.push() means we found the index at which convex is created
        // Draw a line once this happens
        ExpermentalJarvisDraw(JarvisHullPoints);
        q = (p + 1) % n;
        for (let i = 0; i < n; i++) {
            // This is the loop where all the checks are being made
            // I should start the experimental animation here
            // Check if a right turn is being made
            // timeBefore = performance.now();
            orientationCheckJarvis = JarvisorientationTest(points[p],
                points[i], points[q], JarvisHullPoints);
            // timeAfter = performance.now();
            // totalPerformace += timeAfter - timeBefore;
            await sleep(100);
            ctxJarvis.clearRect(0, 0, canvas.width, canvas.height)
            points.forEach((point) => {
                plotPoints(point.x, point.y)
            })
            ExpermentalJarvisDraw(JarvisHullPoints);
            // totalPerformace += orientationCheckJarvis.perf;
            timeBefore = performance.now();
            if (orientationCheckJarvis == 2) {
                q = i;
            }
            timeAfter = performance.now();
            totalPerformace += timeAfter - timeBefore;
        }
        p = q;

        if (p == l) {
            break;
        }
        ExpermentalJarvisDraw(JarvisHullPoints);
    }
    // Draw the final hull when reaching the end
    ctxJarvis.strokeStyle = 'green';
    ctxJarvis.beginPath();
    ctxJarvis.moveTo(JarvisHullPoints[JarvisHullPoints.length - 1].x, JarvisHullPoints[JarvisHullPoints.length - 1].y);
    ctxJarvis.lineTo(JarvisHullPoints[0].x, JarvisHullPoints[0].y);
    ctxJarvis.closePath();
    ctxJarvis.stroke();
    ctxJarvis.strokeStyle = 'blue';
    return { hull: JarvisHullPoints, performanceTime: totalPerformace };
}