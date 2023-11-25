const startJarvisMarch = document.getElementById("start-jarvis");
const jarvisCanvas = document.getElementById("convex");
const ctxJarvis = jarvisCanvas.getContext("2d");

let currentJarvisIndex = 0;

async function doJarvisMarch(){
    
    const jarvis1 = performance.now();
    let boundaryPoints = await JarvisConvexHull(points, points.length);
    const jarvis2 = performance.now();
    let hullP = boundaryPoints;
    return jarvis2 - jarvis1;
}

startJarvisMarch.addEventListener("click", () => {
    const jarvisPerformance =  doJarvisMarch();
    grahamPerformanceResult.innerText = `Algorithm Used: Jarvis March/Gift Wrapping\nTime Taken: ${jarvisPerformance}ms`;
});

function JarvisleftIndex(points){
    // We are trying to find the left mose point here
    min = 0;
    for (let i = 0; i < points.length; i++){
        if (points[i].x < points[min].x) {
            min = i;
        }
        else if (points[i].x == points[min].x){
            if (points[i].y > points[min].y){
                min = i;
            }
        }
    }
    return min; // returns the index of the leftmost point
}

async function JarvisorientationTest(p, q, r, JarvisHullPoints){
    ctxJarvis.beginPath();
    ctxJarvis.moveTo(p.x, p.y);
    ctxJarvis.lineTo(q.x, q.y);
    ctxJarvis.closePath();
    ctxJarvis.stroke();
    await sleep(100);
    ctxJarvis.clearRect(0, 0, canvas.width, canvas.height)
    points.forEach((point) => {
        plotPoints(point.x, point.y)
    })
    ExpermentalJarvisDraw(JarvisHullPoints);
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0){
        return 0;
    }
    else if (val > 0){
        return 1;
    }
    else{
        return 2;
    }
}

async function ExpermentalJarvisDraw(hullPointsj){
    ctxJarvis.beginPath()
    ctxJarvis.strokeStyle = 'green';
    if (hullPointsj.length == 1){
        ctxJarvis.strokeStyle = 'blue';
        return;
    };
    for (let i =0; i < hullPointsj.length; i++){
        ctxJarvis.lineTo(hullPointsj[i].x, hullPointsj[i].y);
    }
    ctxJarvis.stroke();
    ctxJarvis.strokeStyle = 'blue';
}

async function JarvisConvexHull(points, n){
    if (n < 3){
        return;
    }
    
    // Stores the leftmost index
    let l = JarvisleftIndex(points);
    let hull = []; // Stores the valid convex hull points
    let JarvisHullPoints = [];
    

    // Start with leftmost index
    let p = l;
    let q = 0;
    while(true){
        hull.push(p);
        JarvisHullPoints.push(points[p])
        // This hull.push() means we found the index at which convex is created
        // Draw a line once this happens
        await ExpermentalJarvisDraw(JarvisHullPoints);
        q = (p + 1) % n;
        for (let i = 0; i < n; i++){
            // This is the loop where all the checks are being made
            // I should start the experimental animation here
            // Check if a right turn is being made
            if (await JarvisorientationTest(points[p],
                points[i], points[q], JarvisHullPoints) == 2){
                    q = i;
                }
        }
        p = q;

        if (p == l){
            break;
        }
        await ExpermentalJarvisDraw(JarvisHullPoints);
    }
    // Draw the final hull when reaching the end
    ctxJarvis.strokeStyle = 'green';
    ctxJarvis.beginPath();
    ctxJarvis.moveTo(JarvisHullPoints[JarvisHullPoints.length - 1].x, JarvisHullPoints[JarvisHullPoints.length -1].y);
    ctxJarvis.lineTo(JarvisHullPoints[0].x, JarvisHullPoints[0].y);
    ctxJarvis.closePath();
    ctxJarvis.stroke();
    ctxJarvis.strokeStyle = 'blue';
    return JarvisHullPoints;
}