// AmmoBox.js
// defines the AmmoBox class which provides ammo(max ammo of the weapons) to the player

class AmmoBox extends InteractableBox {
    constructor(x, y,img) {
        super(x, y, img);
    }


    display() {
        if (this.isCollected) return;
        super.display();

        // for test, can delete later
        if (!this.img) {
            fill(255,0,0);
            rectMode(CENTER);
            noStroke();
            rect(this.position.x, this.position.y, 15, 15);
        }
    }

    displayUiOverlay() {
        if (this.isCollected) return;

        // if player is in range
        if (this.playerInRange) {
            let currentWeapon = player.currentWeapon;

            if (currentWeapon === "SpearGun" || currentWeapon === "Netgun") {
                this.drawPrompt("SPACE to Refill");
            }
            else {
                this.drawPrompt("Equip Gun First");
            }
        }
    }

    interact(player) {
        let currentWeapon = player.currentWeapon;

        if (currentWeapon === "SpearGun" || currentWeapon === "Netgun") {
            player.ammo[currentWeapon] = weaponConfig[currentWeapon].maxAmmo;

            // can add sound effect here
            if (reloadSound) {
                reloadSound.play(0,1,0.5);
            }

            this.isCollected = true; // delete box after collected
        }
            
    }
}