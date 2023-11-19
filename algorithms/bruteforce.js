const startBruteForce = document.getElementById("start-bruteforce");


function convertDictToArray(points){
    let result = [];
    for (let i = 0; i < points.length; i++){
        result.push([points[i].x, points[i].y]);
    }
    console.log(result);
    return result;
}

function convertPointsToDict(pointsArray){
    let result = [];
    for(let i = 0; i < pointsArray.length; i++){
        console.log(pointsArray[i]);
        result.push({
            x: pointsArray[i][0],
            y: pointsArray[i][1]
        })
    }
    return result;
}

function drawLineFromXtoY(P1, P2){
    ctx.beginPath();
    ctx.moveTo(P1.x, P1.y);
    ctx.lineTo(P2.x, P2.y);
    ctx.stroke();
    ctx.closePath();
}

function clearCanvasAndDrawAgain(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    });
}
function drawLines(hullPoints){
    ctx.beginPath();
    for (let i = 0; i < hullPoints.length-1; i++){
        ctx.moveTo(hullPoints[i].x, hullPoints[i].y);
        ctx.lineTo(hullPoints[i+1].x, hullPoints[i+1].y);
        ctx.stroke();
    }
}

let currentBruteIndex = 0;
function drawHullBruteForce(hullPoints){
    ctx.beginPath();
    ctx.moveTo(hullPoints[currentBruteIndex].x, hullPoints[currentBruteIndex].y);
    ++currentBruteIndex;
    if (currentBruteIndex == hullPoints.length){
        ctx.moveTo(hullPoints[currentBruteIndex - 1].x, hullPoints[currentBruteIndex - 1].y);
        ctx.lineTo(hullPoints[0].x, hullPoints[0].y);
        ctx.stroke();
        ctx.closePath();
        currentBruteIndex = 0;
        return;
    }
    ctx.lineTo(hullPoints[currentBruteIndex].x, hullPoints[currentBruteIndex].y);
    ctx.stroke();
    setTimeout(drawHullBruteForce, 500, hullPoints);
}

function doBruteForce(){
    let arrayPoints = convertDictToArray(points);
    let hullPointsBruteForce = bruteHull(arrayPoints);
    hullPointsBruteForce = convertPointsToDict(hullPointsBruteForce);
    drawHullBruteForce(hullPointsBruteForce);
}

startBruteForce.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    })
    doBruteForce();
});


function bruteHull(a) {
    const s = new Set();

    for (let i = 0; i < a.length; i++) {
        for (let j = i + 1; j < a.length; j++) {
            const x1 = a[i][0], x2 = a[j][0];
            const y1 = a[i][1], y2 = a[j][1];
            const a1 = y1 - y2, b1 = x2 - x1, c1 = x1 * y2 - y1 * x2;

            let pos = 0, neg = 0;

            for (let k = 0; k < a.length; k++) {
                if (k === i || k === j || a1 * a[k][0] + b1 * a[k][1] + c1 <= 0) {
                    neg += 1;
                }
                if (k === i || k === j || a1 * a[k][0] + b1 * a[k][1] + c1 >= 0) {
                    pos += 1;
                }
            }

            if (pos === a.length || neg === a.length) {
                s.add(JSON.stringify(a[i]));
                s.add(JSON.stringify(a[j]));
            }
        }
    }

    const ret = Array.from(s, JSON.parse);

    // Sorting the points in the anti-clockwise order
    const mid = [0, 0];
    const n = ret.length;

    for (let i = 0; i < n; i++) {
        mid[0] += ret[i][0];
        mid[1] += ret[i][1];
        ret[i][0] *= n;
        ret[i][1] *= n;
    }

    ret.sort((a, b) => compare(a, b, mid));

    for (let i = 0; i < n; i++) {
        ret[i][0] /= n;
        ret[i][1] /= n;
    }

    return ret;
}

function compare(a, b, mid) {
    const angleA = Math.atan2(a[1] - mid[1], a[0] - mid[0]);
    const angleB = Math.atan2(b[1] - mid[1], b[0] - mid[0]);

    return angleA - angleB;
}