// sushi_bar.js
// array for icons in the icon bar; icon under mouse; modal that is open; bg images
let icons = [];
let hoveredIcon = null;
let activePopup = null;
let backgroundImage;
let tabletopImage;
let bottomImage;

// local storage
let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  day: 1,
  coins: 100,
  inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}]
};

if  (gameData.inventory && gameData.inventory.length > 1) {
  ingredients = gameData.inventory;
  console.log("Loaded inventory from localStorage:", ingredients);
}
else {
  gameData.inventory = ingredients;
  console.log("None fish in localStorage:", ingredients);
}

// bgm and sound effects
let bgMusic;
let musicStarted = false;
let walkSound;
let eatSound;
let errorSound;
let failSound;
let coinSound;
let placeSound;
let cookSound;
let toggleSound;

// drag state for ingredient
let draggedIngredient = null;

// array for slots on table
let tablePositions = [];
let MAX_TABLE_POSITIONS = 6;

// scrolling for panels / lists
let scrollOffset = 0;
let maxScroll = 0;

// variables for plate, tray, and cook button
let platePositions = [];
let plateDishes = [];
let traySlots = [];
let MAX_TRAY_SLOTS = 5;
let cookButtonX = 700;
let cookButtonY = 600;
let cookButtonWidth = 100;
let cookButtonHeight = 40;

// ready-to-serve variables
let gameState = 'preparation'; // 'preparation' or 'serving'

// money and day system
let totalMoney = gameData.coins || 0;
// totalMoney = 10000;
let currentDay = gameData.day || 1;
let coinIcon;

// earnings display
let earningsMessages = []; // array of {text, x, y, alpha, timer}

// warning message
let noMenuShakeTimer = 0;

// load all ui images before setup & draw
function preload() {
  images.sleep = loadImage('images/restaurant/icons/sleep_icone.png');
  images.ingredient = loadImage('images/restaurant/icons/ingredient_icon.png');
  images.menu = loadImage('images/restaurant/icons/menu_icon.png');
  images.interior = loadImage('images/restaurant/icons/interior_icon.png'); 
  images.plate = loadImage('images/restaurant/decorations/plate.png');
  images.tray = loadImage('images/restaurant/decorations/tray.png');
  coinIcon = loadImage('images/restaurant/decorations/coin.png');
  backgroundImage = loadImage('images/restaurant/decorations/background.png');
  tabletopImage = loadImage('images/restaurant/decorations/tabletop.png');
  bottomImage = loadImage('images/restaurant/decorations/bottom.png');
  loadDecorationImages();
  
  // load background music and sound effects
  bgMusic = loadSound(
    'sounds/restaurant/restaurant_bgm.mp3',
    () => console.log('Background music loaded!'),
    (err) => console.error('Error loading bgMusic:', err)
  );
  
  walkSound = loadSound(
    'sounds/restaurant/walk.mp3',
    () => console.log('Walk sound loaded!'),
    (err) => console.error('Error loading walkSound:', err)
  );
  
  eatSound = loadSound(
    'sounds/restaurant/eat.mp3',
    () => console.log('Eat sound loaded!'),
    (err) => console.error('Error loading eatSound:', err)
  );
  
  errorSound = loadSound(
    'sounds/restaurant/error.mp3',
    () => console.log('Error sound loaded!'),
    (err) => console.error('Error loading errorSound:', err)
  );
  
  coinSound = loadSound(
    'sounds/restaurant/coin.mp3',
    () => console.log('Coin sound loaded!'),
    (err) => console.error('Error loading coinSound:', err)
  );

  failSound = loadSound(
    'sounds/restaurant/fail.mp3',
    () => console.log('Fail sound loaded!'),
    (err) => console.error('Error loading failSound:', err)
  );
  
  placeSound = loadSound(
    'sounds/restaurant/place.mp3',
    () => console.log('Place sound loaded!'),
    (err) => console.error('Error loading placeSound:', err)
  );
  
  cookSound = loadSound(
    'sounds/restaurant/cook.mp3',
    () => console.log('Cook sound loaded!'),
    (err) => console.error('Error loading cookSound:', err)
  );

  toggleSound = loadSound(
    'sounds/restaurant/toggle.mp3',
    () => console.log('Toggle sound loaded!'),
    (err) => console.error('Error loading toggleSound:', err)
  );
  
  for (let ingredient of ingredients) {ingredientImages[ingredient.name] = loadImage(ingredient.image);}
  for (let item of menuItems) {menuImages[item.name] = loadImage(item.image);}
  for (let recipeKey in recipes) {let recipe = recipes[recipeKey]; dishImages[recipe.dish] = loadImage(recipe.image);}
  
  loadCustomerImages();
}

function setup() {
  let cnv = createCanvas(1400,800);
  cnv.parent(document.body);
  
  // set up bgm & sound effects
  if (bgMusic) bgMusic.setVolume(0.08);
  if (walkSound) walkSound.setVolume(1.8);
  if (eatSound) eatSound.setVolume(0.5);
  if (errorSound) errorSound.setVolume(0.6);
  if (coinSound) coinSound.setVolume(0.5);
  if (placeSound) placeSound.setVolume(0.4);
  if (cookSound) cookSound.setVolume(1.2);
  if (failSound) placeSound.setVolume(0.4);
  if (toggleSound) toggleSound.setVolume(0.5)

  // icon bar: position, label, sprite
  icons = [
    { x: 350, y: 700, label: 'Sleep', img: images.sleep },
    { x: 580, y: 700, label: 'Menu', img: images.menu },
    { x: 810, y: 700, label: 'Ingredients', img: images.ingredient },
    { x: 1040, y: 700, label: 'Interior', img: images.interior, requiredMoney: 400 },
  ];
  
  // plates (serve area) – 3 fixed slots; dishes on plates (null = empty)
  let plateY = 420;
  platePositions = [{ x: 200, y: plateY }, { x: 700, y: plateY }, { x: 1200, y: plateY }];
  plateDishes = [null, null, null];
  
  // table slots (3 left, 3 right)
  let tableY = 530;
  let leftPositions = [170, 280, 380];
  let rightPositions = [1000, 1110, 1220];
  
  // left side slots (index 0–2)
  for (let i = 0; i < 3; i++) {
    tablePositions.push({ x: leftPositions[i], y: tableY, ingredient: null, side: 'left' });
  }
  
  // right side slots (index 3–5)
  for (let i = 0; i < 3; i++) {
    tablePositions.push({ x: rightPositions[i], y: tableY, ingredient: null, side: 'right' });
  }
  
  // tray slots – 5 evenly spaced
  let trayY = 530;
  let trayStartX = 530;
  let trayEndX = 870;
  let slotSpacing = (trayEndX - trayStartX) / 4; // 5 slots -> 4 gaps
  
  for (let i = 0; i < 5; i++) {
    traySlots.push({ x: trayStartX + (i * slotSpacing), y: trayY, ingredient: null });
  }
  
  textFont('Courier New');
  loadDecorationsFromStorage();
  registerInventoryFish();
  checkForNewUnlocks();
}

function draw() {
  imageMode(CORNER);
  image(backgroundImage, 0, 0, 1400, 350);    // scene bg
  drawMoneyAndDay();      // money counter and day number (top)
  drawTable();            // counter surface + shadow
  drawTray();             // tray sprite (center)
  drawTablePositions();   // ingredients/dishes on table slots
  drawTraySlots();        // ingredients/dishes on tray slots
  drawCookButton();       // prepare button
  drawPlates();           // plates + served dishes
  drawIcons();            // bottom icon bar
  drawDecorations();      // decorations
  drawCustomers();        // customers walking and ordering
  
  // only update customers when in serving mode
  if (gameState === 'serving') {
    updateCustomers();
  }
  
  // draw dragged item on top
  if (draggedIngredient) {drawDraggedIngredient();}
  
  // modal: sleep or scrollable (ingredients/menu/reservation)
  if (activePopup) {
    if (activePopup.label === 'Sleep') {drawSleepPopup();} 
    else {drawScrollablePopup();}
  }
  
  drawReadyToServeButton();
  drawEarningsMessages();
  drawUnlockNotification();
}



function drawMoneyAndDay() {
  push();
  
  // coin icon
  imageMode(CORNER);
  image(coinIcon, 80, 20, 40, 40);
  
  // money amount
  fill(255, 215, 0); // gold color
  stroke(0);
  strokeWeight(3);
  textAlign(LEFT, CENTER);
  textSize(28);
  text('$' + totalMoney, 130, 40);
  
  // day indicator
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(20);
  text('Day ' + currentDay, 130, 80);
  
  pop();
}

function drawEarningsMessages() {
  for (let i = earningsMessages.length - 1; i >= 0; i--) {
    let msg = earningsMessages[i];
    
    push();
    fill(255, 215, 0, msg.alpha); // gold with fading alpha
    stroke(0, 0, 0, msg.alpha);
    strokeWeight(2);
    textAlign(CENTER);
    textSize(18);
    text(msg.text, msg.x, msg.y);
    pop();
    
    // animate: move up and fade out
    msg.y -= 1;
    msg.alpha -= 3;
    msg.timer++;
    
    // remove when fully faded
    if (msg.alpha <= 0 || msg.timer > 120) {
      earningsMessages.splice(i, 1);
    }
  }
}

function addEarningsMessage(text, x, y) {
  earningsMessages.push({
    text: text,
    x: x,
    y: y,
    alpha: 255,
    timer: 0
  });
}

function drawTable() {
  push();
  imageMode(CORNER);
  image(tabletopImage, 0, 350, 1400, 230);  // tabletop at y=350
  image(bottomImage, 0, 580, 1400, 220);     // bottom at y=580
  pop();
}

function drawTray() {
  push();
  imageMode(CENTER);
  image(images.tray, width / 2, 550, 495, 120); // stretched so tray is longer
  pop();
}

function drawTraySlots() {
  for (let i = 0; i < traySlots.length; i++) {
    let slot = traySlots[i];
    push();
    // draw if occupied
    if (slot.ingredient) {
      imageMode(CENTER);
      if (slot.ingredient.isDish) {
        // dish sprite + gold label
        if (dishImages[slot.ingredient.dishName]) {
          image(dishImages[slot.ingredient.dishName], slot.x, slot.y, 75, 75);
        }
        fill(255, 215, 0); stroke(0); strokeWeight(1.5);
        textAlign(CENTER); textSize(10);
        text(slot.ingredient.dishName, slot.x, slot.y + 50);
        
        // delete button only for dishes on tray
        let deleteX = slot.x + 30;
        let deleteY = slot.y - 30;
        let deleteSize = 20;
        
        // check if mouse is hovering over delete button
        let isDeleteHovered = mouseX > deleteX - deleteSize/2 && 
                              mouseX < deleteX + deleteSize/2 &&
                              mouseY > deleteY - deleteSize/2 && 
                              mouseY < deleteY + deleteSize/2;
        
        // draw delete button
        fill(isDeleteHovered ? color(255, 50, 50) : color(200, 50, 50));
        stroke(255); strokeWeight(2);
        circle(deleteX, deleteY, deleteSize);
        
        // draw x
        fill(255); noStroke();
        textAlign(CENTER, CENTER); textSize(14);
        text('×', deleteX, deleteY - 1);
      } else {
        // raw ingredient sprite + white label
        if (ingredientImages[slot.ingredient.name]) {
          image(ingredientImages[slot.ingredient.name], slot.x, slot.y, 60, 60);
        }
        fill(255); stroke(0); strokeWeight(1.5);
        textAlign(CENTER); textSize(10);
        text(slot.ingredient.name, slot.x, slot.y + 45);
      }
    }
    pop();
  }
}

// prepare button to make dish
function drawCookButton() {
  push();
  let isHovered = mouseX > cookButtonX - cookButtonWidth/2 && mouseX < cookButtonX + cookButtonWidth/2 &&
                  mouseY > cookButtonY - cookButtonHeight/2 && mouseY < cookButtonY + cookButtonHeight/2;
  
  noStroke();
  fill(isHovered ? color(255, 255, 255, 255) : color(255, 255, 255, 120));
  textAlign(CENTER, CENTER);
  textSize(isHovered ? 19 : 16); // larger when hovered
  text('COOK', cookButtonX, cookButtonY);
  
  // subtle underline on hover
  if (isHovered) {
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    line(cookButtonX - 25, cookButtonY + 12, cookButtonX + 25, cookButtonY + 12);
  }
  pop();
}

function drawPlates() {
  for (let i = 0; i < platePositions.length; i++) {
    let plate = platePositions[i];
    push();
    translate(plate.x, plate.y); 
    imageMode(CENTER);
    image(images.plate, 0, 0, 120, 120); // base plate
    // dish on plate (if any)
    if (plateDishes[i] !== null) {
      let dish = plateDishes[i];
      if (dishImages[dish.dishName]) {
        image(dishImages[dish.dishName], 0, -18, 60, 60);
      }
      // dish label
      fill(255, 215, 0); stroke(0); strokeWeight(2);
      textAlign(CENTER); textSize(12);
      text(dish.dishName, 0, 30);
    }
    pop();
  }
}

// table slots: draw ingredient placed there
function drawTablePositions() {
  for (let pos of tablePositions) {
    if (pos.ingredient) {
      push();
      imageMode(CENTER);
      image(ingredientImages[pos.ingredient.name], pos.x, pos.y, 70, 70);
      fill(255); stroke(0); strokeWeight(2);
      textAlign(CENTER); textSize(12);
      text(pos.ingredient.name, pos.x, pos.y + 55);
      pop();
    }
  }
}

// ghost sprite while dragging (ingredient/dish)
function drawDraggedIngredient() {
  push();
  // slight transparency
  imageMode(CENTER);
  tint(255, 200);
  if (draggedIngredient.isDish) {
    if (dishImages[draggedIngredient.name]) {
      image(dishImages[draggedIngredient.name], mouseX, mouseY, 100, 100);}
    fill(255, 215, 0)
  } else {
    if (ingredientImages[draggedIngredient.name]) {
      image(ingredientImages[draggedIngredient.name], mouseX, mouseY, 80, 80);}
    fill(255)
  }
  stroke(0); 
  strokeWeight(2);
  textAlign(CENTER); 
  textSize(12);
  text(draggedIngredient.name, mouseX, mouseY + 55);
  pop();
}

function drawIcons() {
  // reset hover
  hoveredIcon = null;
  // pick hovered icon (radius 50)
  for (let icon of icons) {
    let d = dist(mouseX, mouseY, icon.x, icon.y);
    if (d < 50) { 
      hoveredIcon = icon;
      break; 
    }
  }
  // render icons with scale + tint on hover
  for (let icon of icons) {
    let isLocked = icon.requiredMoney && totalMoney < icon.requiredMoney;
    let isHovered = (hoveredIcon === icon) && !isLocked;
    let currentScale = isHovered ? 1.25 : 0.95;
    
    push();
    translate(icon.x, icon.y);
    imageMode(CENTER);
    let imgSize = 80 * currentScale;
    
    // draw icon
    if (isLocked) {
      tint(100, 180); // darker and more transparent
    } else if (isHovered) { 
      tint(255, 230); 
    }
    image(icon.img, 0, 0, imgSize, imgSize);
    noTint();
    
    // minimal lock overlay
    if (isLocked) {
      // simple lock icon (no circle background)
      fill(200);
      stroke(150);
      strokeWeight(2);
      
      // lock body
      let lockSize = 20;
      rect(-lockSize/2, 0, lockSize, lockSize * 0.6, 2);
      
      // lock shackle
      noFill();
      strokeWeight(3);
      arc(0, 0, lockSize * 0.6, lockSize * 0.6, PI, TWO_PI);
      
      // price below lock (clean, no background)
      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      textStyle(BOLD);
      text('$' + icon.requiredMoney, 0, 25);
      textStyle(NORMAL);
    }
    
    // label
    textAlign(CENTER, CENTER);
    textSize(16 * currentScale);
    fill(isLocked ? 180 : 255);
    noStroke();
    text(icon.label, 0, 60 * currentScale);
    pop();
  }
}

function drawLockIcon(x, y, size) {
  push();
  fill(150);
  stroke(100);
  strokeWeight(2);
  
  // lock body (rectangle)
  rect(x - size/2, y, size, size * 0.6, 3);
  
  // lock shackle (arc on top)
  noFill();
  strokeWeight(size * 0.15);
  arc(x, y, size * 0.6, size * 0.6, PI, TWO_PI);
  
  pop();
}

// modal: shared scroller (ingredients/menu/reservation)
function drawScrollablePopup() {
  // move these declarations to the top
  let popupWidth = 800, popupHeight = 600;
  let popupX = width / 2 - popupWidth / 2;
  let popupY = height / 2 - popupHeight / 2;
  
  // now interior check can use these variables
  if (activePopup.label === 'Interior') {
    drawInteriorPopup(popupX, popupY, popupWidth, popupHeight);
    return;
  }

  // only allow scrollable popup for ingredients/menu
  if (!activePopup || (activePopup.label !== 'Ingredients' && activePopup.label !== 'Menu')) {
    activePopup = null;
    return;
  }

  // overlay + card
  fill(0, 0, 0, 150); 
  rect(0, 0, width, height);
  fill(255); stroke(0); strokeWeight(1.5);
  rect(popupX, popupY, popupWidth, popupHeight, 10);
  
  // close button (top-right)
  let closeSize = 40;
  let closeX = popupX + popupWidth - closeSize - 10;
  let closeY = popupY + 10;
  let isCloseHovered = mouseX > closeX && mouseX < closeX + closeSize &&
                       mouseY > closeY && mouseY < closeY + closeSize;
  fill(isCloseHovered ? 160 : 200); noStroke();
  rect(closeX, closeY, closeSize, closeSize, 5);
  fill(0); textAlign(CENTER, CENTER); textSize(24);
  text('×', closeX + closeSize / 2, closeY + closeSize / 2 - 2);
  
  // title
  fill(0); textAlign(CENTER, CENTER); textSize(28);
  text(activePopup.label, popupX + popupWidth / 2, popupY + 60);
  
  // pick data array by type (default to [] to avoid undefined errors)
  let dataArray = [];
  if (activePopup.label === 'Ingredients') dataArray = ingredients || [];
  else if (activePopup.label === 'Menu')   dataArray = menuItems   || [];
  
  // scroll region + clipping
  push();
  let contentY = popupY + 110;
  let contentHeight = popupHeight - 130;
  let cardHeight = 130;
  let totalContentHeight = dataArray.length * cardHeight;
  maxScroll = max(0, totalContentHeight - contentHeight); // max scroll
  scrollOffset = constrain(scrollOffset, 0, maxScroll);   // clamp
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(popupX + 30, contentY, popupWidth - 60, contentHeight);
  drawingContext.clip();
  
  // render list items
  for (let i = 0; i < dataArray.length; i++) {
    let item = dataArray[i];
    let cardY = contentY + (i * cardHeight) - scrollOffset;
    // only draw if visible
    if (cardY + 120 > contentY && cardY < contentY + contentHeight) {
      // card bg
      fill(255); stroke(0); strokeWeight(1);
      rect(popupX + 30, cardY, popupWidth - 60, 120, 10);
      
      // item image by type
      imageMode(CENTER);
      let itemImage = null;
      if (activePopup.label === 'Ingredients') itemImage = ingredientImages[item.name];
      else if (activePopup.label === 'Menu')   itemImage = menuImages[item.name];
      if (itemImage) image(itemImage, popupX + 90, cardY + 60, 80, 80);
      
      // text block
      textAlign(LEFT, CENTER); fill(0);
      if (activePopup.label === 'Ingredients') {
        textSize(20); text(item.name, popupX + 150, cardY + 30);
        if (item.quantity !== undefined && item.freshness !== undefined) {
          textSize(16);
          text('Quantity: ' + item.quantity,   popupX + 150, cardY + 65);
          text('Freshness: ' + item.freshness, popupX + 150, cardY + 95);
        // "place on table" button
        let buttonX = popupX + popupWidth - 180;
        let buttonY = cardY + 25;
        let isButtonHovered = mouseX > buttonX && mouseX < buttonX + 140 &&
                              mouseY > buttonY && mouseY < buttonY + 35;
        drawButton(buttonX, buttonY, 140, 35, 'Place on table',
                   isButtonHovered ? color(80, 180, 80) : color(100, 200, 100));
        
        // "throw away" button
        let throwButtonY = cardY + 65;
        let isThrowHovered = mouseX > buttonX && mouseX < buttonX + 140 &&
                             mouseY > throwButtonY && mouseY < throwButtonY + 35;
        drawButton(buttonX, throwButtonY, 140, 35, 'Throw Away',
                   isThrowHovered ? color(200, 80, 80) : color(220, 100, 100));
        } else {
          textSize(16); 
          text("You cooked a lot of rice.", popupX + 150, cardY + 60);
          // only "place on table" button for rice
          let buttonX = popupX + popupWidth - 180;
          let buttonY = cardY + 25;
          let isButtonHovered = mouseX > buttonX && mouseX < buttonX + 140 &&
                                mouseY > buttonY && mouseY < buttonY + 35;
          drawButton(buttonX, buttonY, 140, 35, 'Place on table',
                    isButtonHovered ? color(80, 180, 80) : color(100, 200, 100));
          
        }
      } else {
        // menu - with lock/unlock ui
        let isLocked = !item.unlocked;
        let hasIngredients = hasIngredientsForDish(item.name);
        let canToggle = !isLocked && hasIngredients;
        textAlign(LEFT);
        
        // dish name
        textSize(18); 
        fill(isLocked ? 150 : 0);  // gray if locked, black if unlocked
        text(item.name, popupX + 150, cardY + 25);
        
        // price
        textSize(18); 
        fill(isLocked ? color(150, 150, 150) : (hasIngredients ? color(0, 150, 0) : color(150, 150, 150)));
        text(item.price, popupX + 150, cardY + 55);
        
        // description
        textSize(14); 
        fill(isLocked ? 150 : 100);  // gray or dark gray
        text(item.description, popupX + 150, cardY + 85);
        
        // if locked: show lock overlay and requirements
        if (isLocked) {
          // semi-transparent gray overlay
          fill(255, 255, 255, 180);
          noStroke();
          rect(popupX + 30, cardY, popupWidth - 60, 120, 10);
          
          // lock icon
          drawLockIcon(popupX + 90, cardY + 45, 30);
          
          // badge
          fill(200, 50, 50);
          textSize(17);
          textStyle(BOLD);
          textAlign(CENTER);
          text('LOCKED', popupX + 90, cardY + 80);
          textStyle(NORMAL);
          
          // unlock requirements text
          fill(200, 50, 50);
          textSize(12);
          textAlign(LEFT);
          text(getUnlockRequirementText(item), popupX + 150, cardY + 105);
          
        } else if (!hasIngredients) {
          // no ingredients - show unavailable overlay
          
          // show toggle button (disabled state - red background)
          let toggleX = popupX + popupWidth - 180;
          let toggleY = cardY + 40;
          let toggleWidth = 140;
          let toggleHeight = 40;
          
          drawButton(toggleX, toggleY, toggleWidth, toggleHeight, 
                     'Unavailable', 
                     color(230, 140, 140));
          
        } else {
          let toggleX = popupX + popupWidth - 180;
          let toggleY = cardY + 40;
          let toggleWidth = 140;
          let toggleHeight = 40;
          let isToggleHovered = mouseX > toggleX && mouseX < toggleX + toggleWidth &&
                                mouseY > toggleY && mouseY < toggleY + toggleHeight;
          
          let toggleColor = item.available ? 
            (isToggleHovered ? color(80, 180, 80) : color(100, 200, 100)) :
            (isToggleHovered ? color(120, 120, 120) : color(150, 150, 150));
          
          drawButton(toggleX, toggleY, toggleWidth, toggleHeight, 
                     item.available ? 'Available ✓' : 'Put on Menu', 
                     toggleColor);
        }
      }
    }
  }
  // end clip
  drawingContext.restore();
  pop();
}

// draw button
function drawButton(x, y, w, h, label, buttonColor) {
  fill(buttonColor); stroke(0); strokeWeight(1);
  rect(x, y, w, h, 5);
  fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(14);
  text(label, x + w / 2, y + h / 2);
}

function drawSleepPopup() {
  // overlay + card
  fill(0, 0, 0, 150); rect(0, 0, width, height);
  let popupWidth = 800, popupHeight = 600;
  let popupX = width / 2 - popupWidth / 2;
  let popupY = height / 2 - popupHeight / 2;
  fill(255); stroke(0); strokeWeight(1.5);
  rect(popupX, popupY, popupWidth, popupHeight, 10);
  
  // close button
  let closeSize = 40;
  let closeX = popupX + popupWidth - closeSize - 10;
  let closeY = popupY + 10;
  let isCloseHovered = mouseX > closeX && mouseX < closeX + closeSize &&
                       mouseY > closeY && mouseY < closeY + closeSize;
  fill(isCloseHovered ? 160 : 200); noStroke();
  rect(closeX, closeY, closeSize, closeSize, 5);
  fill(0); textAlign(CENTER, CENTER); textSize(24);
  text('×', closeX + closeSize / 2, closeY + closeSize / 2 - 2);
  
  // "advance to next day" modal
  imageMode(CENTER);
  image(images.sleep, width / 2, popupY + 180, 140, 140);
  fill(0); textAlign(CENTER, CENTER);
  textSize(28); text('Sleep and Dive', width / 2, popupY + 300);
  textSize(18); fill(60);
  text('Are you sure you want to end the day?', width / 2, popupY + 360);
  textSize(16);
  text('All progress will be saved and a new day will begin.', width / 2, popupY + 395);
  
  // options buttons + hover for "advance to next day" modal
  let buttonWidth = 200, buttonHeight = 65;
  let yesButtonX = width / 2 - buttonWidth - 30;
  let noButtonX  = width / 2 + 30;
  let buttonY = popupY + 460;
  let isYesHovered = mouseX > yesButtonX && mouseX < yesButtonX + buttonWidth &&
                     mouseY > buttonY && mouseY < buttonY + buttonHeight;
  let isNoHovered  = mouseX > noButtonX  && mouseX < noButtonX  + buttonWidth &&
                     mouseY > buttonY && mouseY < buttonY + buttonHeight;
  // yes
  fill(isYesHovered ? color(80, 180, 80) : color(100, 200, 100));
  stroke(0); strokeWeight(1.5);
  rect(yesButtonX, buttonY, buttonWidth, buttonHeight, 10);
  fill(0); noStroke(); textSize(24); text('Yes', yesButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
  // no
  fill(isNoHovered ? color(235, 80, 80) : color(255, 100, 100));
  stroke(0); strokeWeight(1.5);
  rect(noButtonX, buttonY, buttonWidth, buttonHeight, 10);
  fill(0); noStroke(); textSize(24); text('No', noButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

function drawUnlockNotification() {
  // show first notification in queue
  if (unlockNotificationQueue.length === 0) return;
  
  let notification = unlockNotificationQueue[0];
  
  // subtle overlay
  fill(0, 0, 0, 120);
  rect(0, 0, width, height);
  
  // larger card
  let cardWidth = 500;
  let cardHeight = 400;
  let cardX = width / 2 - cardWidth / 2;
  let cardY = height / 2 - cardHeight / 2;
  
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(cardX, cardY, cardWidth, cardHeight, 10);
  
  // "unlocked" badge at top
  fill(255, 215, 0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text('UNLOCKED', width / 2, cardY + 30);
  
  // dish image
  imageMode(CENTER);
  if (menuImages[notification.dishName]) {
    image(menuImages[notification.dishName], width / 2, cardY + 140, 150, 150);
  }
  
  // dish name
  fill(0);
  textSize(22);
  text(notification.dishName, width / 2, cardY + 240);
  
  // ingredients label
  fill(100);
  textSize(12);
  text('INGREDIENTS', width / 2, cardY + 275);
  
  // ingredients list
  fill(0);
  textSize(16);
  text(notification.description, width / 2, cardY + 305);
  
  // show progress if multiple unlocks (e.g., "1 of 3")
  if (unlockNotificationQueue.length > 1) {
    fill(150);
    textSize(11);
    text((unlockNotificationQueue.length - 1) + ' more to view', width / 2, cardY + 340);
  }
  
  // simple close instruction
  fill(150);
  textSize(12);
  text('click anywhere to continue', width / 2, cardY + 365);
}
function drawReadyToServeButton() {
  if (gameState === 'preparation') {
    push();
    
    if (activePopup) {
      pop();
      return;
    }

    // check if any menu items are available
    let hasAvailableDishes = menuItems.some(item => 
      item.unlocked && item.available && hasIngredientsForDish(item.name)
    );
    
    // increment shake timer if it's active
    if (noMenuShakeTimer > 0) {
      noMenuShakeTimer++;
      // stop shaking after 2 seconds (120 frames at 60fps)
      if (noMenuShakeTimer > 120) {
        noMenuShakeTimer = 0;
      }
    }
    
    let buttonX = width / 2;
    let buttonY = 150;
    let buttonWidth = 220;
    let buttonHeight = 60;
    
    let isHovered = mouseX > buttonX - buttonWidth/2 && mouseX < buttonX + buttonWidth/2 &&
                    mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2;
    
    // dim the button if no dishes available
    noStroke();
    if (hasAvailableDishes) {
      fill(isHovered ? 255 : color(255, 255, 255, 200));
    } else {
      fill(255, 255, 255, 100); // dimmed when no dishes
    }
    textAlign(CENTER, CENTER);
    textSize(isHovered && hasAvailableDishes ? 32 : 28);
    text(currentDay === 1 ? 
         "CLICK HERE TO START YOUR FIRST DAY!" : 
         "CLICK HERE TO OPEN YOUR SUSHI BAR", 
         buttonX, buttonY);
    
    if (isHovered && hasAvailableDishes) {
      stroke(255, 255, 255, 220);
      strokeWeight(3);
      line(buttonX - 200, buttonY + 20, buttonX + 200, buttonY + 20);
    }
    
    // warning text - only shake if timer is active (triggered by failed click)
    let warningY = buttonY + 50;
    let shakeOffset = 0;
    
    // apply shake effect only if shake timer is active
    if (noMenuShakeTimer > 0) {
      shakeOffset = sin(frameCount * 0.3) * 5;
    }
    
    // show red color only if no dishes available (whether shaking or not)
    if (!hasAvailableDishes) {
      noStroke();
      fill(255, 50, 50, 255); // red
    } else {
      noStroke();
      fill(255, 255, 255, 180); // normal white
    }
    
    textSize(16);
    text(currentDay === 1 ? 
         '** TUTORIAL: SET YOUR MENU BEFORE OPENING (REQUIRED); END ANYTIME YOU WANT **' : 
         '** MUST SET YOUR MENU BEFORE OPENING; END ANYTIME YOU WANT **', 
         buttonX + shakeOffset, warningY);
    
    // tutorial/tips text (only show if dishes available or on day 1)
    if (hasAvailableDishes || currentDay === 1) {
      fill(255, 255, 255, 180);
      textSize(14);
      
      if (currentDay === 1) {
        text('1. Click MENU icon: enable dishes you want to serve', buttonX, buttonY + 80);
        text('2. Click INGREDIENTS icon: place items on table or throw it away', buttonX, buttonY + 100);
        text('3. Drag ingredients to TRAY: click COOK to make dishes and drag finished dishes to plates', buttonX, buttonY + 120);
        text('4. Click SLEEP icon: advance to the next day', buttonX, buttonY + 140);
        text('TIP: Match customer orders and freshness matters! Ingredients auto-discard after 3 days. Average freshness < 2 brings more tips.', buttonX, buttonY + 160);
      } else {
        text('tips: select dishes based on your available ingredients', buttonX, buttonY + 75);
      }
    }
    
    pop();
    
    this.readyButtonBounds = {
      x: buttonX - buttonWidth/2, 
      y: buttonY - buttonHeight/2, 
      w: buttonWidth, 
      h: buttonHeight,
      canOpen: hasAvailableDishes
    };
  }
}

function mousePressed() {
  // handle decoration placement
  if (handleDecorationPlacement()) return;
  
  // handle right-click cancel
  if (cancelPlacementMode()) return false;

  let hasAvailableDishes = menuItems.some(item => 
    item.unlocked && item.available && hasIngredientsForDish(item.name)
  );

  // check for "ready to serve" button click during preparation
  if (!musicStarted && bgMusic) {
    bgMusic.loop();
    musicStarted = true;
    console.log('Background music started!');
  }

  // check for "sold out" button clicks during serving
  if (gameState === 'serving' && !activePopup) {
    if (checkSoldOutButtons()) {
      return; // click was handled, exit early
    }
  }

  if (unlockNotificationQueue.length > 0) {
    unlockNotificationQueue.shift();
    return;
  }

  // check for "ready to serve" button click during preparation
  if (!musicStarted && bgMusic) {
    bgMusic.loop();
    musicStarted = true;
    console.log('Background music started!');
  }

  if (unlockNotificationQueue.length > 0) {
    unlockNotificationQueue.shift(); // remove first item from queue
    return;
  }

  if (gameState === 'preparation') {
    let buttonWidth = 220;
    let buttonHeight = 60;
    let buttonX = width / 2;
    let buttonY = 150;
    
    if (mouseX > buttonX - buttonWidth/2 && mouseX < buttonX + buttonWidth/2 &&
        mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2) {

      // check if any menu items are available
      let hasAvailableDishes = menuItems.some(item => item.available);
      
      if (!hasAvailableDishes) {
        console.log('Cannot open restaurant - no dishes available on menu!');
        // trigger shake effect by starting the timer
        noMenuShakeTimer = 1;
        if (errorSound) {
          errorSound.play();
        }
        return; // prevent opening
      }
      
      gameState = 'serving';
      console.log('Game started - now serving customers!');
      createCustomer(); // create first customer
      return;
    }
  }
  
  // check for delete button clicks on tray dishes first
  if (!activePopup && !draggedIngredient) {
    for (let i = 0; i < traySlots.length; i++) {
      let slot = traySlots[i];
      if (slot.ingredient && slot.ingredient.isDish) {
        let deleteX = slot.x + 30;
        let deleteY = slot.y - 30;
        let deleteSize = 20;
        
        let d = dist(mouseX, mouseY, deleteX, deleteY);
        if (d < deleteSize / 2) {
          console.log('Deleted dish: ' + slot.ingredient.dishName + ' from tray slot ' + i);
          slot.ingredient = null;
          return; // exit early so we don't start dragging
        }
      }
    }
  }
  
  // cook button click (only when no modal + not dragging)
  if (!activePopup && !draggedIngredient) {
    if (mouseX > cookButtonX - cookButtonWidth/2 && mouseX < cookButtonX + cookButtonWidth/2 &&
        mouseY > cookButtonY - cookButtonHeight/2 && mouseY < cookButtonY + cookButtonHeight/2) {
      cookIngredientsInTray(); return;
    }
  }
  
  // start drag from tray (dish or ingredient)
  if (!activePopup && !draggedIngredient) {
    for (let i = 0; i < traySlots.length; i++) {
      let slot = traySlots[i];
      if (slot.ingredient) {
        let d = dist(mouseX, mouseY, slot.x, slot.y);
        if (d < 40) {
          // capture drag state and clear slot
          draggedIngredient = {
            name: slot.ingredient.isDish ? slot.ingredient.dishName : slot.ingredient.name,
            isDish: slot.ingredient.isDish || false,
            fromTraySlot: true,
            traySlotIndex: i,
            tablePositionIndex: slot.ingredient.tablePositionIndex,
            ingredientList: slot.ingredient.ingredientList // preserve ingredient list for dishes
          };
          slot.ingredient = null;
          return;
        }
      }
    }
  }
  
  // start drag from table (ingredients only)
  if (!activePopup && !draggedIngredient) {
    for (let i = 0; i < tablePositions.length; i++) {
      let pos = tablePositions[i];
      if (pos.ingredient && !pos.ingredient.isDish) {
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        if (d < 50) {
          draggedIngredient = { name: pos.ingredient.name, freshness: pos.ingredient.freshness, fromTablePosition: true, tablePositionIndex: i };
          pos.ingredient = null;
          return;
        }
      }
    }
  }
  
  // modal open: handle close + buttons
  if (activePopup) {
    let popupWidth = 800, popupHeight = 600;
    let popupX = width / 2 - popupWidth / 2;
    let popupY = height / 2 - popupHeight / 2;
    let closeSize = 40;
    let closeX = popupX + popupWidth - closeSize - 10;
    let closeY = popupY + 10;
    
    // close button (all modals)
    if (mouseX > closeX && mouseX < closeX + closeSize &&
        mouseY > closeY && mouseY < closeY + closeSize) {
      activePopup = null; scrollOffset = 0; return;
    }
    
    // sleep modal: yes/no
    if (activePopup.label === 'Sleep') {
      let buttonWidth = 200, buttonHeight = 65;
      let yesButtonX = width / 2 - buttonWidth - 30;
      let noButtonX  = width / 2 + 30;
      let buttonY = popupY + 460;
      // yes -> end day
      if (mouseX > yesButtonX && mouseX < yesButtonX + buttonWidth &&
          mouseY > buttonY && mouseY < buttonY + buttonHeight) {
        console.log('Day ended - Going to sleep');
        endDay();
        activePopup = null; return;
      }
      // no -> close
      if (mouseX > noButtonX && mouseX < noButtonX + buttonWidth &&
          mouseY > buttonY && mouseY < buttonY + buttonHeight) {
        console.log('Cancelled sleep');
        activePopup = null; return;
      }
    }
    
    // ingredients modal: place item onto first free table slot
    if (activePopup.label === 'Ingredients') {
      let contentY = popupY + 110;
      let cardHeight = 130;
      for (let i = 0; i < ingredients.length; i++) {
        let cardY = contentY + (i * cardHeight) - scrollOffset;
        let buttonY = cardY + 25;
        let buttonX = popupX + popupWidth - 180;
        
        // "place on table" button
        if (mouseX > buttonX && mouseX < buttonX + 140 &&
            mouseY > buttonY && mouseY < buttonY + 35) {
          // find empty table slot
          let emptyPosIndex = -1;
          for (let j = 0; j < tablePositions.length; j++) {
            if (tablePositions[j].ingredient === null) { emptyPosIndex = j; break; }
          }
          if (emptyPosIndex === -1) { console.log('All table positions are full!'); return; }

          let item = ingredients[i];
          let hasQuantity = (item.quantity !== undefined);
          let newQuantity = hasQuantity ? (item.quantity - 1) : undefined;
          tablePositions[emptyPosIndex].ingredient = { name: item.name, isDish: false, freshness: item.freshness};
          console.log('Placed ' + item.name + ' in table position ' + emptyPosIndex);
          if (placeSound) {
            placeSound.play();
          }

          // now update inventory
          if (hasQuantity) {
            if (newQuantity <= 0) {
              console.log(item.name + ' reached Quantity 0 — removing from inventory');
              ingredients.splice(i, 1);
            } else {
              ingredients[i].quantity = newQuantity;
              console.log(item.name + ' quantity decreased to ' + ingredients[i].quantity);
            }
          }
          return;
        }
        
        // "throw away" button logic
        let throwButtonY = cardY + 65;
        if (mouseX > buttonX && mouseX < buttonX + 140 &&
            mouseY > throwButtonY && mouseY < throwButtonY + 35) {
          // decrease quantity by 1
          if (ingredients[i].quantity !== undefined) {
            ingredients[i].quantity -= 1;
            console.log(ingredients[i].name + ' quantity decreased to ' + ingredients[i].quantity);
            
            // remove ingredient if quantity reaches 0
            if (ingredients[i].quantity <= 0) {
              console.log(ingredients[i].name + ' quantity reached 0 - removing from list');
              ingredients.splice(i, 1);
            }
          } else {
            console.log(ingredients[i].name + ' has no quantity attribute');
          }
          return;
        }
      }
    }
    
    // menu modal: toggle availability
    if (activePopup.label === 'Menu') {
      let contentY = popupY + 110;
      let cardHeight = 130;
      for (let i = 0; i < menuItems.length; i++) {
        let cardY = contentY + (i * cardHeight) - scrollOffset;
        let toggleY = cardY + 40;
        let toggleX = popupX + popupWidth - 180;
        if (mouseX > toggleX && mouseX < toggleX + 140 &&
            mouseY > toggleY && mouseY < toggleY + 40) {
          
          // only allow toggle if unlocked and has ingredients
          let item = menuItems[i];
          if (item.unlocked && hasIngredientsForDish(item.name)) {
            if (toggleSound) {
              toggleSound.play();
            }
            menuItems[i].available = !menuItems[i].available;
            console.log('Toggled ' + menuItems[i].name + ' to ' + 
                        (menuItems[i].available ? 'available' : 'unavailable'));
          } else {
            // play error sound if trying to toggle unavailable dish
            if (errorSound) {
              errorSound.play();
            }
            console.log('Cannot toggle ' + item.name + ' - ' + 
                        (!item.unlocked ? 'locked' : 'no ingredients'));
          }
          return;
        }
      }
    }

    if (activePopup.label === 'Interior') {
      if (handleInteriorClick(popupX, popupY, popupWidth, popupHeight)) {
        return;
      }
    }
  }
  
  // open modal from icon bar
  if (hoveredIcon && !activePopup) {
    let isLocked = hoveredIcon.requiredMoney && totalMoney < hoveredIcon.requiredMoney;
    if (isLocked) {
      console.log(hoveredIcon.label + ' is locked! Need $' + hoveredIcon.requiredMoney);
      if (errorSound) {
        errorSound.play();
      }
      return;
    }
    activePopup = hoveredIcon; scrollOffset = 0;
    console.log('Opened popup: ' + hoveredIcon.label);
  }
}

// drop handling (finish drag)
function mouseReleased() {
  if (draggedIngredient) {
    // drop dish onto plate
    if (draggedIngredient.isDish) {
      for (let i = 0; i < platePositions.length; i++) {
        let plate = platePositions[i];
        let d = dist(mouseX, mouseY, plate.x, plate.y);
        if (d < 80) {
          plateDishes[i] = { 
            dishName: draggedIngredient.name,
            ingredientList: draggedIngredient.ingredientList
          };
          console.log('Placed ' + draggedIngredient.name + ' on plate ' + i);
          draggedIngredient = null; return;
        }
      }
      // no plate: return dish to middle tray slot (if it came from tray)
      if (draggedIngredient.fromTraySlot) {
        traySlots[2].ingredient = { 
          name: draggedIngredient.name, 
          dishName: draggedIngredient.name, 
          isDish: true,
          ingredientList: draggedIngredient.ingredientList
        };
        console.log('Returned dish to tray');
      }
      draggedIngredient = null; return;
    }
    
    // ingredient: check if dropped on ingredients icon to remove from table
    if (!draggedIngredient.isDish) {
      // find the ingredients icon
      let ingredientsIcon = icons.find(icon => icon.label === 'Ingredients');
      if (ingredientsIcon) {
        let d = dist(mouseX, mouseY, ingredientsIcon.x, ingredientsIcon.y);
        if (d < 80) {
          // find the ingredient and increase quantity
          const NAME = draggedIngredient.name;
          const FRESH = draggedIngredient.freshness; // may be undefined for items like rice
          // prefer exact (name, freshness) match
          let idx = ingredients.findIndex(ing => ing.name === NAME && ing.freshness === FRESH);

          // if no exact freshness match exists, re-create it
          if (idx !== -1) {
            // exact row exists
            const item = ingredients[idx];
            if (typeof item.quantity === 'number') {
              const oldQ = item.quantity;
              item.quantity = oldQ + 1; // no cap
              console.log(`RETURNED ${NAME} (${FRESH}) - quantity: ${oldQ} → ${item.quantity}`);
            } else {
              // quantity undefined/null → ignore (leave unchanged)
              console.log(`RETURNED ${NAME} (${FRESH}) - quantity undefined, ignored`);
            }
          } else {
            // no exact row → create a new inventory line (so it shows in modal) at quantity 1
            let sameName = ingredients.find(ing => ing.name === NAME && ing.image);
            let inferredImage = sameName ? sameName.image
              : `images/restaurant/ingredients/${NAME.toLowerCase().replace(/\s+/g,'_')}.png`;
    
            ingredients.push({
              name: NAME,
              freshness: FRESH,
              quantity: 1,           // new row starts at quantity 1
              image: inferredImage
            });
    
            console.log(`NO exact match. Added NEW inventory row: ${NAME} (${FRESH}), quantity 1`);
          }
    
          // persist
          gameData.inventory = ingredients;
          localStorage.setItem("gameData", JSON.stringify(gameData));
    
          draggedIngredient = null;
          return;
        }
      }
      
      // try to drop onto a tray slot
      for (let i = 0; i < traySlots.length; i++) {
        let slot = traySlots[i];
        let d = dist(mouseX, mouseY, slot.x, slot.y);
        if (d < 50) {
          if (slot.ingredient === null) {
            slot.ingredient = { name: draggedIngredient.name, freshness: draggedIngredient.freshness, tablePositionIndex: draggedIngredient.tablePositionIndex };
            console.log('Placed ' + draggedIngredient.name + ' in tray slot ' + i);
            if (placeSound) {
              placeSound.play();
            }
            draggedIngredient = null; return;
          } else {
            console.log('Slot already occupied!');
          }
        }
      }
    }
    
    // find nearest empty table spot
    if (!draggedIngredient.isDish && (draggedIngredient.fromTraySlot || draggedIngredient.fromTablePosition)) {
      
      // find the nearest empty table position to mouse
      let nearestSpot = -1;
      let shortestDistance = Infinity;
      
      for (let j = 0; j < tablePositions.length; j++) {
        if (tablePositions[j].ingredient === null) {
          let d = dist(mouseX, mouseY, tablePositions[j].x, tablePositions[j].y);
          if (d < shortestDistance) {
            shortestDistance = d;
            nearestSpot = j;
          }
        }
      }
      
      if (nearestSpot !== -1) {
        // found an empty spot - place it there
        tablePositions[nearestSpot].ingredient = { name: draggedIngredient.name, isDish: false, freshness: draggedIngredient.freshness };
        console.log('Placed ' + draggedIngredient.name + ' in nearest table position ' + nearestSpot);
        if (placeSound) {
          placeSound.play();
        }
      } else {
        // no empty spots - return to tray
        if (draggedIngredient.fromTraySlot && draggedIngredient.traySlotIndex !== undefined) {
          let trayIndex = draggedIngredient.traySlotIndex;
          if (traySlots[trayIndex].ingredient === null) {
            traySlots[trayIndex].ingredient = { 
              name: draggedIngredient.name, 
              tablePositionIndex: draggedIngredient.tablePositionIndex 
            };
            console.log('All table spots full - returned ' + draggedIngredient.name + ' to tray slot ' + trayIndex);
          } else {
            // original tray slot occupied too - find any empty tray slot
            let emptyTraySlot = -1;
            for (let k = 0; k < traySlots.length; k++) {
              if (traySlots[k].ingredient === null) {
                emptyTraySlot = k;
                break;
              }
            }
            if (emptyTraySlot !== -1) {
              traySlots[emptyTraySlot].ingredient = { 
                name: draggedIngredient.name, 
                tablePositionIndex: draggedIngredient.tablePositionIndex 
              };
              console.log('Returned ' + draggedIngredient.name + ' to tray slot ' + emptyTraySlot);
            } else {
              if (failSound) {
                failSound.play();
              }
              console.log('ERROR: Ingredient ' + draggedIngredient.name + ' lost - no space anywhere!');
            }
          }
        }
      }
    }
    draggedIngredient = null;
  }
}

// craft a dish from tray contents
function cookIngredientsInTray() {
  // collect names + record filled slots
  let ingredientNames = [];
  let filledSlots = [];
  for (let i = 0; i < traySlots.length; i++) {
    if (traySlots[i].ingredient) {
      ingredientNames.push(traySlots[i].ingredient.name);
      filledSlots.push(i);
    }
  }
  if (ingredientNames.length === 0) {
    if (failSound) {
      failSound.play();
    }
    console.log('No ingredients in tray to cook!'); return; 
  }
  
  // sort names to normalize key and lookup recipe
  ingredientNames.sort();
  let recipeKey = ingredientNames.join('+');
  let matchedRecipe = recipes[recipeKey];
  
  if (matchedRecipe) {
    // success: clear tray and put dish in middle slot
    console.log('Cooked: ' + matchedRecipe.dish + ' from ' + ingredientNames.join(', '));
    if (cookSound) {
      cookSound.play();
    }
    for (let i of filledSlots) traySlots[i].ingredient = null;
    let middleSlot = 2;
    traySlots[middleSlot].ingredient = {
      name: matchedRecipe.dish,
      dishName: matchedRecipe.dish,
      isDish: true,
      ingredientList: ingredientNames.slice() // store the ingredients used
    };
    console.log('Dish placed in middle of tray');
  } else {
    // fail: restore ingredients back to their table positions
    console.log('Invalid recipe! Returning ingredients to table positions...');
    if (failSound) {
      failSound.play();
    }
    
    for (let i of filledSlots) {
      let ingredient = traySlots[i].ingredient;
      let posIndex = ingredient.tablePositionIndex;
      
      // check if original position is empty before returning there
      if (posIndex !== undefined && posIndex >= 0 && posIndex < tablePositions.length && 
          tablePositions[posIndex].ingredient === null) {
        // original spot is empty - return there
        tablePositions[posIndex].ingredient = { 
          name: ingredient.name, 
          isDish: false, 
          freshness: ingredient.freshness 
        };
        console.log('Returned ' + ingredient.name + ' to original position ' + posIndex);
      } else {
        // find alternative empty spot if original is occupied
        let foundSpot = false;
        for (let j = 0; j < tablePositions.length; j++) {
          if (tablePositions[j].ingredient === null) {
            tablePositions[j].ingredient = { 
              name: ingredient.name, 
              isDish: false, 
              freshness: ingredient.freshness 
            };
            console.log('Returned ' + ingredient.name + ' to table position ' + j);
            foundSpot = true;
            break;
          }
        }
        if (!foundSpot) {
          console.log('ERROR: No table space for ' + ingredient.name + '!');
        }
      }
      
      traySlots[i].ingredient = null;
    }
  }
}

function mouseWheel(event) {
  if (activePopup && (activePopup.label === 'Ingredients' || activePopup.label === 'Menu' || activePopup.label === 'Interior')) {
    scrollOffset += event.delta;
    scrollOffset = constrain(scrollOffset, 0, maxScroll);
    return false; // prevent page scroll
  }
}

// helper function to return ingredient to inventory
function returnIngredientToInventory(ingredient, location) {
  const name = ingredient.name;
  const freshness = ingredient.freshness;
  
  // find matching ingredient in inventory
  let idx = ingredients.findIndex(ing => 
    ing.name === name && ing.freshness === freshness
  );
  
  if (idx !== -1) {
    // found it - increase quantity
    ingredients[idx].quantity++;
    console.log('Returned ' + name + ' (' + freshness + ') from ' + location + ' → quantity now: ' + ingredients[idx].quantity);
  } else {
    // not found - create new inventory entry
    let sameName = ingredients.find(ing => ing.name === name);
    let inferredImage = sameName ? sameName.image 
      : `images/restaurant/ingredients/${name.toLowerCase().replace(/\s+/g,'_')}.png`;
    
    ingredients.push({
      name: name,
      freshness: freshness,
      quantity: 1,
      image: inferredImage
    });
    console.log('Returned ' + name + ' (' + freshness + ') from ' + location + ' → created new entry with quantity 1');
  }
}

function endDay() {
  currentDay++;
  gameData.coins = totalMoney;
  gameData.day = currentDay;

  // reset game state
  gameState = 'preparation';
  customers = [];
  customerTimer = 0;
  
  // clear all plates (dishes are discarded)
  for (let i = 0; i < plateDishes.length; i++) {
    plateDishes[i] = null;
  }
  
  // return ingredients from table to inventory
  for (let i = 0; i < tablePositions.length; i++) {
    if (tablePositions[i].ingredient && !tablePositions[i].ingredient.isDish) {
      returnIngredientToInventory(tablePositions[i].ingredient, 'table');
    }
    tablePositions[i].ingredient = null;
  }
  
  // return ingredients from tray to inventory
  for (let i = 0; i < traySlots.length; i++) {
    if (traySlots[i].ingredient) {
      if (!traySlots[i].ingredient.isDish) {
        returnIngredientToInventory(traySlots[i].ingredient, 'tray');
      } else {
        console.log('Discarded dish: ' + traySlots[i].ingredient.dishName);
      }
    }
    traySlots[i].ingredient = null;
  }
  
  // age all ingredients and remove expired ones
  for (let i = ingredients.length - 1; i >= 0; i--) {
    let ing = ingredients[i];
    
    if (ing.freshness) {
      let dayMatch = ing.freshness.match(/Day (\d+)/);
      if (dayMatch) {
        let dayNum = parseInt(dayMatch[1]) + 1;
        ing.freshness = 'Day ' + dayNum;
        
        // remove if too old (day 4+)
        if (dayNum > 3) {
          console.log(ing.name + ' (Day ' + dayNum + ') expired - removed from inventory');
          ingredients.splice(i, 1);
          continue;
        }
        
        // remove if quantity is 0
        if (ing.quantity !== undefined && ing.quantity <= 0) {
          console.log(ing.name + ' has no quantity left - removed from inventory');
          ingredients.splice(i, 1);
        }
      }
    }
  }

  // save and navigate
  gameData.inventory = ingredients;
  localStorage.setItem("gameData", JSON.stringify(gameData)); 
  console.log('Day ' + currentDay + ' begins! Total money: $' + totalMoney);
  window.location.href = "day.html";
}

document.addEventListener('contextmenu', event => event.preventDefault());