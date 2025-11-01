// ===============================
// HARPOON PROJECTILE CLASS
// ===============================

class HarpoonProjectile extends Projectile {
    constructor(x, y, velocity, weaponConfig, player) {
        super(x,y,velocity,weaponConfig);

        this.player = player; // reference to the player for collision detection
        this.state = "FIRING"; // states: FIRING, ATTACHED, RETRACTING

        this.missTimer = 1.0; // time before retracting if no hit (can change)
        this.attachTimer = 3.0; // time to stay attached before retracting (can change)

        this.deathStruggleTimer = 0.5; // time for fish struggle (can change)

        this.targetFish = null; // the fish we are attached to
    }

    update() {
        // Override the parent update method
        let dt = deltaTime / 1000; // convert to seconds

        // State machine logic
        if (this.state === "FIRING") {
            // ---Fire State---
            // move forward
            this.position.add(this.velocity);
            this.distanceTraveled += this.velocity.mag();

            // check for miss
            if (this.distanceTraveled >= this.range) {
                this.state = "RETRACTING"; // start retracting
            }

            this.missTimer -= dt;
            if (this.missTimer <= 0) {
                this.state = "RETRACTING"; // start retracting
            }

        }
        else if (this.state === "ATTACHED") {
            // ---Attached State---
            if (this.targetFish.health <= 0) {
                this.state = "DYING_STRUGGLE"; // fish is dead, start retracting
            }
            else {
                // fish is alive
                this.attachTimer -= dt;

                // update position to fish's position
                this.position.set(this.targetFish.x, this.targetFish.y);

                if (this.attachTimer <= 0) {
                    this.state = "RETRACTING"; // time's up, fish escapes!
                    this.detach();
                }

            }
        }
        else if (this.state === "DYING_STRUGGLE") {
            // ---Dying Struggle State---
            this.deathStruggleTimer -= dt;

            // update position to fish's position
            this.position.set(this.targetFish.x, this.targetFish.y);

            if (this.deathStruggleTimer <= 0) {
                this.state = "RETRACTING"; // struggle finished, start retracting
            }

        }
        else if (this.state === "RETRACTING") {
            // ---Retracting State---
            let directionToPlayer = p5.Vector.sub(this.player.position, this.position);

            // predict check if reached player
            if (directionToPlayer.mag() < this.velocity.mag()) {
                this.isActive = false; // reached player, deactivate
            }
            else {
                // move towards player
                directionToPlayer.setMag(this.velocity.mag());
                this.position.add(directionToPlayer);
            }

            // if dragged a dead fish, make it follow the harpoon
            if (this.targetFish && this.targetFish.health <= 0) {
                this.targetFish.x = this.position.x;
                this.targetFish.y = this.position.y;
            }
        }

    }


    // called by sketch.js when a collision happens
    attach(fish) {
        if (this.state === "FIRING") {
            this.state = "ATTACHED";
            this.targetFish = fish;
            fish.isAttached = true; // mark fish as attached
            fish.attachedHarpoon = this; // reference back to harpoon

            // hurt the fish immediately
            fish.takeDamage(this.damage);
        }
    }

    // called when fish escapes
    detach() {
        if (this.targetFish) {
            this.targetFish.isAttached = false;
            this.targetFish.attachedHarpoon = null;
        }
        this.targetFish = null;
        this.state = "RETRACTING";
    }

    draw() {
        // draw the harpoon head (need to change with image later)
        fill(255);
        noStroke();
        ellipse(this.position.x, this.position.y, 10, 10);

        // draw the chain/line back to the player
        stroke(255, 100);
        strokeWeight(2);
        line(this.player.position.x, this.player.position.y, this.position.x, this.position.y);
    }
}