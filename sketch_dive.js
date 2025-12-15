// ===============================
// OCEAN + FISH SYSTEM
// ===============================

// get game data from localStorage
let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  day: 1,
  coins: 100,
  inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}],
  weapons: {'SpearGun': 1}, // for test
  equippedFirearm: null
};

// Oxygen warning
let showOxygenWarning = true;

// out of oxygen system
let isPlayerDrowning = false; // Whether the player is currently drowning
let drownFadeAlpha = 0; // The transparency of the dark secret
let drownTimer = 2.0; // seconds until change to boat page


//Rocks background 
let rockBG;
let rockBGs = [];
const ROCK_SPACING =  800; 
let rockPlacements = [];

let farRockBGs = [];
let farRockPlacements = [];
const FAR_ROCK_SPACING = 900;

let vegImages = [];
let vegPlacements = [];

const VEG_SPACING = 100;    
const VEG_BASE_DEPTH = 0.75; 


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

//DAY 1 TUTORIAL
let showTutorial = false;
 // 0 = weapons, 1 = aim, 2 = inventory, 3 = oxygen
let tutorialStep = 0;      
let tutorialClickToAdvance = true;

//menu pop up 
let showMenuPopup = false;
let menuPopupImg;

//
let showMenuItems = false;
let menuItemsImg; 

//instructions pop up 
let showInstructionsPopup = false;
let showInstructionsImg;

//SOUNDS
//mbackground music
let bgMusic;
let fishAim;
let fishDead;
let oxygenSound; 
let drownSound;
let fireSound;
let knifeSound;
let retrieveSound;
let openBoxSound;
let dryFireSound;
let equipSound;
let reloadSound;

const weaponConfig = {
  "Knife": {
    type: "MELEE",
    damage: 3,
    range: 130,  // Melee range
    attackTime: 0.2, // Duration of attack determination
    cooldown: 0.5 // Attack cooldown
  },
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
    range: 500,
    maxAmmo: 10 // use for ammo box
  },
  "Netgun": {
    type: "CATCH",
    damage: 0,
    projectileSpeed: 8,
    range: 350,
    effectRadius: 120, // radius of net
    entangleDuration: 1.5, // stun duration in seconds
    maxAmmo: 5  // use for ammo box
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

  //loading abckground sound
  bgMusic = loadSound('sounds/diving/underwater.wav');
  fishAim = loadSound('sounds/diving/fish_aim.wav');
  fishDead = loadSound('sounds/diving/fish_dead.mp3');
  oxygenSound = loadSound('sounds/diving/fish_shot2.wav'); 
  drownSound = loadSound('sounds/diving/out_of_oxygen.mp3');
  fireSound = loadSound('sounds/diving/fire.mp3');
  knifeSound = loadSound('sounds/diving/knife.mp3');
  retrieveSound = loadSound('sounds/diving/retrieve_harpoon.mp3');
  openBoxSound = loadSound('sounds/diving/open_box.mp3');
  dryFireSound = loadSound('sounds/diving/dry_fire.mp3');
  equipSound = loadSound('sounds/startandboat/equip.mp3');
  reloadSound = loadSound('sounds/diving/reload.mp3');

  //rocks
  rockBG = loadImage("images/rocks/rocks.png");
  rockBGs.push(loadImage("images/rocks/rocks1.png"));
  rockBGs.push(loadImage("images/rocks/rocks2.png"));
  rockBGs.push(loadImage("images/rocks/rocks3.png"));

  farRockBGs.push(loadImage("images/rocks/far-rocks.png"));
  farRockBGs.push(loadImage("images/rocks/far-rocks2.png"));
  farRockBGs.push(loadImage("images/rocks/far-rocks3.png"));

  //vegetation
  vegImages.push(loadImage("images/rocks/plant1.png"));
  vegImages.push(loadImage("images/rocks/plant2.png"));
  vegImages.push(loadImage("images/rocks/plant3.png"));


  

  backpackIconImg = loadImage("images/bag/BagUI.png");
  boxImages.oxygen = loadImage("images/oxyg.png");
  boxImages.ammo = loadImage("images/ammo_box.png");
  boxImages.weapon_open = loadImage("images/weapon_box_open.png");
  boxImages.weapon_close = loadImage("images/weapon_box_close.png");

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

  diverImgs.bagWarning = loadImage("images/bag/BagWarning.png");
  diverImgs.bagFull = loadImage("images/bag/BagFull.png");

  // load weapon images
  weaponImages.Knife = loadImage("images/weapons/Knife.png");
  weaponImages.Harpoon = loadImage("images/weapons/Harpoon.png");
  weaponImages.HarpoonHead = loadImage("images/weapons/HarpoonHead.png");
  weaponImages.SpearGun = loadImage("images/weapons/SpearGun.png");
  weaponImages.SpearProjectile = loadImage("images/weapons/SpearProjectile.png");
  weaponImages.Netgun = loadImage("images/weapons/Netgun.png");
  weaponImages.NetProjectile = loadImage("images/weapons/NetProjectile.png");
  weaponImages.NetDeployed = loadImage("images/weapons/NetDeployed.png");
  weaponImages.EntangledIcon = loadImage("images/weapons/EntangledIcon.png");
  weaponImages.SpearGun_handbook = loadImage("images/weapons/SpearGun_handbook.png");
  weaponImages.Netgun_handbook = loadImage("images/weapons/Netgun_handbook.png");

  //popup images
  menuPopupImg = loadImage("images/fish/menu.png");
  showInstructionsImg = loadImage("images/fish/instructions2.png");
  menuItemsImg= loadImage("images/fish/menu_items.png");

  
  

}


// ===============================
// SETUP + DRAW LOOP
// ===============================
function setup() {
  let canvas= createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);

  canvas.elt.oncontextmenu = (e) => e.preventDefault(); // disable right click menu
  createOceanGrid();

  //start the audio right away
  userStartAudio().then(() => {
    bgMusic.loop(); 
    bgMusic.setVolume(0.6);
  });

  //tutorial if day1 
  let saved = JSON.parse(localStorage.getItem("gameData"));
  let getDay = saved.day;
  if (getDay === 1){
    showTutorial = true; 
    tutorialStep = 0; 
  }


  //Font
  textFont('Quantico');

  //load upgrades
  let upgrades = saved.upgrades || { AirTank: 1, CargoBox: 1};

  const oxygenLevels = {1: 60, 2: 90, 3: 120}; // can change, keep same in GearMenu.js
  const bagLevels = {1: 6, 2: 8, 3: 10}; // can change, keep same in GearMenu.js

  let currentMaxOxygen = oxygenLevels[upgrades.AirTank] || 60;
  let currentBagCapacity = bagLevels[upgrades.CargoBox] || 6;

  player = new Player(0, 0, diverImgs);
  // set player max oxygen based on upgrade
  player.maxOxygen = currentMaxOxygen;
  player.currentOxygen = player.maxOxygen;

  oceanHeight = GRID_ROWS * CELL_HEIGHT;
  maxDepth = oceanHeight;

  // Use Inventory class from external file
  inventory = new Inventory(currentBagCapacity, backpackIconImg);
  spawnBoxes();

  // Create return button
  returnButton = createButton('Return & Unload Fish onto the Boat');
  returnButton.position(180, 60);
  returnButton.style("font-size", "15px");
  returnButton.style("color", "black");
  returnButton.style("background-color", "#ff532cff");
  returnButton.style("border-radius", "8px");
  returnButton.style("cursor", "pointer");
  returnButton.style("font-family", "Quantico, sans-serif");
  returnButton.position(width/2 - 135, 80); // Center top
  returnButton.mousePressed(returnToBoat);
  returnButton.hide();

  generateRockPlacements();
  generateFarRockPlacements();
  generateVegPlacements();
  




}

function draw() {

 

  // if oxygen is 0
  if (isPlayerDrowning) {
    drawDrownFade();
    return; // skip rest of draw
  }

  background(0);
  drawOceanGradient();
  // drawParallaxBackground();
  drawFarRockParallax();  
  drawRockParallax();
  drawVegetationParallax();


  player.encumbranceFactor = inventory.outOfCapacity(); // update encumbrance factor

  player.handleInput();
  player.update();

  // check oxygen
  if ( !showTutorial && player.currentOxygen <= 0) {

    // play drown sound
    if (drownSound && !drownSound.isPlaying()) {
      drownSound.play();
    }

    // first time drowning
    if (!isPlayerDrowning) {

      // drop weapons logic
      let savedData = JSON.parse(localStorage.getItem('gameData'));
      if (savedData && savedData.equippedFirearm) {
        let weaponName = savedData.equippedFirearm;

        console.log(`Lost 1 ${weaponName}. Remaining: ${savedData.weapons[weaponName]}`);

        savedData.equippedFirearm = null;

        // save back to localStorage
        localStorage.setItem('gameData', JSON.stringify(savedData));
      }


    }

    // set drowning state
    isPlayerDrowning = true;
    drownFadeAlpha = 0;
    drownTimer = 2.0;

    // lost all fish in inventory
    inventory.items = [];

    // stop background music
    if (bgMusic.isPlaying()) {
      bgMusic.stop();
    }

    // start drown fade
    drawDrownFade();
    return; // skip rest of draw
  }
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

  // Draw boxes
  for (let i = activeBoxes.length - 1; i >= 0; i--) {
    let box = activeBoxes[i];
    box.display();
    box.checkCollision(player);
    if (box.isCollected) {
      activeBoxes.splice(i, 1);
    }
  }

 
  drawActiveFish();

  drawProjectiles(); // new function to draw projectiles


  player.display();

  // draw UI overlays for boxes
  for (let box of activeBoxes) {
    if (box instanceof InteractableBox) {
      box.displayUiOverlay();
    }
  }

  pop();
  drawDarknessOverlay();

  // Oxygen bar always drawn --> In own layer
  push();
  //not impacted by camera 
  resetMatrix();   
  drawOxygenBar();
  pop();

  // show oxygen warning
  if (player.currentOxygen < player.maxOxygen / 2 && showOxygenWarning) { //gameData.day === 1 && (optional)
    drawOxygenWarning();
  }

  //Draw inventory 
  push();
  resetMatrix();
  inventory.display();
  pop();

  //drawing menu popup
  if (showMenuPopup) {
    drawMenu();
    
  }

  if(showInstructionsPopup){
    drawInstructions();
  }

  if(showMenuItems){
    drawMenuItems(); 

  }

  // draw weapon UI
  push();
  resetMatrix();
  drawWeaponUI();
  pop();


  //MENU
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(
      "Guide",
      width-150, height-50
  );

  //controls 
  text("Controls", width-260, height-50);

  //ITEMS
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
   text(
      "Menu Items",
      width-400, height-50
  );

 
  //showing tutorial - drawn on top of everything
  if(showTutorial){
    drawTutorial(); 
  }

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
  }


function generateRockPlacements() {
  rockPlacements = [];
  let totalWidth = WORLD_WIDTH;

  for (let x = WORLD_START_X; x < WORLD_START_X + totalWidth; x += ROCK_SPACING) {
    let img = random(rockBGs); // choose a random rock formation
    rockPlacements.push({ x, img });
  }
}

function drawRockParallax() {
  push();
  imageMode(CENTER);

  const ROCK_TARGET_HEIGHT = 1500;
  let rockWidth; 
  let rockHeight; 


  // let cameraOffsetY = player.position.y - height / 2;
  let cameraOffsetY = constrain(
    player.position.y - height / 2,
    -20,
    maxDepth - height + 20
  );
  // parallax factor for rocks
  let parallaxFactor = 0.9; 


  for (let rock of rockPlacements) {
    let screenX = (rock.x - cameraOffset) * parallaxFactor + width / 2;
    let screenY = height / 2 - cameraOffsetY * parallaxFactor + 650;

     
  rockWidth = rock.img.width;      
  rockHeight = ROCK_TARGET_HEIGHT;

    // draw only if on screen
    if (screenX > -800 && screenX < width + 800) {
      tint(225, 200);
      image(rock.img, screenX, screenY, rockWidth, rockHeight);
    }
  }

  pop();
}

//FAR ROCKS 
function generateFarRockPlacements() {
  farRockPlacements = [];

  for (
    let x = WORLD_START_X;
    x < WORLD_START_X + WORLD_WIDTH;
    x += FAR_ROCK_SPACING
  ) {
    let img = random(farRockBGs);
    farRockPlacements.push({ x, img });
  }
}

function drawFarRockParallax() {
  push();
  imageMode(CENTER);

  const FAR_ROCK_HEIGHT = 1800;

  let cameraOffsetY = constrain(
    player.position.y - height / 2,
    -50,
    maxDepth - height + 50
  );

  let parallaxFactor = 0.3;    
  let verticalParallax = 0.2;    

  // Much more transparent + bluish
  tint(120, 25);

  for (let rock of farRockPlacements) {
    let screenX =
      (rock.x - cameraOffset) * parallaxFactor + width / 2;

    let screenY =
      height / 2 -
      cameraOffsetY * verticalParallax +
      500; 

    let rockWidth = rock.img.width;

    if (screenX > -1000 && screenX < width + 1000) {
      image(rock.img, screenX, screenY, rockWidth, FAR_ROCK_HEIGHT);
    }
  }

  pop();
}


//VEG
function generateVegPlacements() {
  vegPlacements = [];

  for (let x = WORLD_START_X+900; x < WORLD_START_X + WORLD_WIDTH; x += VEG_SPACING) {
    let img = random(vegImages);

    vegPlacements.push({
      x,
      img,
      swayOffset: random(TWO_PI), 
      scale: random(0.8, 1.2)
    });
  }
}

function drawVegetationParallax() {
  push();
  imageMode(CENTER);
  noStroke();

  const PARALLAX_X = 0.8;  
  const PARALLAX_Y = 0.7;  
  const BASE_Y = height * VEG_BASE_DEPTH;

  let cameraOffsetY = constrain(
    player.position.y - height / 2,
    0,
    maxDepth - height
  );

  for (let veg of vegPlacements) {
    let screenX =
      (veg.x - cameraOffset) * PARALLAX_X + width / 2;

    let screenY =
      BASE_Y + 300 * PARALLAX_Y;

    // subtle sway animation
    let sway =
      sin(frameCount * 0.02 + veg.swayOffset) * 10;

    let w = veg.img.width * veg.scale;
    let h = veg.img.height * veg.scale;

    if (screenX > -w && screenX < width + w) {
      tint(200, 220); 
      image(veg.img, screenX + sway, screenY, w, h);
    }
  }

  pop();
}







//TUTORIAL
function drawTutorial() {

  // console.log("tutorual");

  push();
  resetMatrix();

  if (tutorialStep === 0) {
    // --- STEP 1: Circle Weapons ---
    // Weapons UI is bottom-left area:
    let x = 30; 
    let y = height - 90;
    let w = 60 * 3 + 20; // 3 slots + spacing
    let h = 60;

    // Draw red rectangle around weapons
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    rect(x - 10, y - 10, w + 20, h + 20, 10);

    // Draw text above the rectangle
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(22);
    fill(255, 0, 0);
    text("These are your weapons.\nUse TAB to switch between them.", x, y - 80);
  }

  else if (tutorialStep === 1) {
    // 2 Aim & Shoot 
    fill(255, 0,0);
    text("DOUBLE TAP or RIGHT CLICK on the trackpad to AIM.\nRelease to shoot.",
         width/2 - 250, height/2 - 50);
  }

  else if (tutorialStep === 2) {
    //  3: Inventory 
    let bagX = width - 100;
    let bagY = height - 100;
    let bagSize = 80;

    noFill();
    stroke(255,0,0);
    strokeWeight(4);
    ellipse(bagX + bagSize/2, bagY + bagSize/2, bagSize + 30);

    fill(255, 0,0);
    noStroke();
    text("This is your inventory.\nAll fish you catch appear here.\n You can discard unecessary fish.",
         width - 200, height-200);
  }

   else if (tutorialStep === 3) {
    // 4: Oxygen 
    let oxyX = 20;
    let oxyY = 30;
    let oxyW = 220;
    let oxyH = 28;

    noFill();
    stroke(255,0,0);
    strokeWeight(4);
    rect(oxyX - 10, oxyY - 10, oxyW + 20, oxyH + 20, 6);

    fill(255,0,0);
    noStroke();
    text("This is your oxygen level.\n1) Collect bubbles to stay alive or 2) return to the surface!",
         280, oxyY + 80);
  }

  else if (tutorialStep === 4) {
    // 5
    fill(255, 0,0);
    text("W / A / S / D to swim.",
         width/2 - 250, height/2 - 50);
  }



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
        hasOxygenTank: random(1) < 0.005, // can change: 0.5% chance to have oxygen tank
        hasAmmoBox: random(1) < 0.003, // can change: 0.3% chance to have ammo box
        hasWeaponBox: random(1) < 0.002, // can change: 0.2% chance to have weapon box
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
    else if (proj.type === "DAMAGE") {
      // this is a SpearGun Projectile
      for (let j = activeFish.length - 1; j >= 0; j--) {
        let fish = activeFish[j];
        if (fish.health <= 0) continue; // skip dead fish

        let d = dist(proj.position.x, proj.position.y, fish.x, fish.y);
        if (d < fish.size / 2) {
          // hit!
          fish.takeDamage(proj.damage);
          proj.isActive = false; // spear disappears on hit
          break;
        }
      }
    }

    // will add Netgun logic in future

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
    
  let popupX = width - 420; 
  let popupY = height - 400;

  // semi-transparent background box
  fill(200);
  noStroke();
  

  // draw menu image
  image(menuPopupImg, popupX-50, popupY, 430, 290);

  // optional label
  fill(255);
  textSize(30);
  textAlign(LEFT, TOP);
  text("Fish Guide", popupX-50, popupY - 50);
  pop();
}

function drawInstructions(){
  push();
  resetMatrix();
  imageMode(CORNER);
  
  let popupX = width - 420; 
  let popupY = height - 400;

  // semi-transparent background box
  fill(200);
  noStroke();
  //makes sure doesn't interfere with guide/menu popup 
  if(!showMenuPopup){
    // draw menu image
    image(showInstructionsImg, popupX-50, popupY, 430, 290);
    // optional label
    fill(255);
    textSize(30);
    textAlign(LEFT, TOP);
    text("Controls", popupX-50, popupY - 50);
    pop();
  }

}

function drawMenuItems (){
  push();
  resetMatrix();
  imageMode(CORNER);
  
  let popupX = width - 420; 
  let popupY = height - 400;

  // semi-transparent background box
  fill(200);
  noStroke();
  //makes sure doesn't interfere with guide/menu popup 
  if(!showMenuPopup && !showInstructionsPopup){
    // draw menu image
    image(menuItemsImg, popupX-50, popupY, 430, 290);
    // optional label
    fill(255);
    textSize(30);
    textAlign(LEFT, TOP);
    text("Menu Items", popupX-50, popupY - 50);
    pop();
  }
  
}



// INPUT HANDLING FOR INVENTORY
function mousePressed() {
  // if oxygen is low, show warning
  if (player.currentOxygen < player.maxOxygen / 2 && showOxygenWarning) {  //gameData.day === 1 && (optional)
    showOxygenWarning = false;
    return;
  }

  if (showInstructions) {
    showInstructions = false;
    return; 
  }

  if (showTutorial) {
    //go onto next step 
    tutorialStep++;
    //end the tutorual fully 
    if (tutorialStep > 4) {
      showTutorial = false; 
    }

    return; 
  }

  //MENU/GUIDE/INSTRUCTIONS POP UPS 
  if(isTextClicked("Guide", width-150, height-50, 20, 10) && !showInstructionsPopup && !showMenuItems){
    showMenuPopup = !showMenuPopup;
  }
  else if(isTextClicked("Controls", width-260, height-50, 20, 10) && !showMenuPopup && !showMenuItems){
    showInstructionsPopup = !showInstructionsPopup;
  }
  else if(isTextClicked("Menu Items", width-400, height-50, 20, 10) && !showMenuPopup && !showInstructionsPopup){
    showMenuItems = !showMenuItems;
  }

  // pass mouse event to inventory
  if (inventory) {
    inventory.handleClick(mouseX, mouseY);
    if (inventory.isOpen) return; // If the inventory is opened or just closed, do not trigger the firing.
  }

  // if right now is aiming, OR if using knife, firefire
  if (mouseButton === LEFT && player.currentWeapon === "Knife") {
    player.fire();
    return;
  }
}

function mouseReleased() {
  // if right mouse released, shoot!
  if (mouseButton === RIGHT && player.isAiming) {
    player.fire();
    player.isAiming = false;

    if (fishAim.isPlaying()) {
      fishAim.fade(fishAim.getVolume(), 0, 0.3);
      setTimeout(() => fishAim.stop(), 300);
    }

    player.currentImg = player.diverImgs.still;
  }
}

function isTextClicked(label, x, y, textSizePx = 20, padding = 10) {
  textSize(textSizePx);
  let w = textWidth(label);
  let h = textSizePx;
  return (mouseX > x - w/2 - padding &&
          mouseX < x + w/2 + padding &&
          mouseY > y - h/2 - padding &&
          mouseY < y + h/2 + padding);
}



function keyPressed(event) {
  if (keyCode === ESCAPE && inventory) inventory.toggle();
  if (keyCode === TAB) {
    event.preventDefault(); // prevent default tab behavior
    let ownedWeapons = [];
    for (let weaponName in player.weapons) {
      if (player.weapons[weaponName]) { // check if true (owned)
        ownedWeapons.push(weaponName);
      }
    }

    let currentIndex = ownedWeapons.indexOf(player.currentWeapon);
    let nextIndex = (currentIndex + 1) % ownedWeapons.length;
    player.currentWeapon = ownedWeapons[nextIndex];

    // reset aiming state when switching weapons
    if (player.isAiming) {
      player.isAiming = false;
      if (fishAim.isPlaying()) {
        fishAim.fade(fishAim.getVolume(), 0, 0.3);
        setTimeout(() => fishAim.stop(), 300);
      }
      //player.currentImg = player.diverImgs.still;
    }
  }

  for (let box of activeBoxes) {
    if (box instanceof InteractableBox) {
      box.handleKeyPress(keyCode, player);
    }
  }

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
  if (player.currentOxygen < player.maxOxygen /2) {
    stroke(255, 0, 0); // red border if low oxygen
  }
  else {
    stroke(255);
  }
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

//spawn oxygen/ammo/weapon boxes:
function spawnBoxes() {
  activeBoxes = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      // ~3% chance per grid cell
      let cell = grid[r][c]; // get the cell from the grid
      let x = cell.x + CELL_WIDTH /2;
      let y = cell.y + CELL_HEIGHT / 2;

      // read the data we already saved in createOceanGrid
      if (cell.hasOxygenTank) {
        let oxygenAmount = player.maxOxygen; // can change
        let oBox = new OxygenBox(x, y, oxygenAmount, boxImages.oxygen);
        activeBoxes.push(oBox);
      }
      else if (cell.hasAmmoBox) {
        let aBox = new AmmoBox(x, y, boxImages.ammo);
        activeBoxes.push(aBox);
      }
      else if (cell.hasWeaponBox) {
        let wBox = new WeaponBox(x, y, boxImages.weapon_close, boxImages.weapon_open);
        activeBoxes.push(wBox);
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
    displayMeleeImg = weaponImages.Knife;
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
    displayFirearmImg = weaponImages.SpearGun;
  } else if (player.weapons["Netgun"]) {
    firearm = "Netgun";
    displayFirearmImg = weaponImages.Netgun;
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

  // Slot 1: melee
  let slot1X = startX;
  fill(0,50);
  stroke(255,150);

  if (player.currentWeapon === meleeWeapon) {
    stroke(highlightColor);
    strokeWeight(2); // thicker border for highlight
  }
  else {
    strokeWeight(1);
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
  else {
    strokeWeight(1);
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
  else {
    strokeWeight(1);
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

  // draw ammo count for firearm
  if (firearm !== "None") {
      let ammoCount = player.ammo[firearm];
      // if ammo is infinity, show ∞, otherwise show the number
      let ammoText = (ammoCount === Infinity || ammoCount === undefined) ? "∞" : ammoCount;

      fill(255);
      noStroke();
      textAlign(RIGHT, BOTTOM);
      textSize(14);
      textStyle(BOLD);
      text(ammoText, slot3X + slotSize - 5, startY + slotSize - 5);
      textStyle(NORMAL);
  }
  
  pop();
}

// draw oxygen warning
function drawOxygenWarning() {
  push();
  resetMatrix();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  // draw a black background box
  fill(0, 180);
  noStroke();
  rect(width / 2, height / 2, width * 0.7, 200, 10);

  // draw the warning text
  fill(255, 50, 50);
  textSize(24);
  text(
    "Warning: Low Oxygen!\n\n" +
    "Return to the surface or touch bubbles to get oxygen.\n" +
    "If your oxygen reaches 0, you will lose all your ingredients.\n\n" +
    "Click anywhere to hide this message",
    width / 2, 
    height / 2
  );

  pop();
}

function drawDrownFade() {
  let dt = deltaTime / 1000; // convert to seconds

  if (drownFadeAlpha < 255) {
    drownFadeAlpha += 150 * dt; // almost 1.7 seconds to full fade
    drownFadeAlpha = constrain(drownFadeAlpha, 0, 255);
  }
  else {
    drownTimer -= dt;
    if (drownTimer <= 0) {
      // go back to boat scene
      returnToBoat();
    }
  }

  push();
  resetMatrix();

  // draw black overlay with increasing alpha
  fill(0, drownFadeAlpha);
  noStroke();
  rect(0, 0, width, height);

  // start drowning text after half fade
  if (drownFadeAlpha >= 100) {
    let textAlpha = map(drownFadeAlpha, 100, 255, 0, 255);
    fill(255, 0, 0, textAlpha);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("You have run out of oxygen and lost your catch...", width / 2, height / 2);
  }

  pop();

}

function returnToBoat() {

  // get data again （just in case)
  let gameData = JSON.parse(localStorage.getItem("gameData")) || {
    day: 1,
    coins: 100,
    inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}],
    weapons: {'SpearGun': 1},
    equippedFirearm: null
  };

  // put firearm back to inventory
  if (gameData.equippedFirearm) {
    let firearm = gameData.equippedFirearm;

    // prevent we have the data in localStorage
    if (!gameData.weapons) gameData.weapons = {};
    if (!gameData.weapons[firearm]) gameData.weapons[firearm] = 0;

    gameData.weapons[firearm] += 1; // put back to inventory

    console.log(`Returning firearm ${gameData.equippedFirearm}. Total now: ${gameData.weapons[firearm]}`); // for debug
    gameData.equippedFirearm = null;
  }

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
        existingStack.quantity += 1;
        fishStacked += 1; // for debug: count of fish stacked
      }
      else {
        // add new entry
        let newItem = {
          name: targetName,
          freshness: targetFreshness,
          quantity: 1,
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

