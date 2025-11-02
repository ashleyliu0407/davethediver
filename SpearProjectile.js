// this is for the 'SpearGun'

class SpearProjectile extends Projectile {
    constructor(x,y,velocity,weaponConfig) {
        super(x,y,velocity,weaponConfig);

        this.img = weaponImages.SpearProjectile;
    }

    update() {
        super.update();
    }

    draw() {
        // draw the spear projectile, rotated to face its velocity direction
        push();
        translate(this.position.x,this.position.y);
        rotate(this.velocity.heading());

        if (this.img) {
            imageMode(CENTER);
            image(this.img,0,0, 25, 25); // can change
        }
        else {
            // draw a simple rectangle as fallback
            fill(255);
            strokeWeight(1);
            line(0,0,15,0); // draw a 15px line
        }
        pop();
    }
}