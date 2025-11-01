// sushi_bar.js - FIXED VERSION
// array fro icons in the icon bar; icon under mouse; modal that is open
let icons = [];
let hoveredIcon = null;
let activePopup = null;

// drag state for ingredient
let draggedIngredient = null;

// array for slots on table
let tablePositions = [];
let MAX_TABLE_POSITIONS = 6;

// scrolling for panels / lists [used Claude to finish the scrolling part]
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
let totalMoney = 0;
let currentDay = 1;
let coinIcon;

// earnings display
let earningsMessages = []; // array of {text, x, y, alpha, timer}

// load all UI images before setup & draw
function preload() {
  images.sleep = loadImage('images/sleep_icone.png');
  // images.reservation = loadImage('images/reservation_icon.png');
  images.ingredient = loadImage('images/ingredient_icon.png');
  images.menu = loadImage('images/menu_icon.png');
  images.plate = loadImage('images/plate.png');
  images.tray = loadImage('images/tray.png');
  coinIcon = loadImage('images/coin.png'); // add coin icon image
  
  for (let ingredient of ingredients) {ingredientImages[ingredient.name] = loadImage(ingredient.image);}
  for (let item of menuItems) {menuImages[item.name] = loadImage(item.image);}
  // for (let reservation of reservations) {reservationImages[reservation.name] = loadImage(reservation.image);}
  for (let recipeKey in recipes) {let recipe = recipes[recipeKey]; dishImages[recipe.dish] = loadImage(recipe.image);}
  
  loadCustomerImages();
}

function setup() {
  createCanvas(1400, 800); // canvas

  // icon bar: position, label, sprite
  icons = [
    { x: 460, y: 700, label: 'Sleep', img: images.sleep },
    { x: 700, y: 700, label: 'Menu', img: images.menu },
    { x: 940, y: 700, label: 'Ingredients', img: images.ingredient },
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
  
  // Don't create customer at start
}

function draw() {
  background(45, 40, 38); // scene bg
  
  drawMoneyAndDay();      // money counter and day number (top)
  drawCustomers();        // customers walking and ordering
  drawTable();            // counter surface + shadow
  drawTray();             // tray sprite (center)
  drawTablePositions();   // ingredients/dishes on table slots
  drawTraySlots();        // ingredients/dishes on tray slots
  drawCookButton();       // prepare button
  drawPlates();           // plates + served dishes
  drawIcons();            // bottom icon bar
  
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
  
  // draw ready to serve button on top (only during preparation)
  drawReadyToServeButton();
  
  // draw earnings messages
  drawEarningsMessages();
}

function drawMoneyAndDay() {
  push();
  
  // Coin icon
  imageMode(CORNER);
  image(coinIcon, 20, 20, 40, 40);
  
  // Money amount
  fill(255, 215, 0); // gold color
  stroke(0);
  strokeWeight(3);
  textAlign(LEFT, CENTER);
  textSize(28);
  text('$' + totalMoney, 70, 40);
  
  // Day indicator
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(20);
  text('Day ' + currentDay, 30, 80);
  
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
  fill(160, 130, 95); noStroke();
  rect(0, 350, 1400, 230); // tabletop
  fill(100, 80, 60);
  rect(0, 580, 1400, 220); // front face shadow
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
        
        // delete button only for dishes on tray [used Claude to finish this function]
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
        
        // draw X
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
        image(dishImages[dish.dishName], 0, -18, 80, 80);
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
    let isHovered = (hoveredIcon === icon);
    let currentScale = isHovered ? 1.25 : 0.95;
    push();
    translate(icon.x, icon.y);
    imageMode(CENTER);
    let imgSize = 80 * currentScale;
    if (isHovered) { 
      tint(255, 230); 
    } // brighten
    image(icon.img, 0, 0, imgSize, imgSize);
    noTint();
    textAlign(CENTER, CENTER);
    textSize(16 * currentScale);
    fill(255);
    text(icon.label, 0, 60 * currentScale);
    pop();
  }
}

// modal: shared scroller (Ingredients/Menu/Reservation) - generated by Claude
function drawScrollablePopup() {
  // Only allow scrollable popup for Ingredients/Menu
  if (!activePopup || (activePopup.label !== 'Ingredients' && activePopup.label !== 'Menu')) {
    activePopup = null;
    return;
  }

  // overlay + card
  fill(0, 0, 0, 150); 
  rect(0, 0, width, height);
  let popupWidth = 800, popupHeight = 600;
  let popupX = width / 2 - popupWidth / 2;
  let popupY = height / 2 - popupHeight / 2;
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
        if (item.quality !== undefined && item.freshness !== undefined) {
          textSize(16);
          text('Quality: ' + item.quality,   popupX + 150, cardY + 65);
          text('Freshness: ' + item.freshness, popupX + 150, cardY + 95);
        } else {
          textSize(16); 
          text("You cooked a lot of rice.", popupX + 150, cardY + 60);
        }
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
        // Menu
        textSize(18); text(item.name, popupX + 150, cardY + 25);
        textSize(18); fill(0, 150, 0); text(item.price, popupX + 150, cardY + 55);
        textSize(14); fill(100); text(item.description, popupX + 150, cardY + 85);
        
        // toggle button for availability
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
  // end clip
  drawingContext.restore();
  pop();
}

// drawbbutton
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

function drawReadyToServeButton() {
  if (gameState === 'preparation') {
    push();
    
    // Button position (top center)
    let buttonX = width / 2;
    let buttonY = 150;
    let buttonWidth = 220;
    let buttonHeight = 60;
    
    let isHovered = mouseX > buttonX - buttonWidth/2 && mouseX < buttonX + buttonWidth/2 &&
                    mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2;
    
    // Main button text - larger and whiter
    noStroke();
    fill(isHovered ? color(255, 255, 255, 255) : color(255, 255, 255, 200));
    textAlign(CENTER, CENTER);
    textSize(isHovered ? 32 : 28); // much larger
    text('READY TO SERVE', buttonX, buttonY);
    
    // Thicker underline on hover
    if (isHovered) {
      stroke(255, 255, 255, 220);
      strokeWeight(3); // thicker
      line(buttonX - 90, buttonY + 20, buttonX + 90, buttonY + 20);
    }
    
    // Explanation text below button
    noStroke();
    fill(255, 255, 255, 180);
    textSize(16);
    text('Set your Menu based on your ingredients', buttonX, buttonY + 50);
    
    fill(255, 255, 255, 120);
    textSize(14);
    text('Good luck tonight', buttonX, buttonY + 75);
    
    pop();
    
    // Store button bounds for click detection
    this.readyButtonBounds = {x: buttonX - buttonWidth/2, y: buttonY - buttonHeight/2, w: buttonWidth, h: buttonHeight};
  }
}

function mousePressed() {
  // check for "Ready to Serve" button click during preparation
  if (gameState === 'preparation') {
    let buttonWidth = 300;
    let buttonHeight = 80;
    let buttonX = width / 2 - buttonWidth / 2;
    let buttonY = 100;
    
    if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
        mouseY > buttonY && mouseY < buttonY + buttonHeight) {
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
          draggedIngredient = { name: pos.ingredient.name, fromTablePosition: true, tablePositionIndex: i };
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
    
    // sleep modal: Yes/No
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
          
          // decrease quality by 1 when placing on table
          if (ingredients[i].quality !== undefined) {
            ingredients[i].quality -= 1;
            console.log(ingredients[i].name + ' quality decreased to ' + ingredients[i].quality);
            
            // remove ingredient if quality reaches 0
            if (ingredients[i].quality <= 0) {
              console.log(ingredients[i].name + ' quality reached 0 - cannot place on table');
              ingredients.splice(i, 1);
              return;
            }
          }
          
          // place ingredient
          tablePositions[emptyPosIndex].ingredient = { name: ingredients[i].name, isDish: false };
          console.log('Placed ' + ingredients[i].name + ' in table position ' + emptyPosIndex);
          return;
        }
        
        // "throw away" button logic
        let throwButtonY = cardY + 65;
        if (mouseX > buttonX && mouseX < buttonX + 140 &&
            mouseY > throwButtonY && mouseY < throwButtonY + 35) {
          // decrease quality by 1
          if (ingredients[i].quality !== undefined) {
            ingredients[i].quality -= 1;
            console.log(ingredients[i].name + ' quality decreased to ' + ingredients[i].quality);
            
            // remove ingredient if quality reaches 0
            if (ingredients[i].quality <= 0) {
              console.log(ingredients[i].name + ' quality reached 0 - removing from list');
              ingredients.splice(i, 1);
            }
          } else {
            console.log(ingredients[i].name + ' has no quality attribute');
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
          menuItems[i].available = !menuItems[i].available;
          console.log('Toggled ' + menuItems[i].name + ' to ' + 
                      (menuItems[i].available ? 'available' : 'unavailable'));
          return;
        }
      }
    }
  }
  
  // open modal from icon bar
  if (hoveredIcon && !activePopup) {
    activePopup = hoveredIcon; scrollOffset = 0;
    console.log('Opened popup: ' + hoveredIcon.label);
  }
}

// drop handling (finish drag) - FIXED VERSION
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
    
    // ingredient: check if dropped on Ingredients icon to remove from table
    if (!draggedIngredient.isDish) {
      // find the Ingredients icon
      let ingredientsIcon = icons.find(icon => icon.label === 'Ingredients');
      if (ingredientsIcon) {
        let d = dist(mouseX, mouseY, ingredientsIcon.x, ingredientsIcon.y);
        if (d < 80) {
          // FIXED: Find the ingredient and increase quality
          let ingredientData = ingredients.find(ing => ing.name === draggedIngredient.name);
          if (ingredientData) {
            if (ingredientData.quality !== undefined) {
              // Cap quality at 3 to prevent it from going too high
              let oldQuality = ingredientData.quality;
              ingredientData.quality = Math.min(ingredientData.quality + 1, 3);
              console.log('RETURNED ' + draggedIngredient.name + ' - quality: ' + oldQuality + ' → ' + ingredientData.quality);
            } else {
              console.log('Returned ' + draggedIngredient.name + ' back to ingredients (no quality attribute)');
            }
          } else {
            console.log('WARNING: Could not find ' + draggedIngredient.name + ' in ingredients array!');
            console.log('Current ingredients:', ingredients.map(ing => ing.name).join(', '));
          }
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
            slot.ingredient = { name: draggedIngredient.name, tablePositionIndex: draggedIngredient.tablePositionIndex };
            console.log('Placed ' + draggedIngredient.name + ' in tray slot ' + i);
            draggedIngredient = null; return;
          } else {
            console.log('Slot already occupied!');
          }
        }
      }
    }
    
    // find nearest empty table spot
    if (!draggedIngredient.isDish && (draggedIngredient.fromTraySlot || draggedIngredient.fromTablePosition)) {
      
      // fine the nearest empty table position to mouse
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
        tablePositions[nearestSpot].ingredient = { name: draggedIngredient.name, isDish: false };
        console.log('Placed ' + draggedIngredient.name + ' in nearest table position ' + nearestSpot);
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
  if (ingredientNames.length === 0) { console.log('No ingredients in tray to cook!'); return; }
  
  // sort names to normalize key and lookup recipe
  ingredientNames.sort();
  let recipeKey = ingredientNames.join('+');
  let matchedRecipe = recipes[recipeKey];
  
  if (matchedRecipe) {
    // success: clear tray and put dish in middle slot
    console.log('Cooked: ' + matchedRecipe.dish + ' from ' + ingredientNames.join(', '));
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
    for (let i of filledSlots) {
      let ingredient = traySlots[i].ingredient;
      let posIndex = ingredient.tablePositionIndex;
      if (posIndex !== undefined && posIndex >= 0 && posIndex < tablePositions.length) {
        tablePositions[posIndex].ingredient = { name: ingredient.name, isDish: false };
      }
      traySlots[i].ingredient = null;
    }
  }
}

function mouseWheel(event) {
  if (activePopup && (activePopup.label === 'Ingredients' || activePopup.label === 'Menu')) {
    scrollOffset += event.delta;
    scrollOffset = constrain(scrollOffset, 0, maxScroll);
    return false; // prevent page scroll
  }
}

function endDay() {
  // Advance day
  currentDay++;
  
  // Reset game state
  gameState = 'preparation';
  customers = [];
  customerTimer = 0;
  
  // Clear all plates
  for (let i = 0; i < plateDishes.length; i++) {
    plateDishes[i] = null;
  }
  
  // Simply clear table positions (don't modify quality - it's already in ingredients list)
  for (let i = 0; i < tablePositions.length; i++) {
    if (tablePositions[i].ingredient && !tablePositions[i].ingredient.isDish) {
      console.log('Returned ' + tablePositions[i].ingredient.name + ' from table to inventory');
    }
    tablePositions[i].ingredient = null;
  }
  
  // Clear all tray slots
  for (let i = 0; i < traySlots.length; i++) {
    if (traySlots[i].ingredient) {
      if (!traySlots[i].ingredient.isDish) {
        console.log('Returned ' + traySlots[i].ingredient.name + ' from tray to inventory');
      } else {
        console.log('Cleared dish ' + traySlots[i].ingredient.dishName + ' from tray');
      }
    }
    traySlots[i].ingredient = null;
  }
  
  // Decrease freshness and quality of all ingredients
  for (let i = ingredients.length - 1; i >= 0; i--) {
    let ing = ingredients[i];
    
    // Update freshness (Day 1 -> Day 2 -> Day 3, etc.)
    if (ing.freshness) {
      let dayMatch = ing.freshness.match(/Day (\d+)/);
      if (dayMatch) {
        let dayNum = parseInt(dayMatch[1]);
        dayNum++;
        ing.freshness = 'Day ' + dayNum;
        
        // Remove ingredient if freshness exceeds Day 3
        if (dayNum > 3) {
          console.log(ing.name + ' exceeded Day 3 freshness and removed from inventory');
          ingredients.splice(i, 1);
          continue; // skip quality check since ingredient is already removed
        }
        
        // decrease quality based on freshness
        if (ing.quality !== undefined) {
          ing.quality = max(0, ing.quality - 1);
          
          // remove ingredient if quality reaches 0
          if (ing.quality <= 0) {
            console.log(ing.name + ' spoiled and removed from inventory');
            ingredients.splice(i, 1);
          }
        }
      }
    }
  }
  
  console.log('Day ' + currentDay + ' begins! Total money: $' + totalMoney);
}