class Fish {

    constructor(x,y,species,speed,size,imgLeft,imgRight) {
        this.position = createVector(x,y);
        this.species = species;
        this.speed = speed; // pixels per frame
        this.size = size; // diameter
        this.imgLeft = imgLeft;
        this.imgRight = imgRight;

        // random initial direction
        this.velocity = p5.Vector.random2D();
        // set the velocity magnitude to speed
        this.velocity.setMag(this.speed);

        // set a color based on species if no image
        switch(this.species) {
            case "Mackerel": this.fallbackColor = color(180, 180, 190); break;
            case "Sardine": this.fallbackColor = color(200, 200, 255); break;
            case "Salmon": this.fallbackColor = color(255, 150, 130); break;
            case "Yellowtail": this.fallbackColor = color(255, 255, 100); break;
            case "Scallop": this.fallbackColor = color(245, 210, 180); break;
            case "Bluefin Tuna": this.fallbackColor = color(0, 0, 150); break;
            case "Eel": this.fallbackColor = color(100, 120, 80); break;
            case "Sea Urchin": this.fallbackColor = color(50, 0, 50); break;
            default: this.fallbackColor = color(255, 0, 0);
        }
    }

    move() {
        // only move if speed > 0
        if (this.speed > 0) {
            // Random turns, more realistic.
            if (random(1) < 0.05) {
                this.velocity.rotate(radians(random(-15, 15)));
            }

            // avoid change the speed(if rotating)
            this.velocity.setMag(this.speed);
            // update position
            this.position.add(this.velocity);
            // check for screen edges (need to change future)
            this.checkEdges();
        }
    }

    // wrapping
    checkEdges() {
        let buffer = this.size * 2; // don't appear directly.
        if (this.position.x < -buffer) this.position.x = width + buffer;
        if (this.position.x > width + buffer) this.position.x = -buffer;
        if (this.position.y < -buffer) this.position.y = height + buffer;
        if (this.position.y > height + buffer) this.position.y = -buffer;
    }

    display() {
        let currentImg;

        // set image based on direction
        if (this.velocity.x >=0) {
            currentImg = this.imgRight; // facing right
        }
        else {
            currentImg = this.imgLeft; // facing left
        }

        imageMode(CENTER);

        // draw the fish
        if (currentImg) {
            image(currentImg, this.position.x, this.position.y, this.size, this.size);
        }
        else {
            // if image is misssing, draw a circle with fallback color
            fill(this.fallbackColor);
            noStroke();
            ellipse(this.position.x, this.position.y, this.size, this.size);
        }

    }
}