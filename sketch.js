let qt;
let statusMsg = 'Loading points...';

function setup() {
    createCanvas(800, 800);
    noLoop();
    loadJSON('points.json', onDataLoaded, onDataError);
}

function onDataLoaded(data) {
    const points = (data && data.points) || [];
    const boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    qt = new QuadTree(boundary, 1);

    for (const { x, y, label } of points) {
        const px = x * width;
        const py = y * height;
        qt.insert(new Point(px, py, label));
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
}