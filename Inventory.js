// Inventory.js - defines to manage player's inventory (in water state) 

class Inventory {
    constructor(capacity, iconImg) {
        this.capacity = capacity; // max number of items
        this.items = []; // stored items
        this.isOpen = false; // pop-up state
        this.iconImg = iconImg; // backpack icon image
        this.iconSize = 100; // size of icon
        this.margin = 10; // distance from screen edge
        this.closeSize = 24; // size of close button("X")

        this.selectedIndex = null; // which item is selected
        this.confirmDiscard = false; // confirm discard state

        this.extraSlots = Math.floor(this.capacity / 3); // extra red slots
        this.totalSlots = this.capacity + this.extraSlots; // total displayed slots

    }

    // update capacity (e.g., when buying backpack upgrade)
    updateCapacity(newCapacity) {
        this.capacity = newCapacity;
        this.extraSlots = Math.floor(this.capacity / 3);
        this.totalSlots = this.capacity + this.extraSlots;
    }

    // Try to add an item into inventory
    addItem(item) {
        if (this.items.length < this.totalSlots) {
            this.items.push(item);
            return true; // successfully added
        }
        else {
            // need to change(add some feedback)
            console.log("Inventory full!");
            return false; // inventory full
        }
    }

    // Toggle inventory pop-up
    toggle() {
        this.isOpen = !this.isOpen;
        this.selectedIndex = null;
        this.confirmDiscard = false;
    }

    // Handle click events(Mx: mouse x, My: mouse y)
    handleClick(Mx, My) {
        // Click on backpack icon
        let iconX = width - this.iconSize/2 - this.margin;
        let iconY = height - this.iconSize/2 - this.margin;

        // open inventory
        if (!this.isOpen && dist(Mx, My, iconX, iconY) < this.iconSize/2) {
            this.isOpen = true;
            return;
        }

        // open inventory - check clicks inside window
        if (this.isOpen) {
            // popup window dimensions
            let winW = width * 0.6;
            let winH = height * 0.4;
            let winX = (width - winW) / 2;
            let winY = (height - winH) / 2;

            // "X" button area
            let xBtnX = winX + winW - this.closeSize/2 - 10;
            let xBtnY = winY + this.closeSize/2 + 10;
            // close inventory
            if (Mx > xBtnX - this.closeSize/2 && Mx < xBtnX + this.closeSize/2 && My > xBtnY - this.closeSize/2 && My < xBtnY + this.closeSize/2) {
                this.isOpen = false;
                return;
            }      

            // if click slot
            const cols = 8; // how many slots per row
            const rows = Math.ceil(this.totalSlots / cols); // how many rows needed
            const slotSize = 52; // size of each slot
            const spacing = 10; // space between slots
            let startX = winX + 28 + slotSize/2;
            let startY = winY + winH/2 - (rows * (slotSize + spacing) - spacing) / 2 + slotSize/2;

            for (let i=0; i<this.totalSlots; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                
                let slotX = startX + col * (slotSize + spacing);
                let slotY = startY + row * (slotSize + spacing);
                if (Mx > slotX - slotSize/2 && Mx < slotX + slotSize/2 && My > slotY - slotSize/2 && My < slotY + slotSize/2) {
                    // clicked on slot i
                    if (i < this.items.length) {
                        this.selectedIndex = i;
                        this.confirmDiscard = false;
                        return;
                    }
                }
            }

            // check if clicked on confirm discard button
            if (this.selectedIndex !== null) {
                // position of discard button
                let textY = winY + winH - 40;
                let btnW = 100;
                let btnH = 30;
                let btnX = winX + winW - 60 - btnW/2;
                let btnY = textY;

                if (!this.confirmDiscard) {
                    // clicked on "Discard" button
                    if (Mx > btnX - btnW/2 && Mx < btnX + btnW/2 && My > btnY - btnH/2 && My < btnY + btnH/2) {
                        this.confirmDiscard = true;
                        return;
                    }
                }
                else {
                    // clicked YES or NO
                    let yesX = btnX - 40;
                    let noX = btnX + 40;
                    let halfW = 35;
                    let halfH = 18;

                    // YES button
                    if (Mx > yesX - halfW && Mx < yesX + halfW && My > btnY - halfH && My < btnY + halfH) {
                        // remove item
                        this.items.splice(this.selectedIndex, 1);
                        this.selectedIndex = null;
                        this.confirmDiscard = false;
                        return;
                    }
                    // NO button
                    if (Mx > noX - halfW && Mx < noX + halfW && My > btnY - halfH && My < btnY + halfH) {
                        this.confirmDiscard = false;
                        return;
                    }
                }
            }
        }
    }



    // Display inventory icon and pop-up window
    display() {
        // icon
        this.displayIcon();
        // pop-up window
        if (this.isOpen) {
            this.displayWindow();
        }
    }

    // draw inventory icon
    displayIcon() {
        imageMode(CENTER);
        // backpack icon
        let iconX = width - this.iconSize/2 - this.margin;
        let iconY = height - this.iconSize/2 - this.margin;
        
        if (this.iconImg) {
            image(this.iconImg, iconX, iconY, this.iconSize, this.iconSize);
        }
        else {
            // placeholder if no image
            fill(180);
            rectMode(CENTER);
            rect(iconX, iconY, this.iconSize, this.iconSize, 10);
        }
    }

    // draw pop-up window in the center of the screen
    displayWindow() {
        // window dimensions
        let winW = width * 0.6;
        let winH = height * 0.4;
        let winX = (width - winW) / 2;
        let winY = (height - winH) / 2;

        // window background
        fill(255, 240);
        stroke(0);
        rectMode(CORNER);
        rect(winX, winY, winW, winH, 10);

        // Title
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(22);
        text("Acquired", winX + winW/2, winY + 25);

        // "X" button to close
        rectMode(CENTER);
        fill(200, 100, 100);
        rect(winX + winW - this.closeSize/2 - 10, winY + this.closeSize/2 + 10, this.closeSize, this.closeSize, 5);
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);
        text("X", winX + winW - this.closeSize/2 - 10, winY + this.closeSize/2 + 10);


        // draw slots
        const cols = 8; // how many slots per row
        const rows = Math.ceil(this.totalSlots / cols); // how many rows needed
        const slotSize = 52; // size of each slot
        const spacing = 10; // space between slots
        let startX = winX + 28 + slotSize/2;
        let startY = winY + winH/2 - (rows * (slotSize + spacing) - spacing) / 2 + slotSize/2;

        for (let i=0; i<this.totalSlots; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            let slotX = startX + col * (slotSize + spacing);
            let slotY = startY + row * (slotSize + spacing);

            // draw slot background
            rectMode(CENTER);
            stroke(0);

            // determine slot color
            if (i < this.capacity) {
                if (i === this.selectedIndex) {
                    fill(255,240,200); // highlight selected slot
                }
                else {
                    noFill();
                }
            }
            else {
                if (i === this.selectedIndex) {
                    fill(255,240,200); // highlight selected slot
                }
                else {
                    fill(255,100,100,160); // extra red slots
                }
            }

            rect(slotX, slotY, slotSize, slotSize, 5);

            if (i < this.items.length) {
                let fish = this.items[i];
                imageMode(CENTER);
                if (fish.imgRight) {
                    image(fish.imgRight, slotX, slotY, slotSize, slotSize);
                }
                else {
                    // placeholder if no image
                    fill(fish.fallbackColor);
                    noStroke();
                    ellipse(slotX, slotY, slotSize, slotSize);
                }
            }
        }

        // bottom area - fish details and discard button
        if (this.selectedIndex !== null && this.items[this.selectedIndex]) {
            let fishName = this.items[this.selectedIndex].species;
            let textY = winY + winH - 40;
            fill(0);
            textAlign(LEFT, CENTER);
            noStroke();
            textSize(18);
            text(`${fishName}`, winX + 40, textY);

            // discard button
            let btnW = 100;
            let btnH = 30;
            let btnX = winX + winW - 60 - btnW/2;
            let btnY = textY;

            rectMode(CENTER);
            textAlign(CENTER, CENTER);
            textSize(14);
            if (!this.confirmDiscard) {
                // normal discard button
                //fill(200, 100, 100);
                fill(220, 120, 120);
                rect(btnX, btnY, btnW, btnH, 5);
                fill(255);
                text("Discard", btnX, btnY);
            }
            else {
                // yes/no confirmation
                fill(200, 80, 80);
                rect(btnX - 40 , btnY, 70,28,5);
                fill(255);
                text("Yes", btnX - 40, btnY);

                fill(160);
                rect(btnX + 40 , btnY, 70,28,5);
                fill(255);
                text("No", btnX + 40, btnY);
            }

        }
    }
}