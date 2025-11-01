// Right now there are four forces influencing the player:
//  1. gravity force
//  2. buoyancy force
//  3. drag force
//  4. thrust


// a constant for the force of gravity
const GRAVITY = 0.1;
// a constant for the drag force coeffiecient (higher means thicker water)
const DRAG_COEFFICIENT = 0.5;
// a constant for the buoyancy force
const BUOYANCY = -0.109;

// a constant for stopping threshold, check if the velocity is very small
const STOPPING_THRESHOLD = 0.1;

class Player {
    constructor(x,y, diverImgs) {
        // some physics properties
        this.position = createVector(x,y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0);
        
        //player
        this.diverImgs = diverImgs;
        this.currentImg = this.diverImgs.still;

        // gameplay and mass properties
        this.bagWeight = 0;
        this.baseMass = 20
        this.totalMass = this.baseMass + this.bagWeight;

        // Oxygen properties
        this.maxOxygen = 60;
        this.currentOxygen = this.maxOxygen;

        this.oxygenRateIdle = 0.5;
        this.oxygenRateSwim = 1.0;
        this.oxygenRateSprint = 1.5;
        this.oxygenRateAim = 1.25; // implement later

        // some state properties
        this.isThrusting = false; // is W/A/S/D being pressed
        this.isSprinting = false; // is shift being pressed
        this.isAiming = false; // implement later

        // control and appearance properties
        this.thrustForce = 2.5; // base move speed
        this.sprintMultiplier = 1.5; // sprint speed multiplier
        this.radius = 20; // right now use circle, maybe delete this in future

        // weapon properties
        // Player owns Harpoon by default
        this.weapons = {
            "knife": false,
            "Harpoon": true,
            "SpearGun": false,
            "Netgun": false
        }; // tracks owned weapons
        this.currentWeapon = "Harpoon"; // current selected weapon
        this.ammo = {
            "Harpoon": Infinity,
            "SpearGun": 0,
            "Netgun": 0
        }; // ammo count
        // harpoon state
        this.harpoonOut = false; // only one harpoon at a time

    }

    // a method to apply any force to the player
    // we want get the acceleration, a = F/m
    applyForce(force) {
        let f = force.copy(); // make a copy
        f.div(this.totalMass); // divide the force by the total mass
        this.acceleration.add(f); // add the result to the player's acceleration
    }

    // this is the main function to update the player's physics
    update() {
        let dt = deltaTime / 1000; // convert milliseconds to seconds

        // stop moving when aiming or harpoon is out
        if (this.isAiming || this.harpoonOut) {
            this.isThrusting = false;
        }


        // --------- OXYGEN LOGIC ---------

        // Oxygen consumption
        if (this.isSprinting && this.isThrusting) {
            // springting consumes 1.5/s
            this.currentOxygen -= this.oxygenRateSprint * dt;
        } else if (this.isThrusting) {
            // swimming consumes 1.0/s
            this.currentOxygen -= this.oxygenRateSwim * dt;
        } else if (this.isAiming) {
            // for future implementation
            this.currentOxygen -= this.oxygenRateAim * dt;
        }
        else {
            // idle(not moving) consumes 0.5/s
            this.currentOxygen -= this.oxygenRateIdle * dt;
        }

        // constrain the oxygen level between 0 and maxOxygen
        this.currentOxygen = constrain(this.currentOxygen, 0, this.maxOxygen);


        // --------- PHYSICS LOGIC ---------

        // update the mass
        this.totalMass = this.baseMass + this.bagWeight;

        // calculate the gravity force
        let gravity = createVector(0,GRAVITY);
        gravity.mult(this.totalMass); // gravity is proportional to the mass
        this.applyForce(gravity);

        // calculate buoyancy force
        let buoyancy = createVector(0, BUOYANCY);
        buoyancy.mult(this.totalMass); // make buoyancy also react to mass
        this.applyForce(buoyancy);

        // calculate drag force
        let speed = this.velocity.mag();
        if (speed > 0) { // only have the drag force when there is velocity

            // use F(drag) = -C * |v^2| * direction vector
            let dragMagnitude = speed * speed * DRAG_COEFFICIENT;
            let drag = this.velocity.copy();
            drag.mult(-1);
            drag.normalize(); // let the length be 1
            drag.mult(dragMagnitude);
            this.applyForce(drag);
        }

        // stop player from drifting when aiming OR harpoon is out
        if (this.isAiming || this.harpoonOut) {
            this.velocity.mult(0.9); // apply heavy drag
        }

        // update to Player
        this.velocity.add(this.acceleration); // velocity chage by acceleration
        this.position.add(this.velocity); // position changes by velocity
        this.acceleration.mult(0); // change the acceleration back to 0

        // if the player is not thrusting and velocity is very small, stop completely
        if (!this.isThrusting && !this.harpoonOut && !this.isAiming && this.velocity.mag() < STOPPING_THRESHOLD) {
            this.velocity.mult(0);
        }

        // move camera
        cameraOffset = this.position.x;
    }

    // move by player
    handleInput() {
        let moving = false;
        // --------- AIMING LOGIC ---------
        // check for aiming input (right mouse button)
        //IMAGE: AIMING
        if (mouseIsPressed && mouseButton === RIGHT && !this.harpoonOut) {
            this.isAiming = true;
            this.currentImg = this.diverImgs.aim;
            
        } else {
            this.isAiming = false;
        }

        // --------- FIRE LOGIC ---------
        if (this.isAiming && (mouseIsPressed && mouseButton === LEFT || keyIsDown(49))) {
            this.fire();
            this.isAiming = false;
        }

        // --------- MOVEMENT LOGIC ---------
        // if aiming OR harpoon is out, do not allow movement
        if (this.isAiming || this.harpoonOut) {
            this.isThrusting = false;
            this.isSprinting = false;
            return; // stop here, no movement allowed
        }


        let thrust = createVector(0,0);

        // reset states
        this.isThrusting = false;
        this.isSprinting = false;
        //this.isAiming = false;

        if (keyIsDown(16)) { // "shift"
            this.isSprinting = true;
        }

        if (keyIsDown(65)) { // "a"
            this.currentImg = this.diverImgs.swimLeft; //FOR PLAYER - LEFT
            thrust.x = -1; // direction only
            this.isThrusting = true;
            moving = true;
        }
        if (keyIsDown(68)) { // "d"
            this.currentImg = this.diverImgs.swimRight;// FOR PLAYER - RIGHT
            thrust.x = 1;
            this.isThrusting = true;
            moving = true;
        }
        if (keyIsDown(87)) { // "w"
            thrust.y = -1;
            this.isThrusting = true;
            moving = true;
        }
        if (keyIsDown(83)) { // "s"
            this.currentImg = this.diverImgs.swimDown;// FOR PLAYER - RIGHT
            thrust.y = 1;
            this.isThrusting = true;
            moving = true;
        }

        if(!moving){
            this.currentImg = this.diverImgs.still;
        }

        let currentThrust = this.thrustForce;
        if (this.isSprinting && this.isThrusting) {
            currentThrust *= this.sprintMultiplier;
        }

        thrust.normalize(); // make the length be 1, ensure diagonal movement is not faster
        thrust.mult(currentThrust);

        this.applyForce(thrust);
    }

    // fire method for shooting projectiles
    fire() {
        // we can't fire if not aiming
        if (!this.isAiming) return;

        // get the config for the current weapon
        let config = weaponConfig[this.currentWeapon];

        // --- harpoon specific logic ---
        if (this.currentWeapon === "Harpoon") {
            // can only have one harpoon out at a time
            if (this.harpoonOut) return;

            // calculate direction from player to mouse
            let worldMouseX = mouseX - width / 2 + this.position.x;
            let worldMouseY = mouseY - height / 2 + this.position.y;

            let fireVel = createVector(worldMouseX - this.position.x, worldMouseY - this.position.y);
            fireVel.setMag(config.projectileSpeed);

            // create the projectile
            let harpoon = new HarpoonProjectile(this.position.x, this.position.y, fireVel, config, this);
            activeProjectiles.push(harpoon);

            // set harpoon out state
            this.harpoonOut = true;
        }

        // --- other weapons logic can be added here ---
            
    }

    // draw the player
    display() {
        //IMAGE
        imageMode(CENTER);
        // image(this.currentImg, this.position.x, this.position.y, 120, 120);
        // this.currentImg.width * 0.4, this.currentImg.height * 0.4
        image(this.currentImg, this.position.x, this.position.y, this.currentImg.width * 0.4, this.currentImg.height * 0.4);

        // draw aiming line
        if (this.isAiming) {
            let worldMouseX = mouseX - width / 2 + this.position.x;
            let worldMouseY = mouseY - height / 2 + this.position.y;

            stroke(255, 0, 0, 100);
            strokeWeight(2);
            line(this.position.x, this.position.y, worldMouseX, worldMouseY);
        }

        // // this is for debug
        // stroke(20);
        // let v = this.velocity.copy();
        // v.mult(10);
        // line(this.position.x, this.position.y, this.position.x+ v.x, this.position.y + v.y);
        // noStroke();
    }

    // collision with the edge of canvas(need to change: maybe need to add more)
    checkEdges() {
        this.position.x = constrain(this.position.x, -4000, 3000);
        this.position.y = constrain(this.position.y, 0, maxDepth);
    }
}