// ===============================
// FISH CLASS
// ===============================

class Fish {
    // Added gridR and gridC to track persistent fish
    // They default to -1 for ambient (non-grid) fish
    constructor(type, x, y, dir, speed, size, health, imgLeft, imgRight, gridR = -1, gridC = -1) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.speed = speed;
        this.phase = random(1000);
        

        // === NEW PROPERTIES START ===
        this.size = size; // From fishConfig
        this.health = health; // From fishConfig
        this.manHealth = health; // maximum health
        this.healthShowTimer = 0; // timer to show health bar when damaged

        this.imgLeft = imgLeft; // From fishImages
        this.imgRight = imgRight; // From fishImages

        // weapon interaction properties
        this.isAttached = false; // is harpoon attached
        this.attachedHarpoon = null; // reference to harpoon projectile
        this.dotTimer = 0; // Damage Over Time timer

        // Add fallback color based on species if no image
        switch(this.type) {
            case "Mackerel": this.fallbackColor = color(180, 180, 190); break;
            case "Sardine": this.fallbackColor = color(200, 200, 255); break;
            case "Salmon": this.fallbackColor = color(255, 150, 130); break;
            case "Yellowtail": this.fallbackColor = color(255, 255, 100); break;
            case "Scallop": this.fallbackColor = color(245, 210, 180); break;
            case "Bluefin-Tuna": this.fallbackColor = color(0, 0, 150); break;
            case "Eel": this.fallbackColor = color(100, 120, 80); break;
            case "Sea-Urchin": this.fallbackColor = color(50, 0, 50); break;
            default: this.fallbackColor = color(255, 0, 0);
        }

        // new things
        this.gridR = gridR; // The grid row this fish belongs to
        this.gridC = gridC; // The grid column
        // If gridR is -1, it's an ambient fish, not a persistent one
        this.isAmbient = (this.gridR === -1);

        this.damageFlashTimer = 0; // timer for damage flash effect
    }

    update() {
        // health bar timer update
        if (this.healthShowTimer > 0) {
            this.healthShowTimer -= deltaTime / 1000;
        }

        // damage flash timer update
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= deltaTime / 1000;
        }

        // if attached to harpoon, let the harpoon control movement
        if (this.isAttached) {
            // apply damage over time
            this.applyDotDamage();

            // let the harpoon pull the fish
            // use this.attachedHarpoon.position (the head of harpoon)
            this.x = this.attachedHarpoon.position.x;
            this.y = this.attachedHarpoon.position.y;
            return; // stop normal movement
        }

        if (this.health <= 0) {
            // check whether inventory space is full
            if (inventory.items.length < inventory.totalSlots) {
                // not full: auto-collect dead fish
                this.x = lerp(this.x, player.position.x, 0.05);
                this.y = lerp(this.y, player.position.y, 0.05);
            }
            else {
                // full: dead fish goes up slowly
                this.y -= 0.4;
            }

            return;
        }

        // if player is aiming at this fish, move slower
        let slowFactor = player.isAiming ? 0.4 : 1.0; // （can change）

        // Stop Sea Urchins from moving
        if (this.type === "Sea-Urchin") {
            this.speed = 0;
            return;
        }
        this.x += this.speed * this.dir * slowFactor;
        
        // Stop Scallop from swaying
        if (this.type === "Scallop") {
            return;
        }
        this.y += (sin(frameCount * 0.09 + this.phase) * 0.4) * slowFactor;
    }

    // --- DAMAGE LOGIC ---

    // this is for Harpoon's DOT
    applyDotDamage() {
        if (this.attachedHarpoon && this.attachedHarpoon.state === "ATTACHED") {
            let dt = deltaTime / 1000; // convert milliseconds to seconds
            this.dotTimer += dt;

            if (this.dotTimer >= 1.0) { // apply damage every second
                this.takeDamage(weaponConfig["Harpoon"].damage);
                this.dotTimer = 0; // reset timer
            }
        }
    }

    takeDamage(amount) {
        if (this.health <= 0) return; // already dead

        this.damageFlashTimer = 0.3; // trigger damage flash effect (can change)

        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;

            if (fishDead && !fishDead.isPlaying()) {
            fishDead.setVolume(0.8);
            fishDead.play();
    }

            // if dead, pause gif
            if (this.imgLeft) this.imgLeft.pause();
            if (this.imgRight) this.imgRight.pause();
        }

        // show health bar
        this.healthShowTimer = 3.0; // show for 3 seconds
    }

    isOffScreen(cameraOffset) {
        // Increased buffer to 200 to prevent pop-in
        let viewportLeft = cameraOffset - width / 2 - 200;
        let viewportRight = cameraOffset + width / 2 + 200;
        return this.x < viewportLeft || this.x > viewportRight;
    }

    closeTo() {
        // cannot flee if attached
        if (this.isAttached) return false;

        // if fish is dead, it cannot flee
        if (this.health <= 0) return false;
        
        // Scallops and Urchins don't flee
        if (this.type === "Scallop" || this.type === "Sea-Urchin") {
            return; 
        }

        let d = dist(this.x, this.y, player.position.x, player.position.y);
        if (d < 100 && !this.escaping) {
            this.escaping = true;
            this.dir *= -1;
            this.escapeTimer = 30;
        }

        // Slightly smoother and slower reaction
        if (this.escaping) {
            this.speed = lerp(this.speed, 2.8, 0.08);
            this.escapeTimer--;
            if (this.escapeTimer <= 0) this.escaping = false;
        } else {
            // Lerp back to original speed from config
            let originalSpeed = fishConfig[this.type].speed;
            this.speed = lerp(this.speed, originalSpeed, 0.05);
        }
    }

    draw() {
        let currentImg;

        // Set image based on direction
        // We use this.dir (1 or -1)
        if (this.dir >= 0) {
            currentImg = this.imgRight; // facing right
        }
        else {
            currentImg = this.imgLeft; // facing left
        }

        push();
        imageMode(CENTER);

        // tint based on health and damage
        if (this.health <= 0) {
            // if fish is dead, draw a dark tint
            tint(100);
        }
        else if (this.damageFlashTimer > 0) {
            // flash red when damaged
            tint(255, 100, 100);
        }

        // Draw the fish
        if (currentImg) {
            let stretchX = fishStretch[this.type];
            image(currentImg, this.x, this.y, this.size * stretchX, this.size);
            // image(currentImg, this.x, this.y, this.size, this.size);
        }
        else {
            // If image is missing, draw a circle with fallback color
            fill(this.fallbackColor);
            noStroke();
            ellipse(this.x, this.y, this.size, this.size);
        }

        pop();

        if (this.healthShowTimer > 0 && this.health > 0) {
            push();
            rectMode(CENTER);
            noStroke();

            // health bar position (above fish)
            let barWidth = this.size * 0.8; // 80% of fish size
            let barHeight = 8;
            let barX = this.x;
            let barY = this.y - this.size / 2 - 15; // 15 pixels above fish

            // draw background (red)
            fill(255, 0, 0, 150); // semi-transparent red
            rect(barX, barY, barWidth, barHeight, 4);

            // draw current health (green)
            let healthPercent = this.health / this.manHealth;
            fill(0, 255, 0, 200); // semi-transparent green
            rectMode(CORNER);
            let greenBarX = barX - barWidth / 2;
            let greenBarY = barY - barHeight / 2;
            rect(greenBarX, greenBarY, barWidth * healthPercent, barHeight, 4);
            
            pop();
        }
    }
}