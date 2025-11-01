// this is a base class for all projectiles (harpoons, nets, etc.)
// it handles basic movement and range checking
class Projectile {
    constructor(x, y, velocity, weaponConfig) {
        this.position = createVector(x, y);
        this.velocity = velocity;

        // get stats from the config
        this.range = weaponConfig.range;
        //this.speed = weaponConfig.projectileSpeed;
        this.damage = weaponConfig.damage;
        this.type = weaponConfig.type;

        this.distanceTraveled = 0;
        this.isActive = true; // set to false when it hits something or goes out of range
    }

    update() {
        // move the projectile
        this.position.add(this.velocity);

        // track distance traveled
        this.distanceTraveled += this.velocity.mag();

        // check if it has exceeded its range
        if (this.distanceTraveled >= this.range) {
            this.isActive = false;
        }
    }

    draw() {
        // base projectiles are invisible - subclasses will implement their own drawing
    }
}