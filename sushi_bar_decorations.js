// decoration catalog with placement instances
let decorations = [
  { 
    name: 'Flower Vases', 
    image: 'images/restaurant/decorations/flower_vase.png',
    price: 200, 
    purchased: false,
    active: false,
    description: 'Fresh flowers on each table',
    isFixed: true,
    maxInstances: 1
  },
  { 
    name: 'Tree in the Waves', 
    image: 'images/restaurant/decorations/wall_art_1.png',
    price: 250, 
    purchased: false,
    instances: [],
    description: 'Abstract painting',
    maxInstances: 1
  },
  { 
    name: 'The Whale', 
    image: 'images/restaurant/decorations/wall_art_2.png',
    price: 250, 
    purchased: false,
    instances: [],
    description: 'Abstract painting',
    maxInstances: 1
  },
  { 
    name: 'Deep Blue', 
    image: 'images/restaurant/decorations/wall_art_3.png',
    price: 250, 
    purchased: false,
    instances: [],
    description: 'Abstract painting',
    maxInstances: 1
  },
  { 
    name: 'Frozen Shrine', 
    image: 'images/restaurant/decorations/wall_art_5.png',
    price: 250, 
    purchased: false,
    instances: [],
    description: 'Abstract painting',
    maxInstances: 1
  },
  { 
    name: 'Plant - Sakura', 
    image: 'images/restaurant/decorations/plant_sakura.png',
    price: 300, 
    purchased: false,
    active: false,
    description: 'Decorative sakura plant (right side)',
    isFixed: true,
    maxInstances: 1,
    position: { x: 1160, y: 230 }
  },
  { 
    name: 'Plant - Bonsai', 
    image: 'images/restaurant/decorations/plant_bonsai.png',
    price: 300, 
    purchased: false,
    active: false,
    description: 'Decorative bonsai tree (right corner)',
    isFixed: true,
    maxInstances: 1,
    position: { x: 1300, y: 230 }
  },
];

// state variables
let decorationImages = {};
let placementMode = null;
let hoveredDecoration = null;

function saveDecorationsToStorage() {
  // create a simplified version for storage (only save what changes)
  let decorationData = decorations.map(deco => ({
    name: deco.name,
    purchased: deco.purchased,
    active: deco.active,
    instances: deco.instances ? [...deco.instances] : []
  }));
  
  localStorage.setItem('restaurantDecorations', JSON.stringify(decorationData));
  console.log('Decorations saved to localStorage');
}

function loadDecorationsFromStorage() {
  let saved = localStorage.getItem('restaurantDecorations');
  if (!saved) {
    console.log('No saved decorations found');
    return;
  }
  
  try {
    let decorationData = JSON.parse(saved);
    
    // match saved data with decoration definitions
    for (let savedDeco of decorationData) {
      let deco = decorations.find(d => d.name === savedDeco.name);
      if (deco) {
        deco.purchased = savedDeco.purchased;
        if (deco.isFixed) {
          deco.active = savedDeco.active || false;
        } else {
          deco.instances = savedDeco.instances || [];
        }
      }
    }
    
    console.log('Decorations loaded from localStorage:', decorationData.length + ' items');
  } catch (e) {
    console.error('Error loading decorations:', e);
  }
}

function loadDecorationImages() {
  for (let deco of decorations) {
    decorationImages[deco.name] = loadImage(deco.image);
  }
}

function drawDecorations() {
  imageMode(CENTER);
  
  // layer 1: flower vases next to plates (bottom)
  let vases = decorations.find(d => d.name === 'Flower Vases');
  if (vases && vases.active) {
    for (let plate of platePositions) {
      image(decorationImages['Flower Vases'], plate.x - 80, plate.y, 40, 50);
    }
  }
  
  // layer 2: wall art (middle - behind plants)
  for (let deco of decorations) {
    if (deco.isFixed) continue;
    
    if (deco.instances) {
      for (let instance of deco.instances) {
        if (decorationImages[deco.name]) {
          let w = 100, h = 100;
          if (deco.name.includes('Wall Art')) { 
            w = 200;
            h = 150;
          }
          
          image(decorationImages[deco.name], instance.x, instance.y, w, h);
        }
      }
    }
  }
  
  // layer 3: plants (top - in front of wall art)
  let sakura = decorations.find(d => d.name === 'Plant - Sakura');
  if (sakura && sakura.active && decorationImages['Plant - Sakura']) {
    image(decorationImages['Plant - Sakura'], sakura.position.x, sakura.position.y, 120, 156);
  }
  
  let bonsai = decorations.find(d => d.name === 'Plant - Bonsai');
  if (bonsai && bonsai.active && decorationImages['Plant - Bonsai']) {
    image(decorationImages['Plant - Bonsai'], bonsai.position.x, bonsai.position.y, 150, 195);
  }
  
  // placement preview (wall art only)
  if (placementMode && !placementMode.isFixed) {
    push();
    tint(255, 150);
    
    let w = 100, h = 100;
    if (placementMode.name.includes('Wall Art')) { 
      w = 200;
      h = 150;
    }
    
    if (decorationImages[placementMode.name]) {
      image(decorationImages[placementMode.name], mouseX, mouseY, w, h);
    }
    pop();
    
    fill(255);
    stroke(0);
    strokeWeight(2);
    textAlign(CENTER);
    textSize(18);
    text('Click to place ' + placementMode.name + ' (Right-click to cancel)', width / 2, 30);
  }
}

// draw interior popup content
function drawInteriorPopup(popupX, popupY, popupWidth, popupHeight) {
  fill(0, 0, 0, 150); 
  rect(0, 0, width, height);
  fill(255); 
  stroke(0); 
  strokeWeight(1.5);
  rect(popupX, popupY, popupWidth, popupHeight, 10);
  
  // close button
  let closeSize = 40;
  let closeX = popupX + popupWidth - closeSize - 10;
  let closeY = popupY + 10;
  let isCloseHovered = mouseX > closeX && mouseX < closeX + closeSize &&
                      mouseY > closeY && mouseY < closeY + closeSize;
  fill(isCloseHovered ? 160 : 200); 
  noStroke();
  rect(closeX, closeY, closeSize, closeSize, 5);
  fill(0); 
  textAlign(CENTER, CENTER); 
  textSize(24);
  text('×', closeX + closeSize / 2, closeY + closeSize / 2 - 2);
  
  // title
  fill(0); 
  textAlign(CENTER, CENTER); 
  textSize(28);
  text('Interior', popupX + popupWidth / 2, popupY + 60);
  
  let dataArray = decorations;
  
  push();
  let contentY = popupY + 110;
  let contentHeight = popupHeight - 130;
  let cardHeight = 130;
  let totalContentHeight = dataArray.length * cardHeight;
  maxScroll = max(0, totalContentHeight - contentHeight);
  scrollOffset = constrain(scrollOffset, 0, maxScroll);
  
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(popupX + 30, contentY, popupWidth - 60, contentHeight);
  drawingContext.clip();
  
  for (let i = 0; i < dataArray.length; i++) {
    let item = dataArray[i];
    let cardY = contentY + (i * cardHeight) - scrollOffset;
    
    if (cardY + 120 > contentY && cardY < contentY + contentHeight) {
      fill(255); 
      stroke(0); 
      strokeWeight(1);
      rect(popupX + 30, cardY, popupWidth - 60, 120, 10);
      
      imageMode(CENTER);
      if (decorationImages[item.name]) {
        image(decorationImages[item.name], popupX + 90, cardY + 60, 80, 80);
      }
      
      textAlign(LEFT, CENTER); 
      fill(0);
      textSize(18); 
      text(item.name, popupX + 150, cardY + 25);
      
      // price display
      textSize(16);
      if (!item.purchased) {
        fill(150, 150, 150);
        text('$' + item.price, popupX + 150, cardY + 55);
      } else {
        fill(0, 150, 0);
        text('Purchased', popupX + 150, cardY + 55);
      }
      
      // status
      textSize(14);
      if (!item.purchased) {
        fill(100);
        text(item.description, popupX + 150, cardY + 80);
      } else {
        // show if active or not
        let isActive = item.isFixed ? item.active : (item.instances && item.instances.length > 0);
        if (isActive) {
          fill(0, 150, 0);
          text('✓ Currently Active', popupX + 150, cardY + 80);
        } else {
          fill(150, 150, 150);
          text('Not placed yet', popupX + 150, cardY + 80);
        }
      }
      
      // single button
      let buttonX = popupX + popupWidth - 180;
      let buttonY = cardY + 40;
      let buttonWidth = 140;
      let buttonHeight = 40;
      let isButtonHovered = mouseX > buttonX && mouseX < buttonX + buttonWidth &&
                            mouseY > buttonY && mouseY < buttonY + buttonHeight;
      
      let buttonLabel, buttonColor;
      
      if (!item.purchased) {
        // not purchased yet
        let canAfford = totalMoney >= item.price;
        buttonLabel = canAfford ? 'Buy ($' + item.price + ')' : 'Too Expensive';
        buttonColor = canAfford ?
          (isButtonHovered ? color(80, 180, 80) : color(100, 200, 100)) :
          color(180, 180, 180);
      } else {
        // already purchased
        let isActive = item.isFixed ? item.active : (item.instances && item.instances.length > 0);
        let atMax = item.maxInstances && item.instances && item.instances.length >= item.maxInstances;
        
        if (isActive || atMax) {
          // currently active - show remove button (red)
          buttonLabel = item.isFixed ? 'Remove' : 'Remove';
          buttonColor = isButtonHovered ? color(200, 80, 80) : color(220, 100, 100);
        } else {
          // not active - show place button (green)
          buttonLabel = 'Place';
          buttonColor = isButtonHovered ? color(80, 180, 80) : color(100, 200, 100);
        }
      }
      
      drawButton(buttonX, buttonY, buttonWidth, buttonHeight, buttonLabel, buttonColor);
    }
  }
  
  drawingContext.restore();
  pop();
}

// handle interior popup clicks
function handleInteriorClick(popupX, popupY, popupWidth, popupHeight) {
  let contentY = popupY + 110;
  let cardHeight = 130;
  
  for (let i = 0; i < decorations.length; i++) {
    let cardY = contentY + (i * cardHeight) - scrollOffset;
    let buttonY = cardY + 40;
    let buttonX = popupX + popupWidth - 180;
    
    if (mouseX > buttonX && mouseX < buttonX + 140 &&
        mouseY > buttonY && mouseY < buttonY + 40) {
      
      let item = decorations[i];
      
      if (!item.purchased) {
        // buy action
        if (totalMoney >= item.price) {
          totalMoney -= item.price;
          item.purchased = true;
          console.log('Purchased ' + item.name + ' for $' + item.price);
          if (coinSound) coinSound.play();
          
          // save after purchase
          saveDecorationsToStorage();
          
          // also update gameData coins
          gameData.coins = totalMoney;
          localStorage.setItem("gameData", JSON.stringify(gameData));
        } else {
          console.log('Cannot afford ' + item.name + '!');
          if (errorSound) errorSound.play();
        }
      } else {
        // place or remove action
        let isActive = item.isFixed ? item.active : (item.instances && item.instances.length > 0);
        let atMax = item.maxInstances && item.instances && item.instances.length >= item.maxInstances;
        
        if (isActive || atMax) {
          // remove action
          if (item.isFixed) {
            item.active = false;
            console.log('Removed ' + item.name);
          } else {
            // remove (only one instance, so clear all)
            item.instances = [];
            console.log('Removed ' + item.name);
          }
          if (errorSound) errorSound.play();
          
          // save after removal
          saveDecorationsToStorage();
        } else {
          // place action (only if under max limit)
          if (item.isFixed) {
            item.active = true;
            console.log('Placed ' + item.name);
            if (toggleSound) toggleSound.play();
            
            // save after placing
            saveDecorationsToStorage();
          } else {
            // check if already at max
            if (item.maxInstances && item.instances.length >= item.maxInstances) {
              console.log('Already placed maximum instances of ' + item.name);
              if (errorSound) errorSound.play();
            } else {
              placementMode = item;
              activePopup = null;
              console.log('Entering placement mode for: ' + item.name);
              if (toggleSound) toggleSound.play();
            }
          }
        }
      }
      
      return true;
    }
  }
  return false;
}

function handleDecorationPlacement() {
  if (!placementMode) return false;
  
  // skip for fixed items
  if (placementMode.isFixed) {
    placementMode = null;
    return false;
  }
  
  // check if clicking in valid area (not on UI elements)
  let isOverUI = mouseY > 580 || (mouseY < 150 && mouseX < 300);
  
  // get decoration dimensions (only wall art now since plants are fixed)
  let decorationWidth, decorationHeight;
  if (placementMode.name.includes('Wall Art')) {
    decorationWidth = 200;
    decorationHeight = 150;
  } else {
    decorationWidth = 100;
    decorationHeight = 100;
  }
  
  // calculate decoration bounding box (imageMode is CENTER)
  let decorationLeft = mouseX - decorationWidth / 2;
  let decorationRight = mouseX + decorationWidth / 2;
  let decorationTop = mouseY - decorationHeight / 2;
  let decorationBottom = mouseY + decorationHeight / 2;
  
  // table area is from y=350 to y=580 (full width)
  let tableTop = 350;
  let tableBottom = 580;
  
  // check if decoration bounding box intersects with table area
  let intersectsTable = (decorationBottom > tableTop && decorationTop < tableBottom);
  
  if (intersectsTable) {
    // error: decoration would overlap table
    console.log('Cannot place decorations on or overlapping the table area!');
    if (errorSound) errorSound.play();
    // don't exit placement mode, let them try again
    return false;
  }
  
  if (!isOverUI) {
    // check max instances before placing
    if (placementMode.maxInstances && placementMode.instances.length >= placementMode.maxInstances) {
      console.log('Max instances reached for ' + placementMode.name);
      if (errorSound) errorSound.play();
      placementMode = null;
      return true;
    }
    
    placementMode.instances.push({ x: mouseX, y: mouseY });
    console.log('Placed ' + placementMode.name + ' at (' + mouseX + ', ' + mouseY + ')');
    if (placeSound) placeSound.play();
    
    // save after placing
    saveDecorationsToStorage();
    
    placementMode = null;
    return true;
  } else {
    // cancel placement mode if clicking on UI
    console.log('Cancelled placement mode');
    placementMode = null;
    if (errorSound) errorSound.play();
    return true;
  }
}

function cancelPlacementMode() {
  if (mouseButton === RIGHT && placementMode) {
    console.log('Cancelled placement mode');
    placementMode = null;
    return true;
  }
  return false;
}