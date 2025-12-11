// PreDiveMenu.js
// A menu that appears before diving, allowing players to review and select gear

class PreDiveMenu {
    constructor(iamges) {
        this.images = iamges;
        this.isVisible = false;

        // Menu dimensions
        this.menuWidth = 700;
        this.menuHeight = 450;

        this.colors = {
            bg: color(40, 60,90,240), // Deep blue semi-transparent main background
            panelBg: color(0,0,0,80), // left and right panel background
            slotBg: color(255, 255, 255, 10), // Darker blue for slots
            iconBg: color(0,0,0,50), // Create a hollow effect by using the color of panelBg

            btnEquip: color(50,200,50), // green equip button
            btnUnequip: color(200,50,50), // red unequip button
            btnGo: color(255, 200, 0), // yellow go button

            textWhite: color(255),
            textGray: color(180),
            textAccent: color(255, 215, 0), // gold accent text

            lineColor: color(255, 50) // Light line color
        };

        this.gameData = JSON.parse(localStorage.getItem('gameData'));
        
        // weapon data
        // same as GearMenu.js
        this.weaponConfig = {
            "SpearGun": {
                name: "Spear Gun",
                price: 300,
                description: "Standard diving firearm.\nGood for damage.",
                img: this.images["SpearGun"]
            },
            "Netgun": {
                name: "Net Gun",
                price: 500,
                description: "Catch/Control fish.\nWorks on small/med fish.",
                img: this.images["Netgun"]
            }
        };

        // Upgrade level data
        // same as GearMenu.js
        this.upgradeConfig = {
            "AirTank": [
                { level: 1, label: "60 Bar"},
                { level: 2, label: "90 Bar"},
                { level: 3, label: "120 Bar"}
            ],
            "CargoBox": [
                { level: 1, label: "6 Slots"},
                { level: 2, label: "8 Slots"},
                { level: 3, label: "10 Slots"}
            ]
        };
    }

    // Toggle menu visibility
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.gameData = JSON.parse(localStorage.getItem('gameData'));
        }
    }

    display() {
        if (!this.isVisible) return;

        let cx = width / 2;
        let cy = height / 2;

        push();

        // setup
        translate(0,0);
        rectMode(CENTER);
        textStyle(NORMAL);

        // draw a semi-transparent background
        noStroke();
        fill(0, 150);
        rect(cx, cy, width, height);

        // draw menu background
        fill(this.colors.bg);
        stroke(255);
        strokeWeight(2);
        rect(cx, cy, this.menuWidth, this.menuHeight, 15);

        // draw title
        fill(255);
        noStroke();
        textAlign(CENTER, TOP);
        textSize(28);
        textFont("Quantico");
        text("PRE-DIVE CHECK", cx, cy - this.menuHeight/2 + 20);

        // layout dimensions
        let headerH = 60; // for title
        let footerH = 80; // for GO button
        let contentH = this.menuHeight - headerH - footerH; 
        // Y for main content area
        let contentY = (cy - this.menuHeight/2 + headerH) + contentH/2; 

        let padding = 25; // padding inside menu
        let gap = 20; // between left and right panels 
        
        let leftW = 210; // status panel width
        let rightW = 420; // loadout panel width

        // Calculate panel center X
        let leftPanelX =cx - this.menuWidth/2 + padding + leftW/2;
        let rightPanelX = cx - this.menuWidth/2 + padding + leftW + gap + rightW/2;

        // draw left panel: status
        this.drawStatusPanel(leftPanelX, contentY, leftW, contentH);

        // draw right panel: weapons list
        this.drawLoadoutPanel(rightPanelX, contentY, rightW, contentH);

        // draw bottom GO button
        this.drawGoButton(cx, cy + this.menuHeight/2 - 40);

        pop();
    }

    // draw left status panel
    drawStatusPanel(cx, cy, w, h) {
        // Background
        rectMode(CENTER);
        fill(this.colors.panelBg);
        noStroke(255,30);
        strokeWeight(1);
        rect(cx, cy, w, h, 10);

        // small title
        textAlign(CENTER, TOP);
        fill(200); // a little gray
        textSize(16);
        textStyle(BOLD);
        text("DIVER STATUS", cx, cy - h/2 + 15);

        // Content
        let startY = cy - h/2 + 65;
        let spacing = 65; // space between items

        // Air Tank
        let tankLvl = this.gameData.upgrades.AirTank || 1;
        let tankInfo = this.upgradeConfig.AirTank[tankLvl - 1];
        this.drawStatusItem(cx, startY, this.images["AirTank"], "Oxygen Tank", tankInfo.label, w);

        // Cargo Box
        let cargoLvl = this.gameData.upgrades.CargoBox || 1;
        let cargoInfo = this.upgradeConfig.CargoBox[cargoLvl - 1];
        this.drawStatusItem(cx, startY + spacing, this.images["CargoBox"], "Cargo Box", cargoInfo.label, w);

        // Melee
        this.drawStatusItem(cx, startY + spacing * 2, this.images["Knife"], "Melee", "Diving Knife", w);

        // Harpoon
        this.drawStatusItem(cx, startY + spacing * 3, this.images["Harpoon"], "Harpoon", "Basic Harpoon", w);

    }

    drawStatusItem(cx, y, img, title, value, panelW) {
        let leftEdge = cx - panelW/2;
        let iconX = leftEdge + 40;
        let textX = leftEdge + 80;

        // Icon
        if (img) {
            imageMode(CENTER);
            let ratio = img.width / img.height;
            let h = 35;
            image(img, iconX, y, h * ratio, h);
        } else {
            // Draw a placeholder circle for items without icons
            noFill();
            stroke(255, 50);
            strokeWeight(1);
            ellipse(iconX, y, 35, 35);
        }

        // Text
        textAlign(LEFT, CENTER);
        noStroke();  

        fill(255);
        textStyle(NORMAL);
        textSize(14);
        text(title, textX, y - 9);

        fill(this.colors.textAccent);
        textSize(15);
        text(value, textX, y + 9);
    }

    // draw right weapon loadout panel
    drawLoadoutPanel(cx, cy, w, h) {
        // Background
        rectMode(CENTER);
        fill(this.colors.panelBg);
        noStroke(255,30);
        strokeWeight(1);
        rect(cx, cy, w, h, 10);

        // small title
        textAlign(CENTER, TOP);
        fill(200); // a little gray
        textSize(16);
        textStyle(BOLD);
        text("SELECT WEAPONS", cx, cy - h/2 + 15);

        // Content
        let rowH = 80;
        // small title take 40px, title + half row height + gap
        let firstRowY = (cy - h/2) + 40 + rowH/2 + 10; 
        
        let spacing = 90;
        let currentY = firstRowY;

        let keys = Object.keys(this.weaponConfig);
        for (let i = 0; i < keys.length; i++) {
            let weaponName = keys[i];
            
            if (this.gameData.weapons && this.gameData.weapons[weaponName] > 0) {
                this.drawFirearmRow(weaponName, this.weaponConfig[weaponName], cx, currentY, w - 20);
                currentY += spacing;
            }
        }
    }

    drawFirearmRow(key, config, cx, y, w) {
        let rowH = 80;
        let padding = 10;
        
        let isEquipped = (this.gameData.equippedFirearm === key);

        // background slot
        rectMode(CENTER);
        fill(this.colors.slotBg);
        stroke(255, 30);
        if (isEquipped) {
            stroke(this.colors.btnEquip); 
            strokeWeight(2);
        } else {
            strokeWeight(1);
        }
        rect(cx, y, w, rowH, 8);

        // left icon
        let iconSize = rowH - padding * 2;
        let iconX = cx - w/2 + padding + iconSize/2; // X= centerX - rowWidth/2 + padding + iconHalfWidth
        
        noStroke();
        fill(this.colors.iconBg);
        rect(iconX, y, iconSize, iconSize, 5);

        if (config.img) {
            imageMode(CENTER);
            let maxDim = iconSize - 10;
            let scale = Math.min(maxDim / config.img.width, maxDim / config.img.height);
            image(config.img, iconX, y, config.img.width * scale, config.img.height * scale);
        }

        // text: instructions for weapon usage
        let textX = iconX + iconSize/2 + 15;
        let btnW = 100;
        
        rectMode(CORNER);
        textAlign(LEFT, TOP);
        
        // Name
        fill(255);
        textSize(18);
        textStyle(BOLD);
        text(config.name.toUpperCase(), textX, y - rowH/2 + 15);

        // Description
        fill(180);
        textSize(12);
        textStyle(NORMAL);
        text(config.description, textX, y - rowH/2 + 40);

        // value
        let rightEdge = cx + w/2;
        let btnAreaStart = rightEdge - btnW - padding;
        
        textAlign(RIGHT, TOP);
        fill(this.colors.textAccent);
        textSize(12);
        text("Value: $" + config.price, btnAreaStart - 10, y - rowH/2 + 17);

        // button (EQUIP / UNEQUIP)
        let btnX = rightEdge - btnW/2 - padding;
        let btnH = 35;

        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        textSize(14);

        if (isEquipped) {
            fill(this.colors.btnUnequip);
            stroke(255);
            rect(btnX, y, btnW, btnH, 5);
            
            fill(255);
            noStroke();
            text("UNEQUIP", btnX, y);
        } else {
            fill(this.colors.btnEquip);
            stroke(255);
            rect(btnX, y, btnW, btnH, 5);
            
            fill(0);
            noStroke();
            text("EQUIP", btnX, y);
        }
    }

    drawGoButton(cx, y) {
        let w = 200;
        let h = 50;

        rectMode(CENTER);
        fill(this.colors.btnGo);
        stroke(255);
        strokeWeight(2);
        rect(cx, y, w, h, 25); 

        fill(0);
        noStroke();
        textSize(24);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("GO! DIVE", cx, y);
    }

    handleClick(mx, my) {
        if (!this.isVisible) return false;

        let cx = width / 2;
        let cy = height / 2;
        
        // check go button click
        let goBtnY = cy + this.menuHeight/2 - 40;
        // let w = 200;
        // let h = 50;
        if (mx > cx - 100 && mx < cx + 100 && my > goBtnY - 25 && my < goBtnY + 25) {
            this.startDive();
            return true;
        }

        // check weapon list button clicks
        let headerH = 60;
        let footerH = 80;
        let contentH = this.menuHeight - headerH - footerH;

        let padding = 25;
        let gap = 20;
        let leftW = 210; 
        let rightW = 420;
        let rightPanelX = (cx - this.menuWidth/2) + padding + leftW + gap + rightW/2;
        
        let rowH = 80;
        let startY = (cy - this.menuHeight/2 + headerH) + 40 + rowH/2 + 10;
        let spacing = 90;
        
        let rowWidth = rightW - 20;// list row actual width

        let keys = Object.keys(this.weaponConfig);
        let currentY = startY;

        for (let i = 0; i < keys.length; i++) {
            let weaponName = keys[i];
            
            if (this.gameData.weapons && this.gameData.weapons[weaponName] > 0) {
                let btnW = 100;
                let btnH = 35;
                // in drawFirearmRow(): btnX = rightEdge - btnW/2 - padding
                let rightEdge = rightPanelX + rowWidth/2;
                let btnX = rightEdge - btnW/2 - 10; // 10 is row padding
                
                if (mx > btnX - btnW/2 && mx < btnX + btnW/2 && 
                    my > currentY - btnH/2 && my < currentY + btnH/2) {
                    
                    this.toggleEquip(weaponName);
                    return true;
                }
                currentY += spacing;
            }
        }

        // click outside menu to close
        if (mx < cx - this.menuWidth/2 || mx > cx + this.menuWidth/2 ||
            my < cy - this.menuHeight/2 || my > cy + this.menuHeight/2) {
                this.toggle();
                return true;
        }

        return true;
    }

    toggleEquip(weaponName) {
        if (this.gameData.equippedFirearm === weaponName) {
            // unequip
            this.gameData.equippedFirearm = null;
        } else {
            // equip
            this.gameData.equippedFirearm = weaponName;
        }

        // save to localStorage
        localStorage.setItem('gameData', JSON.stringify(this.gameData));
    }

    startDive() {
        this.toggle();
        // Trigger dive start in main game
        startActualDive();
    }

}

