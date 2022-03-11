var onScreenPoints = [];
var randomArray = [];
var closestPoints = [0, 0, 0, 0]; //x1, y1, x2, y2
var demoPoints = [
    [100, 100], [-123, -64], [23, -112],
    [160, -32], [48, 24], [0, 0],
    [112, -65], [21, 32], [111, -156], [-33, -145],
    [22, -22], [67, -164], [90, -29]
];

//#region Algorithms

let test = [3, 6, 1, 4, 8, 2, 5, 8, 3, 7, 8, 2];

// Modified version of: https://stackabuse.com/merge-sort-in-javascript/

// byCoord: 0 = x, 1 = y
function merge(left, right, byCoord) {
    let arr = []
    // Break out of loop if any one of the array gets empty
    while (left.length && right.length) {
        // Pick the smaller among the smallest element of left and right sub arrays 
        if (left[0][byCoord] < right[0][byCoord]) {
            arr.push(left.shift())
        } else {
            arr.push(right.shift())
        }
    }

    // Concatenating the leftover elements
    // (in case we didn't go through the entire left or right array)
    return [...arr, ...left, ...right]
}

/**
 * 
 * @param {int[]} array 
 * @param {(0|1)} byCoord 0 - x, 1 - y
 * @returns 
 */
function mergeSort(array, byCoord) {
    const half = array.length / 2

    // Base case or terminating case
    if (array.length < 2) {
        return array
    }

    const left = array.splice(0, half)
    return merge(mergeSort(left, byCoord), mergeSort(array, byCoord), byCoord)
}

function findClosestPair() {
    if (onScreenPoints.length < 2) {
        closestPoints = [];
        return;
    }

    if (selectedAlgo == 0) {
        let a = window.performance.now();
        let result = bruteForce(onScreenPoints);
        let b = window.performance.now();
        closestPoints[0] = result.pairOne[0];
        closestPoints[1] = result.pairOne[1];
        closestPoints[2] = result.pairTwo[0];
        closestPoints[3] = result.pairTwo[1];
        timeTaken.innerText = `Time: ${(b - a).toFixed(4)} ms Dist: ${result.distance.toFixed(4)}
        Pair: (${closestPoints[0] + ', ' + closestPoints[1]}) (${closestPoints[2] + ', ' + closestPoints[3]})`;
    } else {
        let a = window.performance.now();
        let result = efficientAlgorithm(onScreenPoints);
        let b = window.performance.now();
        closestPoints[0] = result.pairOne[0];
        closestPoints[1] = result.pairOne[1];
        closestPoints[2] = result.pairTwo[0];
        closestPoints[3] = result.pairTwo[1];
        timeTaken.innerText = `Time: ${(b - a).toFixed(4)} ms Dist: ${result.distance.toFixed(4)}
        Pair: (${closestPoints[0] + ', ' + closestPoints[1]}) (${closestPoints[2] + ', ' + closestPoints[3]})`;
    }
}

function efficientAlgorithm(array) {
    if (array.length <= 3) {
        return bruteForce(array);
    } else {
        let arrString = JSON.stringify(array);
        let arrLen = array.length;

        // Deep copy array to prevent sort messing up other points
        let arr = JSON.parse(arrString);
        // sort by x
        let sortedX = mergeSort(arr, 0);
        let center = Math.floor(arrLen / 2);

        // split into two arrays
        let arrleft = sortedX.slice(0, center);
        let arrRight = sortedX.slice(center, arrLen);
        // console.log("left");
        // arrleft.forEach(e => {
        //     console.log(e);
        // });

        // console.log("right");
        // arrRight.forEach(e => {
        //     console.log(e);
        // });

        let left_closest = efficientAlgorithm(arrleft);
        let right_closest = efficientAlgorithm(arrRight);

        let both_closest;

        if (left_closest.distance > right_closest.distance) {
            both_closest = right_closest;
        } else {
            both_closest = left_closest;
        }

        let y_list = [];
        for (let i = 0; i < arrLen; i++) {
            if (sortedX[Math.floor(arrLen / 2) - 1][0] - both_closest.distance < array[i][0]
                && array[i][0] < sortedX[Math.floor(arrLen / 2) - 1][0] + both_closest.distance
            ) {
                y_list.push(array[i]);
            }
        }

        let sortedY = mergeSort(y_list, 1);

        let final_closest, y_closest;

        if (sortedY.length == 1) {
            final_closest = both_closest;
        } else if (sortedY.length < 8) {
            y_closest = bruteForce(sortedY);
            if (both_closest.distance > y_closest.distance) {
                final_closest = y_closest;
            } else {
                final_closest = both_closest;
            }
        } else {
            for (let i = 0; i < sortedY.length - 7; i++) {
                y_closest = bruteForce(sortedY.slice(i, i + 7));

                if (both_closest.distance > y_closest.distance) {
                    final_closest = y_closest;
                } else {
                    final_closest = both_closest;
                }
            }
        }

        return final_closest;
    }


}

function bruteForce(arr) {
    let dmin = Number.MAX_SAFE_INTEGER;
    let idx1 = 0;
    let idx2 = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            let xi = arr[i][0];
            let yi = arr[i][1];
            let xj = arr[j][0];
            let yj = arr[j][1];

            d = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2);
            if (d < dmin) {
                dmin = d;
                idx1 = i;
                idx2 = j;
            }
        }
    }

    let toReturn = {
        pairOne: arr[idx1],
        pairTwo: arr[idx2],
        distance: dmin
    }

    return toReturn;
}

//#endregion

//#region Graphics Variables

var mainCanvas = document.getElementById('mainCanvas');
var mainCtx = mainCanvas.getContext('2d');
var subCanvas = document.getElementById('subCanvas');
var subCtx = subCanvas.getContext('2d');
var overlayCanvas = document.getElementById('overlayCanvas');
var overlayCtx = overlayCanvas.getContext('2d');
var points = document.getElementById('points');
var addPointBtn = document.getElementById('add-point');
var demoPointsBtn = document.getElementById('demo-points');
var clearAllBtn = document.getElementById('clear-all');
var subCanvasChecks = document.getElementById('subcanvas-checks');
var showGrid = document.getElementById('show-grid');
var gridSize = document.getElementById('grid-size');
var bruteRadio = document.getElementById('brute-force');
var efficientRadio = document.getElementById('efficient');
var timeTaken = document.getElementById('time-taken');
var largeRandomBtn = document.getElementById('large-random');
var selectedAlgo = 0;
var gridFineness = 40;

//#endregion

/**
 * Graphics
 */

function init() {
    addPointBtn.addEventListener('click', e => {
        points.appendChild(createPoint(0, 0));
        drawPoints();
    });
    largeRandomBtn.addEventListener('click', e => {
        let template = document.createElement('template');
        template.innerHTML = `<div id="large-random-input">
        Generate<br> <input value="5" type="number"> numbers
        <button id="clear-large">Delete</button>
        </div>`.trim();
        let elm = template.content.firstChild;
        elm.addEventListener('change', e => {
            let num = e.target.value
            generateRandomArray(-200, 200, num);
            drawPoints();
        });
        points.appendChild(elm);
        generateRandomArray(-200, 200, 5);
        drawPoints();
    });
    demoPointsBtn.addEventListener('click', e => {
        points.innerHTML = "";
        demoPoints.forEach(point => {
            points.appendChild(createPoint(point[0], point[1]));
        });
        drawPoints();
    });
    clearAllBtn.addEventListener('click', e => {
        points.innerHTML = "";
        randomArray = [];
        drawPoints();
    });
    points.addEventListener('click', e => {
        if (e.target.innerText == 'Delete') {
            if (e.target.id == 'clear-large') {
                randomArray = [];
            }
            removePoint(e);
            overlayCanvas.width = overlayCanvas.width;
            drawPoints();
        }
    });
    drawAxis(subCtx);
    showGrid.addEventListener('change', e => {
        subCanvas.width = subCanvas.width;
        if (showGrid.checked) {
            drawGrid(subCtx);
        }
        drawAxis(subCtx);
    });
    gridSize.addEventListener('input', e => {
        if (showGrid.checked) {
            subCanvas.width = subCanvas.width;
            gridFineness = parseInt(gridSize.value, 10);
            if (gridFineness == 30) {
                gridFineness = 40;
            }
            drawGrid(subCtx);
            drawAxis(subCtx);
        }
    });
    bruteRadio.addEventListener('click', e => {
        selectedAlgo = document.querySelector('input[name="algorithm"]:checked').value;
        drawPoints();
    });
    efficientRadio.addEventListener('click', e => {
        selectedAlgo = document.querySelector('input[name="algorithm"]:checked').value;
        drawPoints();
    });
}

function generateRandomArray(min, max, times) {
    randomArray = [];
    for (let i = 0; i < times; i++) {
        let x = Math.floor(Math.random() * (max - min) + min);
        let y = Math.floor(Math.random() * (max - min) + min);
        randomArray.push([x, y]);
    }
}

function pointMouseEnter(e) {
    overlayCanvas.width = overlayCanvas.width;
    let target = e.target;
    let x = parseInt(target.childNodes[1].value, 10);
    let y = parseInt(target.childNodes[3].value, 10);

    // Convert from cartesian to canvas
    x += 200;
    y = -y + 200;

    overlayCtx.beginPath();
    overlayCtx.arc(x, y, 5, 0, 2 * Math.PI, false);
    overlayCtx.fillStyle = '#FF0000';
    overlayCtx.fill();
}

function pointMouseLeave(e) {
    overlayCanvas.width = overlayCanvas.width;
}

function drawPoints() {
    onScreenPoints = [];
    for (let i = 0; i < points.children.length; i++) {
        const child = points.children[i];

        let x = parseInt(child.childNodes[1].value, 10);
        let y = parseInt(child.childNodes[3].value, 10);
        onScreenPoints.push([x, y]);
    }

    mainCanvas.width = mainCanvas.width
    onScreenPoints = onScreenPoints.concat(randomArray);
    onScreenPoints = onScreenPoints.slice(1, onScreenPoints.length+1);
    onScreenPoints.forEach(point => {
        let [x, y] = point;
        // Convert from cartesian to canvas
        x += 200;
        y = -y + 200;

        mainCtx.beginPath();
        mainCtx.arc(x, y, 3, 0, 2 * Math.PI, false);
        mainCtx.fillStyle = 'white';
        mainCtx.fill();
    });

    findClosestPair();

    mainCtx.beginPath();
    let x1 = closestPoints[0];
    let y1 = closestPoints[1];
    x1 += 200;
    y1 = -y1 + 200;
    let x2 = closestPoints[2];
    let y2 = closestPoints[3];
    x2 += 200;
    y2 = -y2 + 200;
    mainCtx.moveTo(x1, y1);
    mainCtx.lineTo(x2, y2);
    if (selectedAlgo == 0) {
        mainCtx.strokeStyle = "#FF0";
    } else {
        mainCtx.strokeStyle = "#0F0";
    }
    mainCtx.stroke();
}

function createPoint(x, y) {
    let template = document.createElement('template');
    template.innerHTML = `<div class="point">
    ( <input value="${x}" class="x" type="number"> ,
    <input value="${y}" class="y" type="number"> )
    <button>Delete</button>
    </div>`.trim();
    let elm = template.content.firstChild;
    elm.addEventListener('change', e => {
        if (e.target.value < -200) {
            e.target.value = -200;
        } else if (e.target.value > 200) {
            e.target.value = 200;
        }
        drawPoints();
    });
    elm.addEventListener('mouseenter', e => {
        pointMouseEnter(e);
    });
    elm.addEventListener('mouseleave', e => {
        pointMouseLeave(e);
    });
    return template.content.firstChild;
}

function drawGrid(ctx) {
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 400; i += gridFineness) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 400);
        ctx.stroke();
    }
    for (let i = 0; i < 400; i += gridFineness) {
        ctx.moveTo(0, i);
        ctx.lineTo(400, i);
        ctx.stroke();
    }
}

function drawAxis(ctx) {
    ctx.strokeStyle = "#555";
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 400);
    ctx.stroke();
    ctx.moveTo(0, 200);
    ctx.lineTo(400, 200);
    ctx.stroke();
    ctx.font = "12px Arial";
    ctx.strokeText("0", 205, 215);
    ctx.strokeText("200", 205, 15);
    ctx.strokeText("-200", 205, 395);
    ctx.strokeText("200", 375, 215);
    ctx.strokeText("-200", 5, 215);
}

function removePoint(e) {
    e.currentTarget.removeChild(e.target.parentElement);
}

window.addEventListener('load', e => {
    init();
});