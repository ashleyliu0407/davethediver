const FISH_CATALOG = [
  "Sardine",
  "Mackerel",
  "Bluefin-Tuna",
  "Salmon",
  "Eel",
  "Scallop",
  "Sea-Urchin",
  "Yellowtail"
];


class BoatInventoryMenu {
  constructor() {
    this.isVisible = false;

    this.menuWidth = 600;
    this.menuHeight = 680;

    this.colors = {
      bg: color(40, 60, 90, 240),
      slotBg: color(0, 80),
      iconBg: color(0, 0, 0, 50),
      textPrimary: color(255),
      textSecondary: color(180),
      lineColor: color(255, 50)
    };

    this.gameData = JSON.parse(localStorage.getItem("gameData")) || {
      inventory: []
    };
  }

  toggle() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.gameData = JSON.parse(localStorage.getItem("gameData")) || { inventory: [] };
    }

    this.gameData.inventory.forEach(item => {
      item.img = fishImages[item.name] || null;
    });
  }

  display() {
    if (!this.isVisible) return;

    let cx = width / 2;
    let cy = height / 2;

    push();
    rectMode(CENTER);
    imageMode(CENTER);
    textFont("Quantico");

    // dark overlay
    noStroke();
    fill(0, 120);
    rect(cx, cy, width, height);

    // main panel
    fill(this.colors.bg);
    stroke(255);
    strokeWeight(2);
    rect(cx, cy, this.menuWidth, this.menuHeight, 15);

    // title
    noStroke();
    fill(255);
    textAlign(CENTER, TOP);
    textSize(28);
    text("DAVE'S CATCHES", cx, cy - this.menuHeight / 2 + 40);

  

    this.drawInventoryList(cx, cy);

    // footer
    noStroke();
    fill(180);
    textSize(14);
    textAlign(CENTER, BOTTOM);
    text("Click outside to close", cx, cy + this.menuHeight / 2 - 15);

    pop();
  }

  drawInventoryList(cx, cy) {
    this.gameData = JSON.parse(localStorage.getItem("gameData")) || { inventory: [] };
    const inventory = this.gameData.inventory || [];

    // Build count map
    const fishCounts = {};
    inventory.forEach(item => {
      if (!item.name || item.name.toLowerCase() === "rice") return;
      fishCounts[item.name] = (fishCounts[item.name] || 0) + (item.quantity || 1);
    });

    const listTop = cy - this.menuHeight / 2 + 90;
    const listBottom = cy + this.menuHeight / 2 - 60;
    const listHeight = listBottom - listTop;

    //there are 8 fish
    const rows = FISH_CATALOG.length; 
    const spacing = listHeight / rows;

    

    for (let i = 0; i < FISH_CATALOG.length; i++) {
      const fishName = FISH_CATALOG[i];
      const count = fishCounts[fishName] || 0;
      const img = fishImages[fishName] || null;

      let y = listTop + spacing * i + spacing / 2;
      this.drawFishRow(cx, y, {
        name: fishName,
        quantity: count,
        img
      });
    }
  }


  drawFishRow(cx, y, item) {
    let rowW = 520;
    let rowH = 60;
    let padding = 12;

    // background
    fill(this.colors.slotBg);
    stroke(255, 20);
    rect(cx, y, rowW, rowH, 8);

    // icon
    let iconSize = rowH - padding * 2;
    let iconX = cx - rowW / 2 + padding + iconSize / 2;

    noStroke();
    fill(this.colors.iconBg);
    rect(iconX, y, iconSize, iconSize, 6);

    // fish image
    if (item.img) {
      image(item.img, iconX, y, iconSize - 10, iconSize - 10);
    } else {
      // fallback
      fill(180);
      ellipse(iconX, y, iconSize - 10);
    }

    // text
    // textAlign(LEFT, CENTER);
    // noStroke();

    fill(this.colors.textPrimary);
    const textX = iconX + iconSize / 2 + 20;

    textAlign(LEFT, CENTER);

    textSize(15);
    text(item.name.toUpperCase(), textX, y - rowH * 0.15);

    textSize(13);
    text(`Quantity: ×${item.quantity}`, textX, y + rowH * 0.15);


  }

  handleClick(mx, my) {
    if (!this.isVisible) return false;

    let cx = width / 2;
    let cy = height / 2;

    // click outside closes
    if (
      mx < cx - this.menuWidth / 2 ||
      mx > cx + this.menuWidth / 2 ||
      my < cy - this.menuHeight / 2 ||
      my > cy + this.menuHeight / 2
    ) {
      this.toggle();
      return true;
    }

    return true;
  }
}