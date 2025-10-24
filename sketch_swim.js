let player;

function setup() {
    createCanvas(800, 600);
    player = new Player(width/2, height/2);

}

function draw() {
    background(51, 153, 255);

    player.handleInput();
    player.update();
    player.checkEdges();
    player.display();

    // UI
    fill(255);
    noStroke();
    textSize(14);
    text(`Inventory Weight: ${player.bagWeight.toFixed(2)}`, 10, 20);
    text(`Total Mass: ${player.totalMass.toFixed(2)}`, 10, 40);
    text(`Velocity: ${player.velocity.mag().toFixed(2)}`, 10, 60);
    text(`Acceleration: ${player.acceleration.mag().toFixed(2)}`, 10, 80);

}

// test the weight
function keyPressed() {
    if (keyIsDown(187)) { // "+"
        player.bagWeight +=5;
    }
    if (keyIsDown(189)) { // "-"
        player.bagWeight = max(0, player.bagWeight - 5);
    }
}


/*
//MAP GENERATION PART: uncomment when putting together
// Grid and ocean settings
const GRID_ROWS = 30; // vertical zones (depth)
const GRID_COLS = 10; // horizontal width
const CELL_HEIGHT = 50;
const CELL_WIDTH = 80;
//holding the rows
let grid = [];
//This will hold all the fish that will be moving on and off the screen
let activeFish = [];

let player;
let maxDepth;
let oceanHeight;

// Fish pools by depth zone
const fishPools = {
  shallow: ["Mackerel", "Sardine"],
  medium: ["Salmon", "Yellowtail", "Scallop", "Mackerel", "Sardine"],
  deep: ["Bluefin Tuna", "Eel", "Sea Urchin"]
};

function setup() {
  createCanvas(800, 600);

  createOceanGrid(); 


  // initialize simple player so other functions (if re-enabled) won't crash
  player = {
    x: width / 2,
    y: 0,
    speed: 5,
    oxygen: 100
  };
  oceanHeight = GRID_ROWS * CELL_HEIGHT;
  maxDepth = oceanHeight;
  
}

function draw() {
  background(0);
  drawOceanGradient();
  movePlayer();

// Animate the fish
  updateActiveFish();

  push();
  translate(0, -player.y + height / 2); // follow player
  //have the fish show up 
  drawActiveFish();
  drawPlayer();
  pop();

  drawDarknessOverlay();
  drawBars();
}


// === CREATE OCEAN GRID ===
function createOceanGrid() {
  grid = [];
  //get the grid rows --> "shallower rows -- row 10 and below"
  for (let r = 0; r < GRID_ROWS; r++) {
    let depthLevel;
    if (r < 10) depthLevel = "shallow";
    else if (r < 20) depthLevel = "medium";
    else depthLevel = "deep";

    //each row will --> have a depth level, fish type, and (right now)
    //if has oxygen tank or not -- we may want to rethink this though
    let row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        x: c * CELL_WIDTH,
        y: r * CELL_HEIGHT,
        depth: depthLevel,
        fish: generateFish(depthLevel),
        hasOxygenTank: random(1) < 0.03
      });
    }
    grid.push(row);
  }
}

//when the player starts to dive 
//need to adjust this so thatit starts from the very top of the screen 
function startNewDive() {
  createOceanGrid();
  player.y = 0;
  player.oxygen = 100;
}

// Gradient Background
function drawOceanGradient() {

    //interpolation --> gradient 
  for (let y = 0; y < height; y++) {
    //inter --> how far we are 
    //if inter = 0 = lightest blue, if 1: dark navy, if 0.5: a mix of both
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color('#5ac8fa'), color('#001f3f'), inter);
    //color of the line to the current blended color.
    stroke(c);
    //a horiz. line all the way across the canvas.
    line(0, y, width, y);
  }
}

// Drawing the cells 
// drawGrid() is now unused for fish, but still used for oxygen tanks if needed
function drawGrid() {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      let cell = grid[r][c];
      let x = cell.x;
      let y = cell.y;


      // Oxygen tank placeholder
      if (cell.hasOxygenTank && !cell.fish) {
        fill(200, 200, 255);
        rect(x + CELL_WIDTH / 2 - 5, y + CELL_HEIGHT / 2 - 10, 10, 20);
      }
    }
  }
}


//ACTIVE FISH LOGIC 
//The fish will be moving
function updateActiveFish() {
  // Move fish and remove if off-screen
  for (let i = activeFish.length - 1; i >= 0; i--) {
    let fish = activeFish[i];
    //fish direction: can be 1 (move right) and -1 (moving left)
    fish.x += fish.speed * fish.dir;
    // Remove if off left/right
    //if the fish's x position foes off the left or right edge
    //of screen--> remove this fish from the arr
    if (fish.x < -100 || fish.x > width + 100) {
      activeFish.splice(i, 1);
    }
  }
  // Randomly spawn new fish - 3% chance 
  if (random(1) < 0.03) { // ~3% chance per frame
    spawnFish();
  }
}

function spawnFish() {
  // Pick the 
  let r = floor(random(GRID_ROWS));
  let depthLevel;
  if (r < 10) depthLevel = "shallow";
  else if (r < 20) depthLevel = "medium";
  else depthLevel = "deep";
  let fishType = random(fishPools[depthLevel]);
  // Random direction
  let dir = random([1, -1]);
  let speed = random(1, 3);
  let y = r * CELL_HEIGHT + CELL_HEIGHT / 2;
  let x = dir === 1 ? -50 : width + 50;
  activeFish.push({ x, y, type: fishType, dir, speed });
}

function drawActiveFish() {
  for (let fish of activeFish) {
    // Color/shape by type

    //shallow fish
    if (fish.type == "Mackerel") {
      fill("red"); ellipse(fish.x, fish.y, 50, 10);
    } else if (fish.type == "Sardine") {
      fill("white"); ellipse(fish.x, fish.y, 20, 10);
    } 

    //medium fish 
    else if (fish.type == "Salmon") {
      fill("pink"); ellipse(fish.x, fish.y, 50, 30);
    } else if (fish.type == "Yellowtail") {
      fill("yellow"); ellipse(fish.x, fish.y, 40, 60);
    } else if (fish.type == "Scallop") {
      fill("black"); ellipse(fish.x, fish.y, 20, 20);

    //deep water fish
    } else if (fish.type == "Bluefin Tuna") {
      fill("blue"); ellipse(fish.x, fish.y, 40, 40);
    } else if (fish.type == "Eel") {
      fill("black"); ellipse(fish.x, fish.y, 70, 10);
    } else {
      //urchin 
      fill("purple"); ellipse(fish.x, fish.y, 10, 10);
    }
  }
}

// PLAYER Shape -- Replace with images -->GET CHAR SPRITES 
function drawPlayer() {
  fill(255, 230, 0);
  rect(player.x - 10, player.y - 10, 20, 20);
}

//PLAYER MOV
function movePlayer() {
  if (keyIsDown(LEFT_ARROW)) player.x -= player.speed;
  if (keyIsDown(RIGHT_ARROW)) player.x += player.speed;
  if (keyIsDown(UP_ARROW)) player.y -= player.speed;
  if (keyIsDown(DOWN_ARROW)) player.y += player.speed;

  player.x = constrain(player.x, 0, width);
  //instead of maxDepth --> till end of the screen
  player.y = constrain(player.y, 0, maxDepth);
}

//DARKNESS EFFECT
function drawDarknessOverlay() {
  let alpha = map(player.y, 0, maxDepth, 0, 150);
  fill(0, 0, 50, alpha);
  noStroke();
  rect(0, 0, width, height);
}

//Oxygen Bar + Depth bar - need to add oxygen
function drawBars() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Depth: ${int(player.y)} ft`, 10, 10);

  fill(100, 200, 255);
  rect(10, 30, player.oxygen * 2, 15);
  noFill();
  stroke(255);
  rect(10, 30, 200, 15);
  noStroke();
}

//GENERATE --> fish by their depth (shallow, medium, deep)
function generateFish(depth) {
  if (random(1) < 0.4) {
    let fishList = fishPools[depth];
    let fishType = random(fishList);
    return fishType;
  }
  return null;
}

*/