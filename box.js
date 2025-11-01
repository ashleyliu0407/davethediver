class Box{
    constructor(x, y, img) {
        this.position = createVector(x, y);
        // this.size = 52;
        this.size = 55;
        this.isCollected = false;
        this.img = img;
    }

    checkCollision(player) {
        if(this.isCollected) {
            return;
        }
        let d = dist(this.position.x,this.position.y, player.position.x, player.position.y);
        // need to change - future player will use image
        if (d<player.radius + this.size/2) {
            this.collect(player);
        }
    }

    display() {
        if(!this.isCollected) {
            // check if image is loaded
            if (this.img) {
                imageMode(CENTER);
                image(this.img, this.position.x, this.position.y, this.size, this.size);
            } else {
                // if no image, draw a block
                fill(255);
                fill(100);
                rectMode(CENTER);
                rect(this.position.x, this.position.y, this.size, this.size);
            }
        }
    }

    collect(player) {
        this.isCollected = true;
    }
}