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

//mbackground music
let bgMusic;

let boat;
let boatImg; 
let character;
let coinIcon; 

let diveButton;
let restaurantButton; 
let homeButton; 
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



let bgSpeed=1, fgSpeed=0.8, mgSpeed=0; 

let gearMenu;
let gearButton;
let weaponIcons = {};
let upgradeIcons = {};

let preDiveMenu;


function preload(){

    //loading abckground sound
    bgMusic = loadSound('sounds/startandboat/background.wav');

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
    if (numDives >= 2) {
      //Reached the maximum amount of dives for the day 
      //**could change this to a text box later */
      alert("You've reached the maximum of 2 dives today! Visit the restaurant to end the day.");
      return; 
    }

    // open pre-dive menu
    if (!fading && !showInstructions) {
      preDiveMenu.toggle();
    }
  });
  
  // Position button at the ladder
  updateDiveButtonPosition();

  // //window.location.href = "dive.html";
  // diveButton.mousePressed(() => {
  // // navigate back to restaurant screen
  //   window.location.href = "dive.html";
  // });

  // create gear button
  gearButton = createButton('SELECT GEAR');
  // gearButton = createButton("DIVER'S GEAR");
  gearButton.size(140, 50);
  gearButton.style("font-size", "14px");
  gearButton.style("color", "#bddcfdff");
  gearButton.style("background-color", "#084387ff"); 
  gearButton.style("border-radius", "8px");
  gearButton.style("cursor", "pointer");
  gearButton.style("font-family", "Quantico, sans-serif");
  gearButton.position(width/2 - 70, height/2 + 80); // below dive button
  gearButton.mousePressed(() => {
    if (!fading && !showInstructions) {
      toggleGearMenu();
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
  restaurantButton.position(width/2-400, height/2);
  // restaurantButton.mousePressed(startDive);
  restaurantButton.mousePressed(() => {
    // reset dive counter for new session
    sessionStorage.setItem("numDives", 0);
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
  gameData = JSON.parse(localStorage.getItem('gameData')); // refresh game data
  updateButtonVisibility();
}

// Update button visibility based on gear menu state
function updateButtonVisibility() {
  if (gearMenu.isVisible || preDiveMenu.isVisible) {
    diveButton.hide();
    restaurantButton.hide();
    gearButton.hide();
  } else {
    diveButton.show();
    restaurantButton.show();
    gearButton.show();
  }
}

function draw() {
  if (!isUnderwater) {
    drawSurfaceScene();
    drawMoneyAndDay();

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
      "Dive up to TWO times per day\n and your catches will automatically save after every \ndive.\n\n" +
      "Upgrade and equip your tools to catch more fish\n" +
      "Visit the restaurant once you’re done diving!\n",
      width/2-350, height/2+20
    );
  }

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
  let restaurantButtonY = height / 2; 
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


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDiveButtonPosition(); 
  updateRestaurantButtonPosition();
  updateGearButtonPosition(); 
}

function mousePressed(){
  if (showInstructions) {
    showInstructions = false; 
    return;
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
  text('$' + gameData.coins, 70, 100);
  
  // Day indicator
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(20);
  text('Day ' + gameData.day, 30, 140);
  
  pop();
}





