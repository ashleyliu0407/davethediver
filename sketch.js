// ===============================
// OCEAN + FISH SYSTEM
// ===============================

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

//for box:
let activeBoxes = [];
let boxImages = {};

// fish definitions
const fishPools = {
  shallow: ["Mackerel", "Sardine"],
  medium: ["Salmon", "Yellowtail", "Scallop", "Mackerel", "Sardine"],
  deep: ["Bluefin Tuna", "Eel", "Sea Urchin"]
};
const allSpecies = [...new Set([
  ...fishPools.shallow,
  ...fishPools.medium,
  ...fishPools.deep
])];
// easy for set
const fishConfig = {
  "Mackerel": {speed: 2.5, size: 30},
  "Sardine": {speed: 2, size: 20},
  "Salmon": {speed: 2.2, size: 40},
  "Yellowtail": {speed: 1.8, size: 50},
  "Scallop": {speed: 0.1, size: 25},
  "Bluefin Tuna": {speed: 3, size: 70},
  "Eel": {speed: 1.5, size: 60},
  "Sea Urchin": {speed: 0, size: 30}
};

let fishImages = {};
// random generate type (can change)
const AMBIENT_FISH_POOLS = {
  shallow: ["Mackerel", "Sardine"],
  medium: ["Salmon", "Yellowtail", "Scallop", "Mackerel", "Sardine"],
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
  backpackIconImg = loadImage("images/BagUI.png");
  boxImages.oxygen = loadImage("images/OxygenBox.png");

  // add fish image loading logic(need to change)
  for (let species of allSpecies) {
    // when we have the fish images, use it
    // fishImages[species] = {
    //     left: loadImage(pathL),
    //     right: loadImage(pathR)
    // };
    let pathL = `images/fish/${species}_L.png`;
    let pathR = `images/fish/${species}_R.png`;

    fishImages[species] = {left: null, right: null};
    loadImage(pathL,
        img => fishImages[species].left = img,
        err => {fishImages[species].left = null;}
    );
    loadImage(pathR,
        img => fishImages[species].right = img,
        err => {fishImages[species].right = null;}
    );
  }
}

// // ===============================
// // FISH CLASS
// // ===============================
// class Fish {
//   constructor(type, x, y, dir, speed) {
//     this.type = type;
//     this.x = x;
//     this.y = y;
//     this.dir = dir;
//     this.speed = speed;
//     this.phase = random(1000);
//     this.fallbackColor = color(random(150, 255), random(150, 255), random(150, 255));
//   }

//   update() {
//     this.x += this.speed * this.dir;
//     this.y += sin(frameCount * 0.09 + this.phase) * 0.4;
//   }

//   isOffScreen(cameraOffset) {
//     let viewportLeft = cameraOffset - width / 2 - 100;
//     let viewportRight = cameraOffset + width / 2 + 100;
//     return this.x < viewportLeft || this.x > viewportRight;
//   }

//   closeTo() {
//     let d = dist(this.x, this.y, player.position.x, player.position.y);
//     if (d < 100 && !this.escaping) {
//       this.escaping = true;
//       this.dir *= -1;
//       this.escapeTimer = 30;
//     }

//     // Slightly smoother and slower reaction
//     if (this.escaping) {
//       this.speed = lerp(this.speed, 2.8, 0.08);
//       this.escapeTimer--;
//       if (this.escapeTimer <= 0) this.escaping = false;
//     } else {
//       this.speed = lerp(this.speed, 2, 0.05);
//     }
//   }

//   draw() {
//     noStroke();
//     push();
//     translate(this.x, this.y);
//     scale(this.dir, 1);

//     fill(this.fallbackColor);
//     ellipse(0, 0, 40, 15);

//     pop();
//   }
// }

// ===============================
// SETUP + DRAW LOOP
// ===============================
function setup() {
  createCanvas(1400, 800);
  createOceanGrid();

  //Font
  textFont('Quantico');

  player = new Player(0, 0);
  oceanHeight = GRID_ROWS * CELL_HEIGHT;
  maxDepth = oceanHeight;

  // Use Inventory class from external file
  inventory = new Inventory(12, backpackIconImg); // can change
  spawnOxygenBoxes();
}

function draw() {
  background(0);
  
  drawOceanGradient();

  player.handleInput();
  player.update();
  player.checkEdges();

  activateGridFish(); // add new
  updateActiveFish();

  push();
  translate(-cameraOffset + width / 2, 0);
  let cameraY = constrain(-player.position.y + height / 2, -maxDepth + height, 0);
  translate(0, cameraY);

  drawActiveFish();

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
  if (random(1) < 0.1) { // can change: The number of fish produced 
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
    if (d < player.radius + fish.size / 2) {
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
  if (random(1) < 0.03) spawnFish();
}

function drawActiveFish() {
  for (let fish of activeFish) {
    fish.draw();
    fish.closeTo();
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
  
  // push();
  // resetMatrix(); 
  // rectMode(CORNER); 
  // let alpha = map(player.position.y, 0, maxDepth, 0, 100);
  // fill(0, 0, 100, alpha);
  // noStroke();
  // rect(0, 0, width, height);
  // pop();
}



// // ===============================
// // PLAYER SYSTEM
// // ===============================
// const GRAVITY = 0.05;
// const DRAG_COEFFICIENT = 0.12;
// const BUOYANCY = -0.04;
// const STOPPING_THRESHOLD = 0.02;

// class Player {
//   constructor(x, y) {
//     this.position = createVector(x, y);
//     this.velocity = createVector(0, 0);
//     this.acceleration = createVector(0, 0);
//     this.bagWeight = 0;
//     this.baseMass = 20;
//     this.totalMass = this.baseMass + this.bagWeight;
//     this.maxOxygen = 60;
//     this.currentOxygen = this.maxOxygen;
//     this.oxygenRateIdle = 0.5;
//     this.oxygenRateSwim = 1.0;
//     this.oxygenRateSprint = 1.5;
//     this.oxygenRateAim = 1.25;
//     this.isThrusting = false;
//     this.isSprinting = false;
//     this.isAiming = false;
//     this.thrustForce = 2.5;
//     this.sprintMultiplier = 1.5;
//     this.radius = 20;
//   }

//   applyForce(force) {
//     let f = force.copy();
//     f.div(this.totalMass);
//     this.acceleration.add(f);
//   }

//   update() {
//     let dt = deltaTime / 1000;
//     if (this.isSprinting && this.isThrusting)
//       this.currentOxygen -= this.oxygenRateSprint * dt;
//     else if (this.isThrusting)
//       this.currentOxygen -= this.oxygenRateSwim * dt;
//     else if (this.isAiming)
//       this.currentOxygen -= this.oxygenRateAim * dt;
//     else this.currentOxygen -= this.oxygenRateIdle * dt;
//     this.currentOxygen = constrain(this.currentOxygen, 0, this.maxOxygen);

//     this.totalMass = this.baseMass + this.bagWeight;
//     let gravity = createVector(0, GRAVITY);
//     gravity.mult(this.totalMass);
//     this.applyForce(gravity);

//     let buoyancy = createVector(0, BUOYANCY);
//     buoyancy.mult(this.totalMass);
//     this.applyForce(buoyancy);

//     let speed = this.velocity.mag();
//     if (speed > 0) {
//       let dragMagnitude = speed * speed * DRAG_COEFFICIENT;
//       let drag = this.velocity.copy();
//       drag.mult(-1);
//       drag.normalize();
//       drag.mult(dragMagnitude);
//       this.applyForce(drag);
//     }

//     this.velocity.add(this.acceleration);
//     this.position.add(this.velocity);
//     this.acceleration.mult(0);
//     if (!this.isThrusting && this.velocity.mag() < STOPPING_THRESHOLD)
//       this.velocity.mult(0);

//     cameraOffset = this.position.x;
//   }

//   handleInput() {
//     let thrust = createVector(0, 0);
//     this.isThrusting = false;
//     this.isSprinting = false;
//     if (keyIsDown(16)) this.isSprinting = true;
//     if (keyIsDown(65)) { thrust.x = -1; this.isThrusting = true; }
//     if (keyIsDown(68)) { thrust.x = 1; this.isThrusting = true; }
//     if (keyIsDown(87)) { thrust.y = -1; this.isThrusting = true; }
//     if (keyIsDown(83)) { thrust.y = 1; this.isThrusting = true; }
//     let currentThrust = this.thrustForce;
//     if (this.isSprinting && this.isThrusting)
//       currentThrust *= this.sprintMultiplier;
//     thrust.normalize();
//     thrust.mult(currentThrust);
//     this.applyForce(thrust);
//   }

//   checkEdges() {
//     this.position.x = constrain(this.position.x, -4000, 3000);
//     this.position.y = constrain(this.position.y, 0, maxDepth);
//   }

//   display() {
//     fill(255, 230, 0);
//     ellipse(this.position.x, this.position.y, this.radius * 2);
//   }
// }

// ===============================
// INPUT HANDLING FOR INVENTORY
// ===============================
function mousePressed() {
  if (inventory) inventory.handleClick(mouseX, mouseY);
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
