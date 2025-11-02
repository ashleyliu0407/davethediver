// ===============================
// OCEAN + FISH SYSTEM
// ===============================

// get game data from localStorage
let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  day: 1,
  coins: 100,
  inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}]
};

// Grid and ocean settings
const GRID_ROWS = 30;
const WORLD_START_X = -4000;
const WORLD_WIDTH = 7000;
const CELL_HEIGHT = 50;
const CELL_WIDTH = 80;
const GRID_COLS = Math.ceil(WORLD_WIDTH/CELL_WIDTH);

let grid = [];
let activeFish = []; // renamed from allFishes

let player;
let maxDepth;
let oceanHeight;
let cameraOffset = 0;
let inventory;
let backpackIconImg;
let currentZoom = 1.0; // the camera's current zoom level
let isShaking = false; // whether the camera is shaking
let returnButton;

//player 
let diverImgs = {};

//for boxes:
let activeBoxes = [];
let boxImages = {};

// for projectiles:
let activeProjectiles = [];

// Weapon settings
let weaponImages = {};

//instructions
let showInstructions = true;
let instructionBoxAlpha = 220;

//menu pop up 
let showMenuPopup = false;
let menuPopupImg;

const weaponConfig = {
  "Harpoon": {
    type: "DAMAGE_OVER_TIME",
    damage: 1,
    projectileSpeed: 7,
    range: 400
  },
  "SpearGun": {
    type: "DAMAGE",
    damage: 5,
    projectileSpeed: 10,
    range: 400
  },
  "Netgun": {
    type: "CATCH",
    damage: 0,
    projectileSpeed: 5,
    range: 200
  }
}

// fish definitions
const fishPools = {
  shallow: ["Mackerel", "Sardine"],
  medium: ["Salmon", "Yellowtail", "Mackerel", "Sardine"], //, "Scallop"
  deep: ["Bluefin-Tuna", "Eel", "Sea-Urchin"]
};
const allSpecies = [...new Set([
  ...fishPools.shallow,
  ...fishPools.medium,
  ...fishPools.deep
])];
// easy for set
const fishConfig = {
  "Mackerel": {speed: 2.5, size: 80, health: 1},
  "Sardine": {speed: 2, size: 50, health: 1},
  "Salmon": {speed: 2, size: 60, health: 5},
  "Yellowtail": {speed: 1.8, size: 80, health: 8},
  //"Scallop": {speed: 0.1, size: 40, health: 1},
  "Bluefin-Tuna": {speed: 1, size: 150, health: 15},
  "Eel": {speed: 1.5, size: 90, health: 10},
  "Sea-Urchin": {speed: 0, size: 40, health: 1}
};

//some fish imgs need to be stretched 
const fishStretch = {
  "Mackerel": 1.0,
  "Sardine": 1.0,
  "Salmon": 1.7,
  "Yellowtail": 1.25,
  "Bluefin-Tuna": 1.4,
  "Eel": 1.6,
  //"Scallop": 1.0,
  "Sea-Urchin": 1.0
};

let fishImages = {};
// random generate type (can change)
const AMBIENT_FISH_POOLS = {
  shallow: ["Mackerel", "Sardine"],
  medium: ["Salmon", "Yellowtail", "Mackerel", "Sardine"], // "Scallop"
  deep: []
};
const AMBIENT_FISH_TYPES = [...new Set([
  ...AMBIENT_FISH_POOLS.shallow,
  ...AMBIENT_FISH_POOLS.medium,
  ...AMBIENT_FISH_POOLS.deep
])]; // no deep fish

// ===============================
// LOAD IMAGES
// ===============================
function preload() {
  backpackIconImg = loadImage("images/bag/BagUI.png");
  // boxImages.oxygen = loadImage("images/OxygenBox.png");
  boxImages.oxygen = loadImage("images/oxyg.png");

  // add fish image loading logic(need to change)
  for (let species of allSpecies) {
    fishImages[species] = { left: null, right: null }; 
    let pathL = `images/fish/${species}_L.gif`;
    let pathR = `images/fish/${species}_R.gif`;
    loadImage(pathL, img => fishImages[species].left = img);
    loadImage(pathR, img => fishImages[species].right = img);
  }

  //diver imgs 
  diverImgs.still = loadImage("images/diver/dave_S.png");
  diverImgs.swimLeft = loadImage("images/diver/dave_L.png");
  diverImgs.swimRight = loadImage("images/diver/dave_R.png");
  diverImgs.swimDown = loadImage("images/diver/dave_D.png");

  diverImgs.aim = loadImage("images/diver/dave_Aim.png");
  diverImgs.aimL = loadImage("images/diver/dave_LG.png");
  diverImgs.aimR = loadImage("images/diver/dave_RG.png");
  diverImgs.shootL = loadImage("images/diver/dave_LS.png");
  diverImgs.shootR = loadImage("images/diver/dave_RS.png");

  // load weapon images
  weaponImages.Harpoon = loadImage("images/Harpoon.png");

  //menu image
  menuPopupImg = loadImage("images/fish/menu.png");

}


// ===============================
// SETUP + DRAW LOOP
// ===============================
function setup() {
  let canvas = createCanvas(1400, 800);
  canvas.elt.oncontextmenu = (e) => e.preventDefault(); // disable right click menu
  createOceanGrid();


  //Font
  textFont('Quantico');

  player = new Player(0, 0, diverImgs);
  oceanHeight = GRID_ROWS * CELL_HEIGHT;
  maxDepth = oceanHeight;

  // Use Inventory class from external file
  inventory = new Inventory(6, backpackIconImg); // can change
  spawnOxygenBoxes();

  // Create return button
  returnButton = createButton('Return to Boat');
  returnButton.position(180, 60);
  returnButton.style("font-size", "15px");
  returnButton.style("color", "black");
  returnButton.style("background-color", "#ff532cff");
  returnButton.style("border-radius", "8px");
  returnButton.style("cursor", "pointer");
  returnButton.style("font-family", "Quantico, sans-serif");
  returnButton.position(width/2 - 60, 80); // Center top
  returnButton.mousePressed(returnToBoat);
  returnButton.hide();
}

function draw() {
  background(0);
  drawOceanGradient();

  player.handleInput();
  player.update();
  player.checkEdges();

  // control the return button
  player.position.y <= 0 ? returnButton.show() : returnButton.hide();

  activateGridFish(); // spawn grid fish
  updateActiveFish();

  updateProjectiles(); // new function to update projectiles

  // determine target zoom
  let targetZoom = player.isAiming ? 1.2 : 1.0;
  // smoothly interpolate current zoom towards target zoom
  currentZoom = lerp(currentZoom, targetZoom, 0.1);

  push();
  translate(-cameraOffset + width / 2, 0);
  let cameraY = constrain(-player.position.y + height / 2, -maxDepth + height, 0);
  translate(0, cameraY);

  // camera shake effect
  if (isShaking) {
    // if harpoonProjectile is attached to a fish, shake
    let shakeX = random(-2, 2); // (can change)
    let shakeY = random(-2, 2); // (can change)
    translate(shakeX, shakeY);
  }

  // move to player position
  translate(player.position.x, player.position.y);
  // apply zoom
  scale(currentZoom);
  // move back
  translate(-player.position.x, -player.position.y);

  drawActiveFish();

  drawProjectiles(); // new function to draw projectiles

  // Draw oxygen boxes
  for (let i = activeBoxes.length - 1; i >= 0; i--) {
    let box = activeBoxes[i];
    box.display();
    box.checkCollision(player);
    if (box.isCollected) {
      activeBoxes.splice(i, 1);
    }
  }



  player.display();
  pop();
  drawDarknessOverlay();

  // Oxygen bar always drawn --> In own layer
  push();
  //not impacted by camera 
  resetMatrix();   
  drawOxygenBar();
  pop();

  //Draw inventory 
  push();
  resetMatrix();
  inventory.display();
  pop();

  //drawing menu popup
  if (showMenuPopup) {
    drawMenu();
    
  }

  // draw weapon UI
  push();
  resetMatrix();
  drawWeaponUI();
  pop();

  //instructions
  if (showInstructions) {
    // Text content
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(
      "Hey Dave, Ready To Dive?\n\n" +
      "• Use WASD to swim\n\n" +
      "• Use RIGHT CLICK (two fingers on mousepad) to AIM \n\n" +
      "• Press 1 to SHOOT \n\n" +
      "• Hold SHIFT to swim FASTER \n\n" +
      "• Collected fish show up in INVENTORY\n\n" +
      "• Keep an eye out for your OXYGEN or you'll loose your fish...\n\n" +
      "Click anywhere to start.",
      width / 2, height / 2
    );
  }

  //MENU
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
   text(
      "Menu",
      1250, 750
  );
  

}

// ===============================
// GRID GENERATION
// ===============================
function createOceanGrid() {
  grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    let depthLevel = r < 10 ? "shallow" : r < 20 ? "medium" : "deep";
    let row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      // use fishPools to find fish for the grid
      let fishType = generateFish(depthLevel);
      // if it is a AMBIENT fish, don't keep
      if (AMBIENT_FISH_TYPES.includes(fishType)) {
        fishType = null;
      }

      row.push({
        x: c * CELL_WIDTH + WORLD_START_X,
        y: r * CELL_HEIGHT,
        depth: depthLevel,
        fish: fishType,
        hasOxygenTank: random(1) < 0.03, // can change: 3% chance to have oxygen tank
        isActive: false // whether the fish display
      });
    }
    grid.push(row);
  }
}

function generateFish(depth) {
  if (random(1) < 0.01) { // can change: The number of fish produced 
    let fishList = fishPools[depth];
    return random(fishList);
  }
  return null;
}

// ===============================
// FISH MANAGEMENT
// ===============================
function spawnFish() {

  let r = floor(random(GRID_ROWS));
  let depthLevel = r < 10 ? "shallow" : r < 20 ? "medium" : "deep";

  let ambientPool = AMBIENT_FISH_POOLS[depthLevel];
  if (ambientPool.length === 0) return; // no ambient fish for this depth

  // only random generate ambient fish
  let fishType = random(ambientPool);

  // get data from the config objects
  let config = fishConfig[fishType];
  let images = fishImages[fishType];

  let y = r * CELL_HEIGHT + CELL_HEIGHT / 2;
  let dir = random([1, -1]);
  let spawnOffset = cameraOffset - width / 2;
  let x = dir === 1 ? spawnOffset - 50 : spawnOffset + width + 50;

  // create a new fish
  let fish = new Fish(
    fishType, x, y, dir,
    config.speed,
    config.size,
    config.health,
    images.left,
    images.right
  );
  activeFish.push(fish);
}

// new function: Spawns GRID fish using fishConfig
function activateGridFish() {
  // buffer + screen
  let viewLeft = cameraOffset - width/2 -800;
  let viewRight = cameraOffset + width / 2 + 800;
  let viewTop = player.position.y - height -600;
  let viewBottom = player.position.y + height +600;

  // screen
  let screenLeft = cameraOffset - width/2;
  let screenRight = cameraOffset + width / 2;
  let screenTop = player.position.y - height;
  let screenBottom = player.position.y + height;

  // calculate which rows and cols that we locate at
  let cMin = floor(max(0, (viewLeft - WORLD_START_X) / CELL_WIDTH));
  let cMax = floor(min(GRID_COLS, (viewRight - WORLD_START_X) / CELL_WIDTH));
  let rMin = floor(max(0,viewTop / CELL_HEIGHT));
  let rMax = floor(min(GRID_ROWS, viewBottom / CELL_HEIGHT));

  for (let r = rMin; r< rMax; r++) {
    for (let c = cMin; c< cMax; c++) {
      let cell = grid[r][c];

      // check if the fish is already displaying
      if (cell.fish && !cell.isActive) {

        let x = cell.x + CELL_WIDTH / 2;
        let y = cell.y + CELL_HEIGHT / 2;

        let isInsideScreen = (x > screenLeft && x < screenRight && y > screenTop && y < screenBottom);
        
        // It will only be generated when it is not within the screen (that is, in the buffer area)!
        if (!isInsideScreen) {
          cell.isActive = true;

          let fishType = cell.fish;
          // get data from the config objects
          let config = fishConfig[fishType];
          let images = fishImages[fishType];

          let dir = random([1, -1]);

          // create a new fish, passing in its grid coords
          let fish = new Fish(
            fishType, x, y, dir,
            config.speed,
            config.size,
            config.health,
            images.left,
            images.right,
            r, c // grid coordinates
          ); 
          activeFish.push(fish);
        }
        
      }
    }
  }
}


function updateActiveFish() {
  for (let i = activeFish.length - 1; i >= 0; i--) {
    let fish = activeFish[i];
    fish.update();

    // Easier collection radius (need to change after weapon)
    let d = dist(player.position.x, player.position.y, fish.x, fish.y);

    // Only collect if health is 0 (or less)
    if (fish.health <= 0 && d < player.radius + fish.size / 2) {
      if (inventory.addItem(fish)) {
        // if it was not an ambient fish, permanently remove from grid
        if (!fish.isAmbient) {
          grid[fish.gridR][fish.gridC].fish = null;
          grid[fish.gridR][fish.gridC].isActive = false;
        }

        activeFish.splice(i, 1);
        continue;
      }
    }

    // Reduce loading pressure
    if (fish.isOffScreen(cameraOffset)) {
      // ambient fish delete directly
      if (fish.isAmbient) {
        activeFish.splice(i, 1);
      }
      else {
        // hide the fish
        grid[fish.gridR][fish.gridC].isActive = false;
        activeFish.splice(i, 1);
      }
      continue;
    }
  }

  // this line now only spawns ambient fish
  if (random(1) < 0.03) spawnFish(); // can change: spawn rate
}

function drawActiveFish() {
  for (let fish of activeFish) {
    fish.draw();
    fish.closeTo();
  }
}

// ===============================
// PROJECTILE MANAGEMENT
// ===============================
function updateProjectiles() {
  // no shake by default
  isShaking = false;

  for (let i = activeProjectiles.length - 1; i >= 0; i--) {
    let proj = activeProjectiles[i];
    proj.update();

    // harpoon specific logic
    if (proj.type === "DAMAGE_OVER_TIME") {

      // if harpoon is attached to a fish, enable camera shake
      if (proj.state === "ATTACHED" || proj.state === "DYING_STRUGGLE") {
        // enable camera shake
        isShaking = true;
      }

      // if harpoon is retracting, it can't hit anything
      if (proj.state === "RETRACTING") {
        if (!proj.isActive) {
          player.harpoonOut = false; // allow firing again
          activeProjectiles.splice(i, 1);
        }
        continue;
      }

      // if harpoon is firing, check for collision with fish
      if (proj.state === "FIRING") {
        for (let j = activeFish.length - 1; j >= 0; j--) {
          let fish = activeFish[j];
          if (fish.health <= 0) continue; // skip dead fish

          let d = dist(proj.position.x, proj.position.y, fish.x, fish.y);
          if (d < fish.size / 2) {
            // hit!
            proj.attach(fish);
            break;
          }
        }
      }
    }

    // will add SpearGun and Netgun logic later

    // check if projectile is expired
    if (!proj.isActive) {
      activeProjectiles.splice(i, 1);
    }
  }
}

function drawProjectiles() {
  for (let proj of activeProjectiles) {
    proj.draw();
  }
}


// ===============================
// VISUALS
// ===============================
function drawOceanGradient() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color("#5ac8fa"), color("#001f3f"), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawDarknessOverlay() {
  push();
  resetMatrix();
  rectMode(CORNER);
  // Increase alpha range and use darker blue
  let alpha = map(player.position.y, 0, maxDepth, 0, 220);
  fill(0, 0, 20, alpha);
  noStroke();
  rect(0, 0, width, height);
  pop();
  
}

function drawMenu(){
  push();
  resetMatrix();
  imageMode(CORNER);
    
  // adjust position to sit beside inventory
  let popupX = width - 420; 
  let popupY = height - 400;

  // semi-transparent background box
  fill(0, 150);
  noStroke();
  rect(popupX - 10, popupY - 10, 350, 280, 10);

  // draw menu image
  image(menuPopupImg, popupX, popupY, 330, 260);

  // optional label
  fill(255);
  textSize(30);
  textAlign(LEFT, TOP);
  text("Dave's Menu", popupX + 10, popupY - 50);
  pop();
}


// ===============================
// INPUT HANDLING FOR INVENTORY
// ===============================
function mousePressed() {
  //check if clicking inventory
  if (inventory) inventory.handleClick(mouseX, mouseY);
  if (showInstructions) {
    showInstructions = false; 
  }

  //menu
  
  if (mouseX > 1210 && mouseX < 1290 && mouseY > 730 && mouseY < 770) {
    showMenuPopup = !showMenuPopup;
  }


}

function keyPressed() {

  if (keyCode === ESCAPE && inventory) inventory.toggle();
}


// ===============================
// OXYGEN BAR UI
// ===============================
function drawOxygenBar() {
  push();
  resetMatrix(); // ensures it stays fixed on screen
  noStroke();

  // Background box
  fill(40, 60, 90, 220);
  rect(20, 30, 220, 28, 6);

  // Oxygen fill
  let oxyRatio = player.currentOxygen / player.maxOxygen;
  let barWidth = 220 * oxyRatio;
  let barColor = lerpColor(color(0, 255, 200), color(255, 50, 50), 1 - oxyRatio); // green → red
  fill(barColor);
  rect(20, 30, barWidth, 28, 6);

  // Border
  noFill();
  stroke(255);
  strokeWeight(1.8);
  rect(20, 30, 220, 28, 6);

  // Text overlay
  noStroke();
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Oxygen: ${player.currentOxygen.toFixed(0)} / ${player.maxOxygen}`, 250, 34);

  // Optional depth readout
  textSize(14);
  fill(200);
  text(`Depth: ${int(player.position.y)} ft`, 250, 54);

  pop();

  
}

//spawn oxygen boxes:
function spawnOxygenBoxes() {
  activeBoxes = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      // ~3% chance per grid cell
      let cell = grid[r][c]; // get the cell from the grid

      // read the data we already saved in createOceanGrid
      if (cell.hasOxygenTank) {
        let x = cell.x + CELL_WIDTH /2;
        let y = cell.y + CELL_HEIGHT / 2;
        let oxygenAmount = player.maxOxygen / 2; // can change

        let oBox = new OxygenBox(x, y, oxygenAmount, boxImages.oxygen);
        activeBoxes.push(oBox);
      }
    }
  }
}

function drawWeaponUI() {
  // layout settings
  let startX = 30; // distance from left edge
  let startY = height - 90; // distance from bottom edge
  let slotSize = 60; // size of each weapon slot
  let spacing = 10; // spacing between slots
  let titleY = startY - 15; // y position for the title text
  let highlightColor = color(255, 200, 0, 200); // color for highlighting

  // check ownership status

  // 1. melee weapon
  let meleeWeapon = "None";
  let displayMeleeImg = null;
  if (player.weapons["Knife"]) {
    meleeWeapon = "Knife";
    // displayMeleeImg = weaponImages.Knife;
  }

  // 2. Harpoon
  let harpoonWeapon = "None";
  let displayHarpoonImg = null;
  if (player.weapons["Harpoon"]) {
    harpoonWeapon = "Harpoon";
    displayHarpoonImg = weaponImages.Harpoon;
  }

  // 3. firearm weapon
  let firearm = "None";
  let displayFirearmImg = null;
  if (player.weapons["SpearGun"]) {
    firearm = "SpearGun";
    // displayFirearmImg = weaponImages.SpearGun;
  } else if (player.weapons["Netgun"]) {
    firearm = "Netgun";
    // displayFirearmImg = weaponImages.Netgun;
  }

  // draw
  push();
  rectMode(CORNER);
  textAlign(LEFT, TOP);
  imageMode(CENTER);

  // 1. title
  textSize(16);
  noStroke();
  fill(255);
  text("Weapons:", startX, titleY);
  
  // 2. 1X3 weapon slots
  // melee
  let slot1X = startX;
  fill(0,50);
  stroke(255,150);

  if (player.currentWeapon === meleeWeapon) {
    stroke(highlightColor);
    strokeWeight(2); // thicker border for highlight
  }
  rect(slot1X, startY, slotSize, slotSize, 5);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  if (displayMeleeImg) {
    image(displayMeleeImg, slot1X + slotSize / 2, startY + slotSize / 2, slotSize - 10, slotSize -10);
  }
  else {
    text(meleeWeapon, slot1X + slotSize / 2, startY + slotSize / 2);
  }

  // harpoon
  let slot2X = startX + slotSize + spacing;
  fill(0,50);
  stroke(255,150);
  if (player.currentWeapon === harpoonWeapon) {
    stroke(highlightColor);
    strokeWeight(2); // thicker border for highlight
  }
  rect(slot2X, startY, slotSize, slotSize, 5);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  if (displayHarpoonImg) {
    image(displayHarpoonImg, slot2X + slotSize / 2, startY + slotSize / 2, slotSize -10, slotSize -10);
  }
  else {  
    text(harpoonWeapon, slot2X + slotSize / 2, startY + slotSize / 2);
  }

  // firearm
  let slot3X = startX + (slotSize + spacing) * 2;
  fill(0,50);
  stroke(255,150);
  if (player.currentWeapon === firearm) {
    stroke(highlightColor);
    strokeWeight(2); // thicker border for highlight
  }
  rect(slot3X, startY, slotSize, slotSize, 5);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  if (displayFirearmImg) {
    image(displayFirearmImg, slot3X + slotSize / 2, startY + slotSize / 2, slotSize - 10, slotSize -10);
  }
  else  {
    text(firearm, slot3X + slotSize / 2, startY + slotSize / 2);
  }

  pop();
}

function returnToBoat() {

  // get data again （just in case)
  let gameData = JSON.parse(localStorage.getItem("gameData")) || {
    day: 1,
    coins: 100,
    inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}]
  };

  // define a transfer table
  const fishDataDefaults = {
    'Salmon': { name: 'Salmon', image: 'images/restaurant/ingredients/salmon.png' },
    'Yellowtail': { name: 'Yellowtail', image: 'images/restaurant/ingredients/yellowtail.png' },
    'Mackerel': { name: 'Mackerel', image: 'images/restaurant/ingredients/mackerel.png' },
    'Sardine': { name: 'Sardine', image: 'images/restaurant/ingredients/sardine.png' },
    'Sea-Urchin': { name: 'Sea Urchin', image: 'images/restaurant/ingredients/sea_urchin.png' },
    'Eel': { name: 'Eel', image: 'images/restaurant/ingredients/eel.png' },
    'Bluefin-Tuna': { name: 'Bluefin Tuna', image: 'images/restaurant/ingredients/bluefin_tuna.png' }
    // no Scallop transfer
  }

  // go through inventory and transfer fish
  let fishAdded = 0; // for debug: count of fish added
  let fishStacked = 0; // for debug: count of fish stacked

  for (let caughtFish of inventory.items) {
    let fishType = caughtFish.type;
    let defaultData = fishDataDefaults[fishType];

    if (defaultData) { // for debug: only transfer defined fish
      let targetName = defaultData.name;
      let targetFreshness = 'Day 1'; // all new catch are fresh

      // check if fish already exists in inventory
      let existingStack = gameData.inventory.find(item => item.name === targetName && item.freshness === targetFreshness);
    
      if (existingStack) {
        // increment quantity
        existingStack.quality += 1;
        fishStacked += 1; // for debug: count of fish stacked
      }
      else {
        // add new entry
        let newItem = {
          name: targetName,
          freshness: targetFreshness,
          quality: 1,
          image: defaultData.image
        };
        gameData.inventory.push(newItem);
        fishAdded += 1; // for debug: count of fish added
      }
    }
    else {
      console.warn(`No transfer data defined for fish type: ${fishType}`);
    }
  }
  console.log(`Transferred to sushi bar: ${fishAdded} new stacks, ${fishStacked} stacked.`); // for debug

  // save back to localStorage
  localStorage.setItem("gameData", JSON.stringify(gameData));

  // clear inventory
  inventory.items = [];

  // go back to boat scene
  window.location.href = "boatStart.html";
}