// GearMenu.js
// where: put in boatStart.html 
// what: gear menu for selecting firearm in diving game

class GearMenu {
    constructor(images) {
        this.images = images;
        this.isVisible = false;

        this.currentTab = "FIREARMS"; // right now have 1. firearms 2. Upgrade

        // size of window
        this.menuWidth = 600;
        this.menuHeight = 400;

        // colors
        this.colors = {
            bg: color(40, 60,90,240), // Deep blue semi-transparent background
            slotBg: color(0,80), // Darker blue for slots
            highlight: color(255, 200, 0), // selected highlight
            btnEquip: color(50,200,50), // green equip button
            btnUnequip: color(200,50,50), // red unequip button
            btnLocked: color(150), // gray locked button
            
            // for tabs
            textActive: color(255), // white active text
            textInactive: color(150, 160, 180), // gray inactive text
            lineHighlight: color(50, 255, 200), // bright highlight text
            lineColor: color(255, 50), // parting line color

            // for upgrade tab
            textAccent: color(255, 215, 0), // gold accent text
            btnUpgrade: color(255, 140, 0), // orange upgrade button
            btnMaxed: color(100, 200, 255) // blue maxed button
        };

        // initialize data from localStorage
        this.gameData = JSON.parse(localStorage.getItem('gameData')) || {
            coins: 100,
            weapons: {'SpearGun': 1}, // for test
            equippedFirearm: null,
            upgrades: {AirTank: 1, CargoBox: 1}
        };

        // make sure upgrades field exists
        if (!this.gameData.upgrades) {
            this.gameData.upgrades = {AirTank: 1, CargoBox: 1};
        }

        // upgrade levels
        this.upgradeConfig = {
            "AirTank": [
                { level: 1, value: 60, cost: 0 , label: "60 Bar"}, // default
                { level: 2, value: 90, cost: 150 , label: "90 Bar"}, // upgrade 1
                { level: 3, value: 120, cost: 400 , label: "120 Bar"} // upgrade 2
            ],
            "CargoBox": [
                { level: 1, value: 6, cost: 0 , label: "6 Slots"}, // default
                { level: 2, value: 8, cost: 200 , label: "8 Slots"}, // upgrade 1
                { level: 3, value: 10, cost: 500 , label: "10 Slots"} // upgrade 2
            ]
        };
    }

    // change display state
    toggle() {
        this.isVisible = !this.isVisible;
        // reget data, prevent desync
        if (this.isVisible) {
            this.gameData = JSON.parse(localStorage.getItem('gameData'));
            this.currentTab = "FIREARMS"; // reset to firearms tab when opened
            // ensure upgrades field exists
            if (!this.gameData.upgrades) {
                this.gameData.upgrades = {AirTank: 1, CargoBox: 1};
            }
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
        fill(255);
        noStroke();
        textAlign(CENTER, TOP);
        textSize(28);
        textFont("Quantico");
        text("DIVER'S GEAR", cx, cy - this.menuHeight/2 + 20);

        // 4. draw tabs
        this.drawTabs(cx, cy);

        // 5. draw current tab content
        if (this.currentTab === "FIREARMS") {
            this.drawFirearmsContent(cx, cy);
        }
        else if (this.currentTab === "UPGRADE") {
            this.drawUpgradeContent(cx, cy);
        }

        // 6. draw instructions
        textSize(14);
        fill(200);
        textAlign(CENTER, BOTTOM);
        noStroke();
        text("Click outside to close", cx, cy + this.menuHeight/2 - 15);


        pop();
    }

    // helper function: draw coins display
    drawCoinsDisplay(cx, cy) {
        push();
        textAlign(RIGHT, TOP);
        textSize(18);
        fill(255, 215, 0); // gold color
        text("$ " + this.gameData.coins, cx + this.menuWidth/2 - 20, cy - this.menuHeight/2 + 25);
        pop();
    }

    // helper function: draw tabs
    drawTabs(cx, cy) {
        let tabY = cy - this.menuHeight/2 + 80;// y position of tabs
        let lineY = tabY + 15; // y position of parting line

        // tabing dimensions
        let tabSpacing = 150;// space between tab centers
        let firearmsTabX = cx - tabSpacing/2; // tab1
        let upgradeTabX = cx + tabSpacing/2; // tab2


        stroke(this.colors.lineColor);
        strokeWeight(2);
        let lineStart = cx - this.menuWidth/2 + 20;
        let lineEnd = cx + this.menuWidth/2 - 20;
        line(lineStart, lineY, lineEnd, lineY);

        textSize(18);
        noStroke();
        textAlign(CENTER, CENTER);

        // Firearms tab
        if (this.currentTab === "FIREARMS") {
            fill(this.colors.textActive);
            this.drawActiveLine(firearmsTabX, lineY);
        } else {
            fill(this.colors.textInactive);
        }
        text("Firearms", firearmsTabX, tabY);

        // Upgrade tab
        if (this.currentTab === "UPGRADE") {
            fill(this.colors.textActive);
            this.drawActiveLine(upgradeTabX, lineY);
        } else {
            fill(this.colors.textInactive);
        }
        text("Upgrade", upgradeTabX, tabY);

    }

    // helper function: draw active tab underline
    drawActiveLine(tabX, lineY) {
        push();
        stroke(this.colors.lineHighlight);
        strokeWeight(3);
        let w = 80; // width of underline
        line(tabX - w/2, lineY, tabX + w/2, lineY);

        // shine effect
        // stroke(this.colors.lineHighlight, 100);
        // strokeWeight(6);
        // line(tabX - w/2, lineY, tabX + w/2, lineY);
        pop();

    }
    // helper function: draw firearms tab content
    drawFirearmsContent(cx, cy) {

        // draw Spear Gun slot (need to change: drawWeaponRow by going through the weapons list)
        this.drawWeaponRow("SpearGun", this.images["SpearGun"], cx, cy-20);
    }

    // helper function: draw upgrade tab content
    drawUpgradeContent(cx, cy) {
        // oxygen tank upgrade row
        this.drawUpgradeRow("AirTank", "Air Tank", this.images["AirTank"], cx, cy - 30);

        // cargo box upgrade row
        this.drawUpgradeRow("CargoBox", "Cargo Box", this.images["CargoBox"], cx, cy + 80);
    }

    // helper function: draw an upgrade row
    drawUpgradeRow(key, title, img, cx, y) {
        let rowW = 520;
        let rowH = 100;

        // get current data
        let currentLvl = this.gameData.upgrades[key];

        let configList = this.upgradeConfig[key];
        let currentStats = configList[currentLvl - 1]; // current level stats (list index starts from 0)
        let nextStats = (currentLvl < configList.length)? configList[currentLvl] : null; // next level stats

        // background
        rectMode(CENTER);
        fill(this.colors.slotBg);
        stroke(255,20);
        strokeWeight(1);
        rect(cx, y, rowW, rowH, 8);

        let imgX = cx - rowW/2 + 60;
        if (img) {
            // draw image
            imageMode(CENTER);
            let ratio = img.width / img.height;
            let displayH = 60; // can change: select size of image
            let displayW = displayH * ratio;
            image(img, imgX, y, displayW, displayH);
        }

        // text info
        //noStroke();
        textAlign(LEFT, TOP);
        fill(255);
        textSize(20);
        text(title, cx - rowW/2 + 120, y - 30);

        textSize(16);
        fill(180);
        text(`Lv. ${currentLvl}`, cx - rowW/2 + 120, y);
        fill(255);
        text(currentStats.label, cx - rowW/2 + 120, y + 20);

        // arrows and next level info
        if (nextStats) {
            fill(255, 100);
            textSize(18);
            textAlign(CENTER, CENTER);
            text(">>>", cx, y + 10);

            textAlign(LEFT, TOP);
            fill(this.colors.textAccent);
            textSize(16);
            text(`Lv. ${nextStats.level}`, cx + 40, y);
            textSize(18);
            text(nextStats.label, cx + 40, y + 20);
        }
        // else {
        //     fill(this.colors.textAccent);
        //     textAlign(CENTER, CENTER);
        //     textSize(18);
        //     //text("MAX LEVEL REACHED", cx + 30, y + 10);
        //     text("MAX LEVEL", cx + 30, y + 10);
        // }

        // upgrade button
        let btnX = cx + rowW/2 - 70;
        let btnW = 100;
        let btnH = 40;
        rectMode(CENTER);

        if (nextStats) {
            let canAfford = (this.gameData.coins >= nextStats.cost);

            if (canAfford) {
                fill(this.colors.btnUpgrade);
                stroke(255, 50);
            }
            else {
                fill(100);
                stroke(255, 20);
            }
            rect(btnX, y, btnW, btnH, 5);

            fill(255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(16);
            text(`$ ${nextStats.cost}`, btnX, y);

            textSize(10);
            fill(255, 200);
            text("UPGRADE", btnX, y - 28);
        }
        else {
            fill(this.colors.slotBg);
            stroke(this.colors.btnMaxed);
            rect(btnX, y, btnW, btnH, 5);

            fill(this.colors.btnMaxed);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(16);
            text("MAX", btnX, y);
        }
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
        stroke(255,20);
        if (isEquipped) {
            stroke(this.colors.highlight); // highlight if equipped
            strokeWeight(3);
        } else {
            strokeWeight(1);
        }
        rect(cx, y, rowW, rowH, 8);

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

        // check which tab clicked
        let tabY = cy - this.menuHeight/2 + 80;
        let tabW = 100;
        let tabH = 40;
        let tabSpacing = 150;

        let firearmsTabX = cx - tabSpacing/2; // tab1
        let upgradeTabX = cx + tabSpacing/2; // tab2

        // tab1: Firearms
        if (mx >= firearmsTabX - tabW/2 && mx <= firearmsTabX + tabW/2 &&
            my >= tabY - tabH/2 && my <= tabY + tabH/2) {
                this.currentTab = "FIREARMS";
                return true; // click handled
        }

        // tab2: Upgrade
        if (mx >= upgradeTabX - tabW/2 && mx <= upgradeTabX + tabW/2 &&
            my >= tabY - tabH/2 && my <= tabY + tabH/2) {
                this.currentTab = "UPGRADE";
                return true; // click handled
        }

        // ckeck content clicks based on current tab
        if (this.currentTab === "FIREARMS") {
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
        }
        else if (this.currentTab === "UPGRADE") {
            // check upgrade buttons
            this.checkUpgradeClick(mx, my, "AirTank", cx, cy - 30);
            this.checkUpgradeClick(mx, my, "CargoBox", cx, cy + 80);
        }  

        // check if clicked outside menu to close
        if (mx < cx - this.menuWidth/2 || mx > cx + this.menuWidth/2 ||
            my < cy - this.menuHeight/2 || my > cy + this.menuHeight/2) {
                this.toggle();
                return true; // click handled
        }

        return true; // click handled if inside menu but not on button

    }

    // helper function: check upgrade button click
    checkUpgradeClick(mx, my, key, cx, y) {
        let rowW = 520;
        let btnX = cx + rowW/2 - 70;
        let btnW = 100;
        let btnH = 40;

        // check if click is within button area
        if (mx >= btnX - btnW/2 && mx <= btnX + btnW/2 &&
            my >= y - btnH/2 && my <= y + btnH/2) {

            let currentLvl = this.gameData.upgrades[key];
            if (currentLvl >= this.upgradeConfig[key].length) return; // already maxed

            let nextStats = this.upgradeConfig[key][currentLvl]; // next level stats
            let cost = nextStats.cost;

            // check if enough coins
            if (this.gameData.coins >= cost) {
                // deduct coins
                this.gameData.coins -= cost;
                // upgrade level
                this.gameData.upgrades[key]++;
                // save back to localStorage
                localStorage.setItem('gameData', JSON.stringify(this.gameData));
                console.log(`Upgraded ${key} to level ${this.gameData.upgrades[key]}`);
            }
            else {
                console.log(`Not enough coins to upgrade ${key}`);
            }
        }
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