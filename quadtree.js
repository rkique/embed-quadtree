class Point {
    constructor(x, y, label = '') {
        this.x = x;
        this.y = y;
        this.label = label;
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (
            point.x >= this.x - this.w &&
            point.x <= this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y <= this.y + this.h
        );
    }
}

class QuadTree {

    constructor(boundary, n) {
        this.boundary = boundary;
        this.capacity = n;
        this.points = []
        this.divided = false;
    }

    //x,y, w, h subdivide.
    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w;
        const h = this.boundary.h;

        const hw = w / 2;
        const hh = h / 2;

        const nw = new Rectangle(x - hw, y - hh, hw, hh);
        const ne = new Rectangle(x + hw, y - hh, hw, hh);
        const sw = new Rectangle(x - hw, y + hh, hw, hh);
        const se = new Rectangle(x + hw, y + hh, hw, hh);
        this.northwest = new QuadTree(nw, this.capacity);
        this.northeast = new QuadTree(ne, this.capacity);
        this.southwest = new QuadTree(sw, this.capacity);
        this.southeast = new QuadTree(se, this.capacity);
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
            this.divided = true;

            // Push existing points down into children so deeper levels can form
            for (const p of this.points) {
                this.northeast.insert(p) ||
                this.northwest.insert(p) ||
                this.southeast.insert(p) ||
                this.southwest.insert(p);
            }
            this.points = [];
        }

        return (
            this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point)
        );
    }

    show(){
        //render x, y in new frame.
        push();
        rectMode(CENTER);
        stroke(80);
        noFill();
        strokeWeight(1);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);

        // Render points stored at this node
        for (const p of this.points) {
            stroke(255);
            strokeWeight(4);
            point(p.x, p.y);
            noStroke();
            fill(220);
            textSize(10);
            text(p.label || '', p.x + 6, p.y - 4);
        }

        if (this.divided){
            this.northwest.show();
            this.northeast.show();
            this.southwest.show();
            this.southeast.show();
        }
        pop();
    }
}
