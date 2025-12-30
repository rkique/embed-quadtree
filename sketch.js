let qt;
let statusMsg = 'Loading points...';
let instrumentSerif;

function setup() {
    createCanvas(800, 800);
    instrumentSerif = loadFont('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap', 
        () => console.log('Font loaded'),
        () => {
            // Fallback: use textFont with CSS font name
            textFont('"Instrument Serif", serif');
        }
    );
    textFont('"Instrument Serif", serif');
    noLoop();
    loadJSON('points.json', onDataLoaded, onDataError);
}

function onDataLoaded(data) {
    const points = (data && data.points) || [];
    const boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    qt = new QuadTree(boundary, 1);

    for (const { x, y, label, index } of points) {
        const px = x * width;
        const py = y * height;
        qt.insert(new Point(px, py, label, index));
    }
    console.log('QuadTree constructed:', qt);
    statusMsg = points.length ? '' : 'No points in points.json';
    redraw();
}

function onDataError(err) {
    console.error('Failed to load points.json', err);
    statusMsg = 'points.json missing. Run `pip install -r requirements.txt` then `python precompute.py`.';
    redraw();
}

function draw() {
    background(0);

    if (!qt) {
        fill(255);
        textSize(14);
        text(statusMsg || 'Loading...', 20, 30);
        return;
    }

    qt.show();
    
    // Draw lines connecting quadrants in index order
    const allPoints = qt.getAllPoints();
    allPoints.sort((a, b) => a.index - b.index);
    
    noFill();
    
    // Define stroke weight range
    const maxStrokeWeight = 14;
    const minStrokeWeight = 0.5;
    
    for (let i = 0; i < allPoints.length - 1; i++) {
        const current = allPoints[i];
        const next = allPoints[i + 1];
        
        const currentCenter = qt.getQuadrantCenter(current);
        const nextCenter = qt.getQuadrantCenter(next);
        
        if (currentCenter && nextCenter) {
            // Calculate stroke weight based on position in sequence
            const progress = i / (allPoints.length - 1);
            const weight = maxStrokeWeight - (progress * (maxStrokeWeight - minStrokeWeight));
            
            strokeWeight(weight);
            stroke(255, 150, 105, 100); // Semi-transparent blue
            line(currentCenter.x, currentCenter.y, nextCenter.x, nextCenter.y);
        }
    }
}

// Press 's' to save high-resolution image
function keyPressed() {
    if (key === 's' || key === 'S') {
        saveCanvas('quadtree-visualization', 'png');
        console.log('Canvas saved as quadtree-visualization.png');
    }
}

// Double-click to save high-resolution image
function doubleClicked() {
    saveCanvas('quadtree-visualization', 'png');
    console.log('Canvas saved as quadtree-visualization.png');
}