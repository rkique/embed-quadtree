class Point {
    constructor(x, y, label = '', index = -1) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.index = index;
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
        stroke(55);
        noFill();
        strokeWeight(1);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);

        // Render points stored at this node
        for (const p of this.points) {
            // Draw the point
            stroke(255);
            noStroke()
            //strokeWeight(4);
            //point(p.x, p.y);
            
            // Calculate quadrant boundaries
            const quadLeft = this.boundary.x - this.boundary.w;
            const quadRight = this.boundary.x + this.boundary.w;
            const quadTop = this.boundary.y - this.boundary.h;
            const quadBottom = this.boundary.y + this.boundary.h;
            const quadWidth = this.boundary.w * 2;
            const quadHeight = this.boundary.h * 2;
            
            // Draw text that fills the quadrant with wrapping
            if (p.label) {
                noStroke();
                fill(200);
                
                // Start with larger font size to fill space better
                let fontSize = Math.min(quadWidth, quadHeight) * 0.4;
                const padding = 4;
                const maxWidth = quadWidth - padding * 2;
                const maxHeight = quadHeight - padding * 2;
                
                // Function to wrap text into lines
                const wrapText = (txt, maxW, size) => {
                    textSize(size);
                    const words = txt.split(' ');
                    const lines = [];
                    let currentLine = '';
                    
                    for (const word of words) {
                        const testLine = currentLine + (currentLine ? ' ' : '') + word;
                        const testWidth = textWidth(testLine);
                        
                        if (testWidth > maxW && currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    }
                    if (currentLine) lines.push(currentLine);
                    return lines;
                };
                
                // Find optimal font size that fills the box
                let lines = [];
                let lineHeight = 0;
                let totalHeight = 0;
                
                while (fontSize > 2) {
                    textSize(fontSize);
                    lines = wrapText(p.label, maxWidth, fontSize);
                    lineHeight = fontSize * 1.2;
                    totalHeight = lines.length * lineHeight;
                    
                    // Check if text fits within bounds
                    if (totalHeight <= maxHeight) {
                        // Check if all lines fit width-wise
                        const allFit = lines.every(line => textWidth(line) <= maxWidth);
                        if (allFit) break;
                    }
                    fontSize *= 0.95;
                }
                
                // Adjust line spacing for specific indices to fill vertical space
                const fillVerticalIndices = [1, 2, 5, 7, 8, 11, 12, 13];
                if (fillVerticalIndices.includes(p.index) && lines.length > 1) {
                    // Calculate spacing to fill the entire vertical height
                    const textBlockHeight = lines.length * fontSize;
                    const availableSpace = maxHeight - textBlockHeight;
                    lineHeight = fontSize + (availableSpace / (lines.length - 1));
                }
                
                // Draw wrapped text, left-aligned
                textAlign(LEFT, TOP);
                textSize(fontSize);
                const x = quadLeft + padding;
                let y = quadTop + padding;
                
                for (const line of lines) {
                    text(line, x, y);
                    y += lineHeight;
                }
                
                textAlign(LEFT, BASELINE); // Reset to default
            }
        }

        if (this.divided){
            this.northwest.show();
            this.northeast.show();
            this.southwest.show();
            this.southeast.show();
        }
        pop();
    }

    // Collect all points from the tree
    getAllPoints() {
        let result = [...this.points];
        if (this.divided) {
            result = result.concat(this.northwest.getAllPoints());
            result = result.concat(this.northeast.getAllPoints());
            result = result.concat(this.southwest.getAllPoints());
            result = result.concat(this.southeast.getAllPoints());
        }
        return result;
    }

    // Get the center of the quadrant containing a point
    getQuadrantCenter(point) {
        if (!this.boundary.contains(point)) {
            return null;
        }
        
        // If this node contains the point and isn't divided, return this quadrant's center
        if (this.points.includes(point)) {
            return { x: this.boundary.x, y: this.boundary.y };
        }
        
        // Otherwise check children
        if (this.divided) {
            return this.northwest.getQuadrantCenter(point) ||
                   this.northeast.getQuadrantCenter(point) ||
                   this.southwest.getQuadrantCenter(point) ||
                   this.southeast.getQuadrantCenter(point);
        }
        
        return null;
    }
}
