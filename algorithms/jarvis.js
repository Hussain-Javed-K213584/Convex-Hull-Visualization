const startJarvisMarch = document.getElementById("start-jarvis");
const jarvisCanvas = document.getElementById("convex");
const ctxJarvis = jarvisCanvas.getContext("2d");

let currentJarvisIndex = 0;
function drawHullJarvis(hullPoints) {
    ctxJarvis.beginPath();
    ctxJarvis.moveTo(hullPoints[currentJarvisIndex].x, hullPoints[currentJarvisIndex].y);
    console.log(hullPoints);
    ++currentJarvisIndex;
    if (currentJarvisIndex == hullPoints.length){
        ctxJarvis.moveTo(hullPoints[currentJarvisIndex - 1].x, hullPoints[currentJarvisIndex - 1].y);
        ctxJarvis.lineTo(hullPoints[0].x, hullPoints[0].y);
        ctxJarvis.stroke();
        ctxJarvis.closePath();
        currentJarvisIndex = 0;
        return;
    }
    ctxJarvis.lineTo(hullPoints[currentJarvisIndex].x, hullPoints[currentJarvisIndex].y);
    ctxJarvis.stroke();
    setTimeout(drawHullJarvis, 500, hullPoints);
}


function doJarvisMarch(){
    
    const jarvis1 = performance.now();
    let boundaryPoints =  JarvisConvexHull(points, points.length);
    const jarvis2 = performance.now();
    let hullP = boundaryPoints;
    drawHullJarvis(hullP);
    return jarvis2 - jarvis1;
}

startJarvisMarch.addEventListener("click", () => {
    const jarvisPerformance =  doJarvisMarch();
    grahamPerformanceResult.innerText = `Algorithm Used: Jarvis March/Gift Wrapping\nTime Taken: ${jarvisPerformance}ms`;
});

function JarvisleftIndex(points){
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
    return min;
}

function JarvisorientationTest(p, q, r){
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

function JarvisConvexHull(points, n){
    if (n < 3){
        return;
    }

    let l = JarvisleftIndex(points);
    hull = [];


    // Start with leftmost index
    let p = l;
    let q = 0;
    while(true){
        hull.push(p);

        q = (p + 1) % n;
        for (let i = 0; i < n; i++){
            if (JarvisorientationTest(points[p],
                points[i], points[q]) == 2){
                    q = i;
                }
        }
        p = q;

        if (p == l){
            break;
        }
    }
    
    let hullPoints = [];
    hull.forEach((index) => {
        hullPoints.push(points[index]);
    });
    return hullPoints;
}