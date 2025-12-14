// InteractableBox.js
// boxes which has interaction logic(ammo box, weapon box)

class InteractableBox extends Box {
    constructor(x, y, img) {
        super(x, y, img);
        this.interactionRadius = 80; // interaction range
        this.playerInRange = false; // track if player is in range
        this.isOpen = false; // track if box is opened
    }

    // only check the distance to see if player can interact
    checkCollision(player) {
        if (this.isCollected) return;

        let d = dist(this.position.x, this.position.y, player.position.x, player.position.y);

        if (d < this.interactionRadius) {
            this.playerInRange = true;
        }
        else {
            this.playerInRange = false;
        }
    }

    // only display box
    display() {
        if (this.isCollected) return;
        super.display(); // draw box
    }

    displayUiOverlay() {
        if (this.isCollected) return;

        // if player is in range and box is not open
        if (this.playerInRange && !this.isOpen) {
            this.drawPrompt("Space to Open");
        }

    }
    
    // helper function to draw prompt
    drawPrompt(msg) {
        push();
        translate(this.position.x, this.position.y - 55);

        // background
        fill(0, 180);
        rectMode(CENTER);
        noStroke();
        let w = textWidth(msg) + 40;
        rect(0, 0, w, 28, 6);

        // text
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(12);
        textStyle(BOLD);
        text(msg, 0, 0);

        pop();

    }

    handleKeyPress(keyCode, player) {
        if (!this.playerInRange) return;

        if (keyCode === 32) { // SPACE
            // can add some sound effect here
            this.interact(player);
        }
    }

    // effect when player interacts with the box
    interact(player) {
        // to be overridden by subclasses
    }
}
