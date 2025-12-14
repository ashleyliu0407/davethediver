// WeaponBox.js
// defines the WeaponBox class which provides weapons to the player

class WeaponBox extends InteractableBox {
    constructor(x, y,img, imgAfter) {
        super(x, y, img);
        this.content = random(["SpearGun", "Netgun"]); // randomly choose a weapon
        this.size = 80; // override size for weapon box
        this.alpha = 255;
        this.imgAfter = imgAfter; // image when box is opened

        this.contentAmmo = weaponConfig[this.content].maxAmmo; // record the ammo of the weapon in the box
    }

    display() {
        if (!this.isOpen) {
            super.display();
        }
        else {
            // box dispears when opened, show weapon instead
            if (this.alpha > 0) this.alpha -= 1;
            tint(255, this.alpha);
            if (this.imgAfter) {
                imageMode(CENTER);
                image(this.imgAfter, this.position.x, this.position.y, this.size, this.size);
            }
            noTint();
            this.displayContent();
        }
    }

    // draw the weapon
    displayContent() {
        let weaponImg = weaponImages[`${this.content}_handbook`];
        if (weaponImg) {
            imageMode(CENTER);
            let maxDim = 70;
            let scale = min(maxDim / weaponImg.width, maxDim / weaponImg.height);  
            image(weaponImg, this.position.x, this.position.y + 15, weaponImg.width * scale, weaponImg.height * scale);
        }
    }

    displayUiOverlay() {
        if (this.playerInRange) {
            if (!this.isOpen) {
                this.drawPrompt("SPACE to Open");
            }
            else {
                this.drawSwapPrompt();
            }
        }
    }

    // prompt to swap weapon
    drawSwapPrompt() {
        push();
        translate(this.position.x, this.position.y - 60);

        // background
        fill(0, 200);
        rectMode(CENTER);
        noStroke();
        rect(0,0,160,45,8);

        // text
        textAlign(CENTER, CENTER);
        // what's the weapon
        fill(200);
        textSize(12);
        textStyle(NORMAL);
        text(`Found: ${this.content} (${this.contentAmmo}/${weaponConfig[this.content].maxAmmo})`, 0, -8);
        // swap prompt
        fill(255,215,0);
        textSize(14);
        textStyle(BOLD);
        text("SHIFT to Swap", 0, 10);

        pop();
    }

    handleKeyPress(keyCode, player) {
        if (!this.playerInRange) return;

        if (!this.isOpen) {
            if (keyCode === 32) { // SPACE
                // can add some sound effect here
                if (openBoxSound) {
                    openBoxSound.play();
                }
                this.isOpen = true;
            }
        }
        else {
            if (keyCode === 16) { // SHIFT
                this.swapWeapon(player);
            }
        }
    }

    swapWeapon(player) {
        let playerBeforeGun = "None";
        if (player.weapons["SpearGun"]) playerBeforeGun = "SpearGun";
        if (player.weapons["Netgun"]) playerBeforeGun = "Netgun";

        let weaponOnGround = this.content;

        if (playerBeforeGun !=="None") {
            player.weapons[playerBeforeGun] = false; // drop current weapon
            player.weapons[weaponOnGround] = true; // pick up new weapon
            player.currentWeapon = weaponOnGround; // equip new weapon

            let beforeGunAmmo = player.ammo[playerBeforeGun];
            player.ammo[weaponOnGround] = this.contentAmmo; // refill ammo for new weapon

            this.content = playerBeforeGun; // box now has the old weapon
            this.contentAmmo = beforeGunAmmo; // box now has the old weapon's ammo
        }
        else {
            player.weapons[weaponOnGround] = true; // pick up new weapon
            player.currentWeapon = weaponOnGround; // equip new weapon
            player.ammo[weaponOnGround] = this.contentAmmo; // refill ammo for new weapon

            this.isCollected = true; // box disappears
        }


        // can add sound effect here
        if (equipSound) {
            equipSound.play(0,1,2);
        }

        let gameData = JSON.parse(localStorage.getItem('gameData'));
        gameData.equippedFirearm = weaponOnGround; // update equipped firearm

        // record discovered firearms
        if (!gameData.discoveredWeapons) gameData.discoveredWeapons = []; // initialize if not exist
        if (!gameData.discoveredWeapons.includes(weaponOnGround)) gameData.discoveredWeapons.push(weaponOnGround);

        localStorage.setItem('gameData', JSON.stringify(gameData));
    }
}