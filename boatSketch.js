let gameData = JSON.parse(localStorage.getItem("gameData"));
if (!gameData) {
  gameData = {
    day: 1,
    coins: 100,
    inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}],
    weapons: {},
    discoveredWeapons: [],
    equippedFirearm: null,
    upgrades: {AirTank: 1, CargoBox: 1}
  };
  localStorage.setItem("gameData", JSON.stringify(gameData));
  console.log("Initialized gameData in localStorage.");
}
else {
  if (!gameData.discoveredWeapons) {
    gameData.discoveredWeapons = ['Netgun'];
    localStorage.setItem('gameData', JSON.stringify(gameData));
  }
}

//
let isGameOver = false;
let gameOverAlpha = 0;

//mbackground music
let bgMusic;
let upgradeSound; // sound when purchasing upgrade
let buySound; // sound when purchasing weapon
let equipSound; // sound when equipping weapon
let noMoneySound; // sound when not enough money

let boat;
let boatImg; 
let character;
let coinIcon; 

let diveButton;
let restaurantButton; 
let homeButton; 
let inventoryButton;
// let unloadButton; 

let numDives = parseInt(sessionStorage.getItem("numDives")) || 0; // load from session or start at 0 
let isUnderwater = false;
let yoff = 0;
let isDiving = false;
let diveY = 0;

let diveVelocity = 0;


//parallax
let bgImg, fgImg, mgImg; 
let bgX1 = 0; 
let bgX2; 
let fgX1 = 0; 
let fgX2; 
let mgX1 = 0; 
let mgX2; 


//For transition screen
let alpha = 0;
let fading = false;
let nextPage = "";

//instructions
let showInstructions = true;
let instructionBoxAlpha = 220;

//coins 
let coins = gameData.coins;
let maintenanceCharged = JSON.parse(sessionStorage.getItem("maintenanceCharged")) || false;

//fee pop up 
let feePopupAlpha = 0;
let showFeePopup = false;
let feePopupTimer = 0;



let bgSpeed=1, fgSpeed=0.8, mgSpeed=0; 

let gearMenu;
let gearButton;
let weaponIcons = {};
let upgradeIcons = {};

let preDiveMenu;

//inventory menu 
let boatInventoryMenu;
window.fishImages = {};


function preload(){

    //loading abckground sound
    bgMusic = loadSound('sounds/startandboat/background.wav');

    // upgrade sound
    upgradeSound = loadSound('sounds/startandboat/upgrade.mp3');
    // buy weapon sound
    buySound = loadSound('sounds/restaurant/coin.mp3');
    // equip weapon sound
    equipSound = loadSound('sounds/startandboat/equip.mp3');
    // no money sound
    noMoneySound = loadSound('sounds/startandboat/no_money.mp3');

    // bgImg = loadImage("images/sky.png");
    bgImg = loadImage("images/sky1.png");
    mgImg = loadImage("images/cliffs.png");
    fgImg = loadImage("images/clouds.png");

    boatImg = loadImage("images/boat.png");
    coinIcon = loadImage('images/restaurant/decorations/coin.png'); // add coin icon image

    //load weapon icons
    weaponIcons["SpearGun"] = loadImage("images/weapons/SpearGun_handbook.png");
    weaponIcons["Netgun"] = loadImage("images/weapons/Netgun_handbook.png");

    weaponIcons["Harpoon"] = loadImage("images/weapons/Harpoon.png");
    weaponIcons["Knife"] = loadImage("images/weapons/Knife.png");

    // upgrade icons
    upgradeIcons["AirTank"] = loadImage("images/upgrade/AirTank.png");
    upgradeIcons["CargoBox"] = loadImage("images/upgrade/CargoBox.png");

    fishImages["Mackerel"] = loadImage("images/fish/Mackerel_R.gif");
    fishImages["Sardine"] = loadImage("images/fish/Sardine_R.gif");
    fishImages["Bluefin-Tuna"] = loadImage("images/fish/Bluefin-Tuna_R.gif");
    fishImages["Eel"] = loadImage("images/fish/Eel_R.gif");
    fishImages["Salmon"] = loadImage("images/fish/Salmon_R.gif");
    fishImages["Scallop"] = loadImage("images/fish/Scallop_R.gif");
    fishImages["Sea-Urchin"] = loadImage("images/fish/Sea-Urchin_R.gif");
    fishImages["Yellowtail"] = loadImage("images/fish/Yellowtail_R.gif");


}

function setup() {
  // let cnv = createCanvas(1400,800);
  // cnv.parent(document.body);
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body);

  //start the audio right away
  userStartAudio().then(() => {
    bgMusic.loop(); 
    bgMusic.setVolume(0.6);
  });

  // initialize weapon menu
  let allMenuIcons = {...weaponIcons, ...upgradeIcons};
  gearMenu = new GearMenu(allMenuIcons);
  preDiveMenu = new PreDiveMenu(allMenuIcons);
  boatInventoryMenu = new BoatInventoryMenu();
  

  //parallax
  bgX2 = fgX2 = mgX2 = width;
  
  // Create boat object
  boat = {
    x: width / 2,
    y: height / 2 - 30,
    width: 80,
    height: 40
  };
  // Character starts on the boat
  character = {
    size: 32,
    x: boat.x,
    y: 0 
  };


  //FEE PER DAY 
  if(numDives === 0 && !maintenanceCharged){
    gameData.coins -= 30; 
    localStorage.setItem("gameData", JSON.stringify(gameData)); 
    maintenanceCharged = true; 
    sessionStorage.setItem("maintenanceCharged", JSON.stringify(maintenanceCharged));

    //show the pop up 
    showFeePopup = true;
    feePopupAlpha = 255;
    //start timer 
    feePopupTimer = millis(); 
  }


  // Create dive button
  diveButton = createButton('DIVE');
  diveButton.size(80, 40);
  
  diveButton.style("font-size", "15px");
  diveButton.style("color", "#bddcfdff");
  diveButton.style("background-color", "#084387ff");
  diveButton.style("border-radius", "8px");
  diveButton.style("cursor", "pointer");
  diveButton.style("font-family", "Quantico, sans-serif");
  diveButton.style("position", "fixed");

  //DIVE ACTION
  diveButton.mousePressed(() => {
    // prevent diving if gear menu is open
    if (gearMenu.isVisible) return;
    if (numDives >= 3) {
      //Reached the maximum amount of dives for the day 
      //**could change this to a text box later */
      alert("You've reached the maximum of 3 dives today! Visit the restaurant to end the day.");
      return; 
    }

    // open pre-dive menu
    if (!fading && !showInstructions) {
      preDiveMenu.toggle();
    }
  });
  
  // Position button at the ladder
  updateDiveButtonPosition();

  
  // create gear button
  gearButton = createButton('SHOP');
  // gearButton = createButton("DIVER'S GEAR");
  gearButton.size(100, 40);
  gearButton.style("font-size", "14px");
  gearButton.style("color", "#bddcfdff");
  gearButton.style("background-color", "#084387ff"); 
  gearButton.style("border-radius", "8px");
  gearButton.style("cursor", "pointer");
  gearButton.style("font-family", "Quantico, sans-serif");
  gearButton.position(width/2 - 70, height/2 + 80); 

  gearButton.mousePressed(() => {
    if (!fading && !showInstructions) {
      toggleGearMenu();
    }
  });

  // INVENTORY BUTTON
  inventoryButton = createButton('INVENTORY');
  inventoryButton.size(100, 40);
  inventoryButton.style("font-size", "14px");
  inventoryButton.style("color", "#bddcfdff");
  inventoryButton.style("background-color", "#084387ff");
  inventoryButton.style("border-radius", "8px");
  inventoryButton.style("cursor", "pointer");
  inventoryButton.style("font-family", "Quantico, sans-serif");

  // position 
  inventoryButton.position(width/2 + 60, height/2 + 80);

  inventoryButton.mousePressed(() => {
    if (!fading && !showInstructions) {
      boatInventoryMenu.toggle();
    }
  });

   
    // Create restuarant button
  restaurantButton = createButton('END DAY & GO TO THE RESTAURANT');
  restaurantButton.size(180, 60);
  restaurantButton.style("font-size", "15px");
  restaurantButton.style("color", "#bddcfdff");
  restaurantButton.style("background-color", "#084387ff");
  restaurantButton.style("border-radius", "8px");
  restaurantButton.style("cursor", "pointer");
  restaurantButton.style("font-family", "Quantico, sans-serif");
  // restaurantButton.position(width/2, height/2);
  // /2+50 and /2 
  restaurantButton.position(width/2-400, height/2+80);
  
  // restaurantButton.mousePressed(startDive);
  restaurantButton.mousePressed(() => {
    // reset dive counter for new session
    sessionStorage.setItem("numDives", 0);
    //reset maintenance charge for new day
    sessionStorage.setItem("maintenanceCharged", false);
    maintenanceCharged = false;
    numDives = 0;
    if (!gearMenu.isVisible) { 
      // prevent going to restaurant if gear menu is open
      nextPage = "sushi_bar.html";
      fading = true;
    }
  });

  // restaurantButton.mousePressed(() => {
  // // navigate back to restaurant screen
  //   window.location.href = "sushi_bar.html";
  // });

  //home button 
  homeButton = createButton('Save & Exit');
  homeButton.size(100, 30);
  homeButton.style("font-size", "15px");
  homeButton.style("color", "#084387ff");
  homeButton.style("background-color", "#bddcfdff");
  homeButton.style("border-radius", "8px");
  homeButton.style("cursor", "pointer");
  homeButton.style("font-family", "Quantico, sans-serif");
  homeButton.position(30, 30);
  homeButton.mousePressed(() => {
  // navigate back to home screen
    sessionStorage.setItem("numDives", 0);
    numDives = 0;
    window.location.href = "start.html";
  });

  
}

function startActualDive() {
  numDives++; // increment dive counter
  sessionStorage.setItem("numDives", numDives); // persist across page refreshes
  nextPage = "dive.html";
  fading = true;
}

// helpers to toggle gear menu
function toggleGearMenu() {
  gearMenu.toggle();
  updateButtonVisibility();
}

function refreshGameData() {
  gameData = JSON.parse(localStorage.getItem('gameData'));
}

// Update button visibility based on gear menu state
function updateButtonVisibility() {
  if (gearMenu.isVisible || preDiveMenu.isVisible || boatInventoryMenu.isVisible) {
    diveButton.hide();
    restaurantButton.hide();
    gearButton.hide();
    inventoryButton.hide();
  } else {
    //ADD ARROWS HERE
    // drawTriangles(a1,b1,a2,b2,a3,b3)
    diveButton.show();
    restaurantButton.show();
    gearButton.show();
    inventoryButton.show(); 
  }
}

function draw() {
  if (!isUnderwater) {
    drawSurfaceScene();
    drawMoneyAndDay();

    //Check if game is over (coins < 0)
    if (!isGameOver && gameData.coins < 0) {
      isGameOver = true;
      gameOverAlpha = 0;

      // disable all the buttons
      diveButton.hide();
      gearButton.hide();
      restaurantButton.hide();
      homeButton.hide();
    }

    //inventory display
    if(boatInventoryMenu.isVisible){
      boatInventoryMenu.display();
    }

    // draw gear menu if visible
    if (gearMenu.isVisible) {
      gearMenu.display();
    }
    if (preDiveMenu.isVisible) {
      preDiveMenu.display();
    }
    
  } else {
    drawUnderwaterScene();
  }

    if (showInstructions) {
      restaurantButton.hide();
      gearButton.hide();
      diveButton.hide();
      inventoryButton.hide();
    }else{
      updateButtonVisibility();
    }



  //Smooth transition to pages
  if (fading) {
    if (alpha === 0) {
      bgMusic.fade(bgMusic.getVolume(), 0, 0.8); 
    }
    alpha += 3; 
    fill(250, alpha);
    noStroke();
    rect(0, 0, width, height);

    if (alpha >= 255) {
      window.location.href = nextPage;
    }
  }

  //instructions pop up on the screen
  //instructions
  if (showInstructions) {

    // Popup box
    fill(255, instructionBoxAlpha);
    stroke(0);
    strokeWeight(2);
    rectMode(CORNER);
    fill(250);
    const triShift = 45;
    rect(width/2-390, height/2-20, 440, 200, 20);
    triangle(width/2-20 + triShift, height/2+180, width/2-10 + triShift, height/2+200, width/2-30 + triShift, height/2+200);
    
    // Text content
    noStroke();
    textFont("Quantico, sans-serif");
    fill(0);
    textAlign(LEFT);
    textSize(15);
    textStyle(BOLD);
    text(
      "Hey there Dave - ready to fish?\n\n" +
      "Dive up to THREE times per day\nand your catches will automatically save after every \ndive.\n\n" +
      "Upgrade and equip your tools to catch more fish\n" +
      "Visit the restaurant once you’re done diving!\n",
      width/2-350, height/2+20
    );
  }
  //game over if money runs out 
  drawGameOverScreen();
  //draw the fee pop up 
  drawFeePopup();

}


function drawTriangles(a1,b1,a2,b2,a3,b3){
    fill(255); 
    triangle(
    // tip (center of button height)
    width/2 + a1, height/2 + b1, 
    // top 
    width/2 + a2, height/2 + b2,   
    // bottom
    width/2 + a3, height/2 + b3   
);
}


//BUTTONS 
//each will be resized along with the canvas in windowResized()
//DIVE BUTTON 
function updateDiveButtonPosition() {
  // Reposition dive button next to the boat ladder
  // Boat is centered at width/2 with width 450, so right edge is at width/2 + 225
  let boatRightEdge = width / 2 + 225;
  let diveButtonX = boatRightEdge + 20; 
  let diveButtonY = height / 1.2 - 80; 
  
  diveButton.style("left", diveButtonX + "px");
  diveButton.style("top", diveButtonY + "px");
}

//RESTAURANT
function updateRestaurantButtonPosition() {
  // Position restaurant button at bottom center
  let restaurantButtonX = width / 2 - 400; 
  let restaurantButtonY = height / 2 + 80; 
  restaurantButton.style("left", restaurantButtonX + "px");
  restaurantButton.style("top", restaurantButtonY + "px");
}

//DIVING PREP
function updateGearButtonPosition() {
  let gearButtonX = width/2 - 70;
  let gearButtonY = height/2 + 80; 
  gearButton.style("left", gearButtonX + "px");
  gearButton.style("top", gearButtonY + "px");
}

//DIVING PREP
function updateInventoryButton() {
  let inventButtonX = width/2 + 60;
  let inventButtonY = height/2 + 80; 
  inventoryButton.style("left", inventButtonX + "px");
  inventoryButton.style("top", inventButtonY + "px");
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDiveButtonPosition(); 
  updateRestaurantButtonPosition();
  updateGearButtonPosition(); 
  updateInventoryButton();
}

function mousePressed(){
  if (showInstructions) {
    showInstructions = false; 
    return;
  }

  if (boatInventoryMenu.isVisible) {
    let handled = boatInventoryMenu.handleClick(mouseX, mouseY);
    updateButtonVisibility();
    if (handled) return;
  }

  if (gearMenu.isVisible) {
    let handled = gearMenu.handleClick(mouseX, mouseY);

    updateButtonVisibility();
    
    if (handled) return;
  }

  if (preDiveMenu.isVisible) {
    let handled = preDiveMenu.handleClick(mouseX, mouseY);

    updateButtonVisibility();
    
    if (handled) return;
  }
}

function drawSurfaceScene() {
  // Sky
  // background(135, 206, 235);
  image(bgImg, bgX1, 0, width, height);
  //Clouds
  push();
  tint(255, 150);
  image(fgImg, fgX1, 0, width, height);
  image(fgImg, fgX2, 0, width, height);
  fgX1 -= fgSpeed; fgX2 -= fgSpeed;
  if (fgX1 <= -width) fgX1 = fgX2 + width;
  if (fgX2 <= -width) fgX2 = fgX1 + width;
  pop(); 

  //cliffs
  image(mgImg, mgX1, 0, width, height);
  // Draw waves using Perlin noise
  drawWaves();

  // Draw boat and character
  let boatY = drawBoat();
  // drawCharacter(boatY);
}

function drawWaves() {
  fill(60, 204, 250, 255);
  noStroke();
  
  beginShape();
  let xoff = 0; // 2D Perlin noise offset for x
  
  // Create the wave shape using Perlin noise
  //x --> peaks
  for (let x = 0; x <= width + 15; x += 25) {
    // map noise --> smoothed out waves 
    // let y = map(noise(xoff, yoff), 0, 1, height/1.5 - 40, height/1.5 + 40);
    let y = map(noise(xoff, yoff), 0, 1, height/1.2 - 40, height/1.2 + 40);
    vertex(x, y);
    xoff += 0.03;
  }
  // Complete the shape
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
  yoff += 0.004; // Increment y offset for animation
}

function drawBoat() {
  // Calculate the waterline y at the boat's x position using Perlin noise
  //where in the noise pattern the boat is horizontally.
  let xoff = (boat.x / width) * ((width + 10) / 25) * 0.03; 
  //curr wave height 
  //noise number (0–1) into an actual screen Y position = waterline
  //controls how much the boat 'bobs' (increase 40 for more dramatic)
  let waterlineY = map(noise(xoff, yoff), 0, 1, height/1.2 - 40, height/1.2 + 40);
  
  // Boat positioning
  let boatWidth = 450;   // adjust to match your boat image proportions
  let boatHeight = 250;  // adjust for realistic scale
  let boatX = width / 2 - boatWidth / 2;
  //boat sitting on waves 
  let boatY = waterlineY - boatHeight + 45; 

  image(boatImg, boatX, boatY, boatWidth, boatHeight);
  return boatY; // for character placement


}
let gravity = 0.2; 
function drawCharacter(boatY) {
 if (isDiving) {
    diveVelocity += gravity;
    character.y += diveVelocity;
    if (character.y >= height / 1.5 + 40) {
      isUnderwater = true;
      numDives++; 
      isDiving = false;
    }
  } else if (!isUnderwater) {
    character.y = boatY - character.size / 2;
    character.x = width/2-50; 
  }
  fill(255, 100, 100);
  rect(character.x - character.size / 2, character.y, character.size, character.size);
}

function drawUnderwaterScene() {
  background(0, 50, 100);
  fill(255, 100, 100);
  rectMode(CORNER);
}


function drawMoneyAndDay() {
  push();
  textFont('Courier New');
  
  // Coin icon
  imageMode(CORNER);
  image(coinIcon, 20, 80, 40, 40);
  
  // Money amount
  fill(255, 215, 0); // gold color
  stroke(0);
  strokeWeight(3);
  textAlign(LEFT, CENTER);
  textSize(28);
  text('$' + Math.floor(gameData.coins), 70, 100);
  
  // Day indicator
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(20);
  text('Day ' + gameData.day, 30, 140);
  
  pop();
}

//fee charge pop up 
function drawFeePopup() {
  if (!showFeePopup) return;

  // Fade out after a sec 
  if (millis() - feePopupTimer > 1500) {
    //fade out 
    feePopupAlpha -= 4; 
    if (feePopupAlpha <= 0) {
      showFeePopup = false;
      feePopupAlpha = 0;
    }
  }

  push();
  textAlign(CENTER, CENTER);
  textSize(32);
  textFont("Quantico, sans-serif");
  fill(255, 0, 0, feePopupAlpha); 
  noStroke();
  text("-$30 Daily Boat Upkeep", width / 2, 60); 
  pop();
}

//GAME OVER SCREEN POP UP 
function drawGameOverScreen() {
  if (!isGameOver) return;

  // Fade into the GO screen 
  if (gameOverAlpha < 255) {
    gameOverAlpha += 4;
  }

  push();
  // dark overlay
  fill(0, gameOverAlpha * 0.8); 
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textFont("Quantico, sans-serif");
  
  // Main txt
  fill(255, 0, 0, gameOverAlpha);
  textSize(60);
  text("GAME OVER", width / 2, height / 2 - 40);

  // Subtxt
  fill(255, gameOverAlpha);
  textSize(28);
  text("You ran out of money.", width / 2, height / 2 + 20);
  textSize(22);
  text("Returning to Home Screen...", width / 2, height / 2 + 70);

  pop();

  // redirect after a bit of a delay to the home start screen again 
  if (gameOverAlpha >= 255) {
    setTimeout(() => {
      sessionStorage.setItem("numDives", 0);
      sessionStorage.setItem("maintenanceCharged", false);
      window.location.href = "start.html";
    }, 1600);
  }
}





