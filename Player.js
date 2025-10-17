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
const BUOYANCY = -0.0999;


class Player {
    constructor(x,y) {
        // some physics properties
        this.position = createVector(x,y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0);

        // gameplay and mass properties
        this.bagWeight = 0;
        this.baseMass = 20
        this.totalMass = this.baseMass + this.bagWeight;

        // control and appearance properties
        this.thrustForce = 1.5; // base move speed
        this.radius = 20; // right now use circle, maybe delete this in future

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

        // update to Player
        this.velocity.add(this.acceleration); // velocity chage by acceleration
        this.position.add(this.velocity); // position changes by velocity
        this.acceleration.mult(0); // change the acceleration back to 0

        // finish
    }

    // move by player
    handleInput() {
        let thrust = createVector(0,0);
        if (keyIsDown(65)) { // "a"
            thrust.x = -this.thrustForce;
        }
        if (keyIsDown(68)) { // "d"
            thrust.x = this.thrustForce;
        }
        if (keyIsDown(87)) { // "w"
            thrust.y = -this.thrustForce;
        }
        if (keyIsDown(83)) { // "s"
            thrust.y = this.thrustForce;
        }

        this.applyForce(thrust);
    }

    // draw the player
    display() {
        stroke(0);
        fill(175);
        ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);

        // this is for debug
        let v = this.velocity.copy();
        v.mult(10);
        line(this.position.x, this.position.y, this.position.x+ v.x, this.position.y + v.y);
    }

    // collision with the edge of canvas (need to change in future)
    checkEdges() {
        if (this.position.x > width - this.radius) {
            this.position.x = width - this.radius;
            this.velocity.x *= -0.1;
        }
        else if (this.position.x < this.radius) {
            this.position.x = this.radius;
            this.velocity.x *= -0.1;
        }

        if (this.position.y > height - this.radius) {
            this.position.y = height - this.radius;
            this.velocity.y *= -0.1;
        }
        else if (this.position.y < this.radius) {
            this.position.y = this.radius;
            this.velocity.y *= -0.1;
        }
    }
}