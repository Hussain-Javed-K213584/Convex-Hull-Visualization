const startBruteForce = document.getElementById("start-bruteforce");
const performanceResult = document.getElementById("performance-result");

function convertDictToArray(points){
    let result = [];
    for (let i = 0; i < points.length; i++){
        result.push([points[i].x, points[i].y]);
    }
    return result;
}

function convertPointsToDict(pointsArray){
    let result = [];
    for(let i = 0; i < pointsArray.length; i++){
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

/*
    #####################################################
    # Expermemtal feature to add bruteforce animation   #
    # Should show transitions, checking each point from #
    # starting point and then making the convex.        #
    #####################################################

*/

// Draws a line from point A to point B
function drawLineBruteForceXtoY(L1, L2){
    ctx.beginPath();
    ctx.moveTo(L1.x, L1.y);
    ctx.lineTo(L2.x, L2.y);
    ctx.stroke();
}

// Draws a convex upto the upper limit provided
async function drawHullExperimentalBruteForce(hullPoints, upperLimit){
    ctx.beginPath();
    ctx.moveTo(hullPoints[0].x, hullPoints[0].y);
    for(let i = 0; i <= upperLimit; i++){
        ctx.lineTo(hullPoints[i].x, hullPoints[i].y);
    }
    ctx.stroke();
}

async function bruteForceTransitionAnimation(hullPoints){
    // Start with the original array
    // Then create and erase lines from one point to the other
    // Use two loops, once the inner loop ends, create the first
    // conves line and continue onwards.
    let index1 = 0, index2 = 1; // Variables for hullPoints
    let upperLimit = 0; // The index till where the hull should be drawn
    // Outer loop stops at length - 1 becuase it would continue to draw even when hull was created
    for (let i = 0; i < hullPoints.length; i++){
        for (let j = 0; j < points.length; j++){
            drawLineBruteForceXtoY(points[i], points[j]); // We now know that this function creates a line from one point to the other
            await sleep(50);
            // Remove the previous line and plot points again
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            points.forEach((point) => {
                plotPoints(point.x, point.y);
            })
            // Draw the hull again
            await drawHullExperimentalBruteForce(hullPoints, upperLimit);
        }
        // After the inner loop ends, create the first convex
        drawLineBruteForceXtoY(hullPoints[index1], hullPoints[index2]);
        upperLimit = index2;
        index1++;
        index2++;
        // If index2 reaches end+1, it's time to finish convex hull
        if (index2 == hullPoints.length){
            index2 = 0;
        }
    }
}

/*

    ###################################
    #Experimental code end            #
    ###################################

*/
function doBruteForce(){
    let arrayPoints = convertDictToArray(points);
    const brute1 = performance.now();
    let hullPointsBruteForce = bruteHull(arrayPoints);
    const brute2 = performance.now();
    const bruteHullPerf = brute2 - brute1;
    hullPointsBruteForce = convertPointsToDict(hullPointsBruteForce);

    //drawHullBruteForce(hullPointsBruteForce); Code commented and replaced to test experimental feature
    bruteForceTransitionAnimation(hullPointsBruteForce);
    
    return bruteHullPerf;
}

startBruteForce.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
        plotPoints(point.x, point.y);
    })
    const bruteforcePerformance = doBruteForce();
    performanceResult.innerText = `Algorithm used: Brute Force\nTime taken: ${bruteforcePerformance}ms`;
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