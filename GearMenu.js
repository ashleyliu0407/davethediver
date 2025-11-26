// GearMenu.js
// where: put in boatStart.html 
// what: gear menu for selecting firearm in diving game

class GearMenu {
    constructor(images) {
        this.images = images;
        this.isVisible = false;

        // size of window
        this.menuWidth = 600;
        this.menuHeight = 400;

        // colors
        this.colors = {
            bg: color(40, 60,90,240), // Deep blue semi-transparent background
            slotBg: color(0,80), // Darker blue for slots
            title: color(255), // White text
            highlight: color(255, 200, 0), // selected highlight
            btnEquip: color(50,200,50), // green equip button
            btnUnequip: color(200,50,50), // red unequip button
            btnLocked: color(150) // gray locked button
        };

        // initialize data from localStorage
        this.gameData = JSON.parse(localStorage.getItem('gameData')) || {
            weapons: {'spearGun': 1}, // for test
            equippedFirearm: null
        };
    }

    // change display state
    toggle() {
        this.isVisible = !this.isVisible;
        // reget data, prevent desync
        if (this.isVisible) {
            this.gameData = JSON.parse(localStorage.getItem('gameData'));
        }
    }

    display() {
        if (!this.isVisible) return;

        // get the center position
        let cx = width / 2;
        let cy = height / 2;

        push();

        // 0. setup
        translate(0,0);
        rectMode(CENTER);

        // 1. draw a semi-transparent background
        noStroke();
        fill(0,100);
        rect(cx, cy, width, height);

        // 2. draw menu background
        fill(this.colors.bg);
        stroke(255);
        strokeWeight(2);
        rect(cx, cy, this.menuWidth, this.menuHeight, 15);

        // 3. draw title
        fill(this.colors.title);
        noStroke();
        textAlign(CENTER, TOP);
        textSize(28);
        textFont("Quantico");
        text("DIVER'S GEAR", cx, cy - this.menuHeight/2 + 25);

        // 4. draw weapon slots
        // can change, right now only for firearm
        this.drawSectionTitle("Firearms", cx, cy-80);

        // draw Spear Gun slot (need to change: drawWeaponRow by going through the weapons list)
        this.drawWeaponRow("SpearGun", this.images["SpearGun"], cx, cy - 20);

        // add more weapon slots here if needed

        // 5. draw instructions
        textSize(14);
        fill(200);
        textAlign(CENTER, BOTTOM);
        text("Click outside to close", cx, cy + this.menuHeight/2 - 15);


        pop();
    }

    // helper function: draw section title
    drawSectionTitle(title, cx, y) {
        textAlign(LEFT, BOTTOM);
        textSize(18);
        fill(200);
        text(title, cx - this.menuWidth/2 + 40, y - 55);

        // parting line
        stroke(255, 100);
        strokeWeight(1);
        line(cx - this.menuWidth/2 + 30, y - 55, cx + this.menuWidth/2 - 30, y - 55);
    }

    // helper function: draw a weapon row
    drawWeaponRow(weaponName, img, cx, y) {
        let rowW = 520;
        let rowH = 100;

        // count number owned
        let count = (this.gameData.weapons && this.gameData.weapons[weaponName])? this.gameData.weapons[weaponName] : 0;
        // check if equipped
        let isEquipped = (this.gameData.equippedFirearm === weaponName);

        // background
        rectMode(CENTER);
        fill(this.colors.slotBg);
        stroke(255,50);
        if (isEquipped) {
            stroke(this.colors.highlight); // highlight if equipped
            strokeWeight(3);
        } else {
            strokeWeight(1);
        }
        rect(cx, y, rowW, rowH, 10);

        // Left side area: weapon image
        let imgAreaW = rowW * 0.65;
        let imgX = cx - rowW/2 + imgAreaW/2;

        // draw image
        if (img) {
            imageMode(CENTER);
            let ratio = img.width / img.height;
            let displayH = 80; // can change: select size of image
            let displayW = displayH * ratio;
            image(img, imgX, y, displayW, displayH);
        }

        // Weapon name(top left of img area)
        noStroke();
        fill(230);
        textAlign(LEFT, TOP);
        textSize(20);
        text(weaponName, cx - rowW/2 + 15, y - rowH/2 + 10);

        // Count (bottom left of img area)
        textAlign(RIGHT, BOTTOM);
        textSize(16);
        fill(180);
        text("Owned: " + count, cx - rowW/2 + imgAreaW - 15, y + rowH/2 - 10);

        // Right side area: button
        let btnX = cx + rowW/2 - 70;
        let btnW = 100;
        let btnH = 40;

        if (count > 0) {
            // if owned some
            if (isEquipped) {
                // show unequip button
                fill(this.colors.btnUnequip);
                stroke(255);
                rect(btnX, y, btnW, btnH, 5);
                fill(255);
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(16);
                text("UNEQUIP", btnX, y);
            }
            else {
                // show equip button
                fill(this.colors.btnEquip);
                stroke(255);
                rect(btnX, y, btnW, btnH, 5);
                fill(0);
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(16);
                text("EQUIP", btnX, y);
            }
        }
        else {
            // no weapon owned, show locked button
            fill(this.colors.btnLocked);
            stroke(255,100);
            rect(btnX, y, btnW, btnH, 5);
            fill(200);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(16);
            text("EMPTY", btnX, y);
        }

    }

    // hnadle mouse pressed event
    handleClick(mx, my) {
        if (!this.isVisible) return false;
        
        // get the center position
        let cx = width / 2;
        let cy = height / 2;

        // if speargun button clicked (need to change: go through weapon list)
        // (The coordinate calculations here must be exactly the same as those in the "drawWeaponRow" function)
        let rowY = cy - 20;
        let rowW = 520;
        let btnX = cx + rowW/2 - 70;
        let btnW = 100;
        let btnH = 40;

        // check if click is within button area
        if (mx >= btnX - btnW/2 && mx <= btnX + btnW/2 &&
            my >= rowY - btnH/2 && my <= rowY + btnH/2) {
                
                this.toggleWeapon("SpearGun");
                return true; // click handled
        }

        // check if clicked outside menu to close
        if (mx < cx - this.menuWidth/2 || mx > cx + this.menuWidth/2 ||
            my < cy - this.menuHeight/2 || my > cy + this.menuHeight/2) {
                this.toggle();
                return true; // click handled
        }

        return true; // click handled if inside menu but not on button

    }

    // helper function: equip/unequip weapon
    toggleWeapon(weaponName) {
        // make sure weapon is owned
        let count = (this.gameData.weapons && this.gameData.weapons[weaponName])? this.gameData.weapons[weaponName] : 0;
        if (count <= 0) return; // not owned, do nothing

        // logic to equip/unequip
        if (this.gameData.equippedFirearm === weaponName) {
            // unequip
            this.gameData.equippedFirearm = null;
        } else {
            // equip
            this.gameData.equippedFirearm = weaponName;
        }

        // save back to localStorage
        localStorage.setItem('gameData', JSON.stringify(this.gameData));
    }

}