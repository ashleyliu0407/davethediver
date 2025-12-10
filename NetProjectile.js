// ===============================
// NET GUN PROJECTILE CLASS
// ===============================

class NetProjectile extends Projectile {
    constructor(x, y, velocity, weaponConfig) {
        super(x, y, velocity, weaponConfig);

        // Get Config
        this.effectRadius = weaponConfig.effectRadius;
        this.entangleDuration = weaponConfig.entangleDuration;

        // three states: 1. "FLYING" 2. "HOLDING" 3. "DEPLOYING" 
        this.state = "FLYING"; 

        // Visual Timer for the deployed net
        this.deployVisualTimer = 0; 
        this.deployVisualDuration = 1; // Net stays visible for 1s

        // Held fish
        this.heldFish = [];

        // Images
        this.flyingImg = weaponImages.NetProjectile;
        this.deployedImg = weaponImages.NetDeployed;
    }

    update() {
        // DEPLOYING state(Show net, then destroy)
        if (this.state === "DEPLOYING") {
            this.deployVisualTimer -= deltaTime / 1000;
            if (this.deployVisualTimer <= 0) {
                this.isActive = false; // Remove projectile from game
            }
            return; 
        }

        // HOLDING state
        if (this.state === "HOLDING") {
            let allDead = true;

            // check if all held fish are dead
            for (let i = 0; i < this.heldFish.length; i++) {
                let fish = this.heldFish[i];

                if (fish && fish.health > 0) {
                    allDead = false;
                    fish.applyEntangle(0.1); // keep them entangled
                }
            }

            if (allDead) {
                this.state = "DEPLOYING";
                this.deployVisualTimer = this.deployVisualDuration;
                this.heldFish = []; // clear held fish
            }
            return;
        }

        // FLYING state
        // Move and check collision
        super.update(); 

        if (this.distanceTraveled >= this.range) {
            this.isActive = true; // special case: hold in air
            this.triggerNet();
            return;
        }

        // Check collision with fish
        for (let i = 0; i < activeFish.length; i++) {
            let fish = activeFish[i];
            if (fish.health <= 0) continue; 

            let d = dist(this.position.x, this.position.y, fish.x, fish.y);
            
            // Hit detection (Direct hit on a fish triggers the net)
            if (d < fish.size / 2) {
                this.triggerNet(); 
                break; // Trigger only once
            }
        }
    }

    triggerNet() {
        let targetsInRadius = [];
        let maxHealthInNet = 0;

        // First pass: Identify all fish within effect radius
        for (let i = 0; i < activeFish.length; i++) {
            let targetFish = activeFish[i];
            if (targetFish.health <= 0) continue;

            let d = dist(this.position.x, this.position.y, targetFish.x, targetFish.y);

            // If inside the net radius
            if (d <= this.effectRadius) {
                targetsInRadius.push(targetFish);

                // Track biggest fish health
                if (targetFish.manHealth > maxHealthInNet) {
                    maxHealthInNet = targetFish.manHealth;
                }
            }
        }

        // check fish size to determine net outcome
        if (maxHealthInNet > 10) {
            console.log("Netgun failed: Fish too big!");

            // Fail case: Large fish present, net fails
            this.state = "DEPLOYING";
            this.deployVisualTimer = this.deployVisualDuration;
            
            // hold few seconds for all fish in radius
            for (let i = 0; i < targetsInRadius.length; i++) {
                let fish = targetsInRadius[i];
                fish.applyEntangle(this.entangleDuration);
            }
        }
        else if (maxHealthInNet > 1) {
            console.log("Net holding Medium fish group.");

            this.state = "HOLDING";

            // record held fish
            this.heldFish = targetsInRadius;

            // Hold all medium and small fish
            for (let i = 0; i < this.heldFish.length; i++) {
                let fish = this.heldFish[i];
                fish.applyEntangle(this.entangleDuration);
            }
        }
        // all small fish case
        else if (targetsInRadius.length > 0) {
            console.log("Netgun caught small fish group.");

            this.state = "DEPLOYING";
            this.deployVisualTimer = this.deployVisualDuration;

            // Catch all small fish
            for (let i = 0; i < targetsInRadius.length; i++) {
                let targetFish = targetsInRadius[i];

                // pickup fish directly(put in inventory)
                if (inventory.addItem(targetFish)) {
                    // Remove from world
                    targetFish.health = 0; 
                    
                    // Update grid status if it's not a random ambient fish
                    if (!targetFish.isAmbient) {
                        grid[targetFish.gridR][targetFish.gridC].fish = null;
                        grid[targetFish.gridR][targetFish.gridC].isActive = false;
                    }

                    // Remove from active fish list
                    let i = activeFish.indexOf(targetFish);
                    if (i > -1){
                        activeFish.splice(i, 1); 
                    }
                    console.log("Netgun caught: " + targetFish.type);
                }
            }
        }
        // no fish case
        else {
            this.state = "DEPLOYING";
            this.deployVisualTimer = this.deployVisualDuration;
        }
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        if (this.state === "FLYING") {
            // Draw flying projectile
            rotate(this.velocity.heading());
            imageMode(CENTER);
            if (this.flyingImg) {
                image(this.flyingImg, 0, 0, 30, 30); 
            }
        } 
        else if (this.state === "DEPLOYING") {
            // Draw deployed net (No rotation, just a big circle)
            // Fade out effect
            let alpha = map(this.deployVisualTimer, 0, this.deployVisualDuration, 0, 255);
            tint(255, alpha);
            
            imageMode(CENTER);
            if (this.deployedImg) {
                // Draw size based on effectRadius * 2 (Diameter)
                image(this.deployedImg, 0, 0, this.effectRadius * 2, this.effectRadius * 2);
            }
        }
        else if (this.state === "HOLDING") {
            // Draw deployed net
            tint(255, 255); // full opacity
            
            imageMode(CENTER);
            if (this.deployedImg) {
                // Draw size based on effectRadius * 2 (Diameter)
                image(this.deployedImg, 0, 0, this.effectRadius * 2, this.effectRadius * 2);
            }

        }
        pop();
    }
}