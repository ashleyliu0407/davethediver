// sushi_bar_customers.js
// customer creating, movement, ordering, and eating logic

// customer system variables
let customers = [];
let customerTimer = 0;
let customerCreateInterval = 240; // this will be randomized
let minCreateInterval = 360; // minimum 12 seconds at 60fps
let maxCreateInterval = 720; // maximum 20 seconds at 60fps
let customerSideImages = {}; // side walking images
let customerFrontImages = {}; // front facing images

function getAllCustomerTypes() {
    // derive from images loaded in loadCustomerImages(), e.g., ['customer1','customer2', ...]
    return Object.keys(customerFrontImages);
  }
  
function getActiveCustomerTypes() {
    // count any customer currently present (including 'leaving' so it truly never "appears twice")
    const types = new Set();
    for (const c of customers) types.add(c.type);
    return types;
}
  
function getAvailableCustomerTypes() {
    const all = getAllCustomerTypes();
    const active = getActiveCustomerTypes();
    return all.filter(t => !active.has(t));
}

// load customer images (called from main preload)
function loadCustomerImages() {
  // image names: customer1_side.png, customer1_front.png, etc.
  for (let i = 1; i <= 5; i++) {
    customerSideImages['customer' + i] = loadImage('images/restaurant/customers/customer' + i + '_side.png');
    customerFrontImages['customer' + i] = loadImage('images/restaurant/customers/customer' + i + '_front.png');
  }
}

// apply per-customer modifiers such as tipMultiplier before money is added
function applyCustomerTipModifier(customer) {
  if (!customer || !customer.earningsInfo || customer.modifiersApplied) return;

  let info = customer.earningsInfo;
  let multiplier = (typeof customer.tipMultiplier === 'number') ? customer.tipMultiplier : 1.0;

  if (multiplier !== 1.0) {
    // adjust tip and total; keep base the same
    info.tip = Math.round(info.tip * multiplier * 100) / 100;
    info.total = info.base + info.tip;

    // refresh display text to show updated tip
    if (info.tip > 0) {
      info.displayText = `$${info.base} + $${info.tip} tip\n(${info.tipReason})`;
    } else {
      info.displayText = `$${info.base}\n(${info.tipReason})`;
    }
  }

  customer.modifiersApplied = true;
}

function updateCustomers() {
  // create new customers
  customerTimer++;
  if (customerTimer >= customerCreateInterval) {
    createCustomer();
    customerTimer = 0;
    // randomize next create interval
    customerCreateInterval = int(random(minCreateInterval, maxCreateInterval));
  }
  
  // update each customer
  for (let i = customers.length - 1; i >= 0; i--) {
    let customer = customers[i];
    
    if (customer.state === 'walking') {
      // Play walking sound continuously while walking (loop it)
      if (!customer.walkSoundPlaying && walkSound) {
        walkSound.loop();
        customer.walkSoundPlaying = true;
        console.log('Started walking sound for customer');
      }
      
      // check if there's another walking customer in front blocking the path
      let blocked = false;
      for (let other of customers) {
        if (other !== customer && other.state === 'walking') {
          // if another walking customer is ahead and close, slow down/stop
          if (other.x > customer.x && other.x < customer.x + 120) {
            blocked = true;
            break;
          }
        }
      }
      
      // walk from left to right (only if not blocked)
      if (!blocked) {
        customer.x += 4;
      }
      
      // reached target position - STOP WALKING SOUND
      if (customer.x >= customer.targetX) {
        customer.state = 'turning';
        customer.turnTimer = 0;
        
        // Stop walking sound when customer stops walking
        if (customer.walkSoundPlaying && walkSound) {
          walkSound.stop();
          customer.walkSoundPlaying = false;
          console.log('Stopped walking sound for customer');
        }
      }
    } else if (customer.state === 'turning') {
      // brief pause while turning
      customer.turnTimer++;
      if (customer.turnTimer >= 20) {
        customer.state = 'ordering';
        customer.facing = 'front';

        // start wait timer when they actually begin ordering
        customer.orderStartTime = millis();

        // one-time rating bonus for cozy environment customers
        if (customer.envCompliment && !customer.envBonusApplied) {
          customer.envRatingBonus = 0.2;   // store it
          customer.envBonusApplied = true;
        }
      }
    } else if (customer.state === 'ordering') {
      if (!customer.hasWaitedTooLong) {
        if (customer.envCompliment) {
          customer.dialogue = customer.order + '\nNice environment!';
        } else {
          customer.dialogue = customer.order;
        }
      }

      // waiting-time penalty: if they wait more than 20 seconds
      if (!customer.hasWaitedTooLong && customer.orderStartTime !== null) {
        let waitedMs = millis() - customer.orderStartTime;
        if (waitedMs > 25000) { // > 25 seconds
          customer.hasWaitedTooLong = true;
          customer.dialogue = customer.order + "\nI've been waiting...";
          // lower this customer's tips by 20%
          customer.tipMultiplier = 0.8;
          // store rating penalty to apply after they finish
          customer.waitRatingPenalty = -0.07;
        }
      }
      // waiting for food - check if dish is on their plate
      let plateIndex = customer.plateIndex;
       if (plateDishes[plateIndex] !== null) {
        // dish served!
        let servedDish = plateDishes[plateIndex].dishName;
        let servedIngredients = plateDishes[plateIndex].ingredientList || [];
        
        // Calculate earnings
        let earnings = calculateEarnings(customer.order, servedDish, servedIngredients);
        
        // Store earnings info for display
        customer.earningsInfo = earnings;

        customer.state = 'eating';
        customer.eatTimer = 0;
        
        // Play eating sound
        if (eatSound) {
          eatSound.play();
        }
      }
    } else if (customer.state === 'eating') {
      customer.dialogue = '...';
      customer.eatTimer++;
      if (customer.eatTimer >= 240) { // eat for 4 seconds
        // after eating, show the earnings calculation
        customer.state = 'postComment';
        customer.postTimer = 0;
        
        // Show earnings breakdown as dialogue
        if (customer.earningsInfo) {
          customer.dialogue = customer.earningsInfo.displayText;
        } else {
          customer.dialogue = customer.postEatDialogue || 'Thanks!';
        }
      }
    } else if (customer.state === 'postComment') {
      // brief window to display the after-eating comment and earnings
      customer.postTimer++;
      if (customer.earningsInfo && !customer.modifiersApplied) {
        applyCustomerTipModifier(customer);
      }
      if (customer.postTimer >= 90) { // ~1.5s to read earnings
        // ADD MONEY TO TOTAL FIRST (before leaving)
        if (customer.earningsInfo && !customer.moneyAdded) {
          totalMoney += customer.earningsInfo.total;
          customer.moneyAdded = true; // flag to prevent double-adding
          console.log('Added $' + customer.earningsInfo.total + ' to total. New total: $' + totalMoney);

          dailyStats.dishesSold++;
          dailyStats.baseEarnings += customer.earningsInfo.base;
          dailyStats.tipsEarned += customer.earningsInfo.tip;
          dailyStats.totalEarnings += customer.earningsInfo.total;

          // collect all rating pieces:
          // 1) from food quality (calculateEarnings)
          // 2) décor compliment bonus (if any)
          // 3) waiting-time penalty (if any)
          const decorBonus   = customer.envRatingBonus    || 0;
          const waitPenalty  = customer.waitRatingPenalty || 0;
          const foodRating   = customer.earningsInfo.ratingChange || 0;
          const totalRatingDelta = foodRating + decorBonus + waitPenalty;

          dailyStats.ratingChange += totalRatingDelta;
          currentRating = constrain(currentRating + totalRatingDelta, 0, 5);
          
          // Play coin sound when money is added
          if (coinSound) {
            coinSound.play();
          }
        }
        
        // Show floating earnings message
        if (customer.earningsInfo) {
          addEarningsMessage(
            '+$' + customer.earningsInfo.total,
            platePositions[customer.plateIndex].x,
            platePositions[customer.plateIndex].y - 50
          );
        }
        
        // clear plate and leave
        plateDishes[customer.plateIndex] = null;
        customer.state = 'leaving';
        customer.facing = 'side'; // turn to side when leaving
      }
    } else if (customer.state === 'leaving') {
      // walk off to the right and fade out
      customer.x += 2;
      customer.alpha -= 5; // gradually fade out
      
      // Make sure walking sound is stopped when leaving
      if (customer.walkSoundPlaying && walkSound) {
        walkSound.stop();
        customer.walkSoundPlaying = false;
      }
      
      if (customer.alpha <= 0) {
        customers.splice(i, 1); // remove customer
      }
    }
  }
}

function drawCustomers() {
  // draw in two passes: walking customers first (behind), then stationary customers (front)
  
  // PASS 1: Draw walking and leaving customers (behind)
  for (let customer of customers) {
    if (customer.state === 'walking' || customer.state === 'leaving') {
      push();
      imageMode(CENTER);
      
      // apply alpha for fade out effect
      tint(255, customer.alpha);
      
      // draw customer image based on facing direction
      let img = customerSideImages[customer.type];
      
      if (img) {
        image(img, customer.x, customer.y, 100, 150); // half body size
      }
      
      noTint(); // reset tint
      
      // draw dialogue text above head (also fade with customer)
      if (customer.dialogue) {
        fill(255, 255, 255, customer.alpha);
        stroke(0, 0, 0, customer.alpha);
        strokeWeight(2);
        textAlign(CENTER);
        textSize(16);
        text(customer.dialogue, customer.x, customer.y - 90);
      }
      
      pop();
    }
  }
  
  // PASS 2: Draw turning, ordering, and eating customers (in front)
  for (let customer of customers) {
    if (customer.state === 'turning' || customer.state === 'ordering' || customer.state === 'eating' || customer.state === 'postComment') {
      push();
      imageMode(CENTER);
      
      // apply alpha for fade out effect
      tint(255, customer.alpha);
      
      // draw customer image based on facing direction
      let img;
      if (customer.facing === 'side') {
        img = customerSideImages[customer.type];
      } else {
        img = customerFrontImages[customer.type];
      }
      
      if (img) {
        image(img, customer.x, customer.y, 100, 150); // half body size
      }
      
      noTint(); // reset tint
      
      // draw dialogue text above head (also fade with customer)
      if (customer.dialogue) {
        // For earnings display (postComment state), use multi-line and smaller text
        if (customer.state === 'postComment' && customer.earningsInfo) {
          fill(255, 215, 0, customer.alpha); // gold for money
          stroke(0, 0, 0, customer.alpha);
          strokeWeight(2);
          textAlign(CENTER);
          textSize(13);
          
          // Split by newlines and draw each line
          let lines = customer.dialogue.split('\n');
          let lineHeight = 16;
          let startY = customer.y - 90 - ((lines.length - 1) * lineHeight / 2);
          
          for (let i = 0; i < lines.length; i++) {
            text(lines[i], customer.x, startY + (i * lineHeight));
          }
        } else {
          // normal dialogue
          fill(255, 255, 255, customer.alpha);
          stroke(0, 0, 0, customer.alpha);
          strokeWeight(2);
          textAlign(CENTER);
          textSize(16);
          const lines = String(customer.dialogue || '').split('\n');
          const lineHeight = 18;
          const totalHeight = (lines.length - 1) * lineHeight;
          const baseY = customer.y - 95;       // slightly higher than -90
          const startY = baseY - totalHeight;  // if 2+ lines, shift the whole block upward

          for (let i = 0; i < lines.length; i++) {
            text(lines[i], customer.x, startY + i * lineHeight);
          }
        }
        // if customer is ordering, check if dish is still available
        if (customer.state === 'ordering') {
          let orderedDish = menuItems.find(item => item.name === customer.order);
          let isDishAvailable = orderedDish && orderedDish.unlocked && orderedDish.available && hasIngredientsForDish(orderedDish.name);
          
          if (!isDishAvailable) {
            // button positioned below the dialogue
            let buttonX = customer.x - 40;
            let buttonY = customer.y - 65;
            let buttonWidth = 80;
            let buttonHeight = 20;
            
            let isHovered = mouseX > buttonX && mouseX < buttonX + buttonWidth &&
                            mouseY > buttonY && mouseY < buttonY + buttonHeight;
            
            // check if mouse is near the customer OR hovering over button
            let distanceToCustomer = dist(mouseX, mouseY, customer.x, customer.y - 50);
            
            // fade in when mouse gets close (within 120 pixels) OR when hovering button
            let maxDistance = 120;
            let shouldShow = distanceToCustomer < maxDistance || isHovered;
            
            if (shouldShow) {
              // calculate fade based on distance (but full opacity when hovering button)
              let fadeAmount;
              if (isHovered) {
                fadeAmount = customer.alpha; // full opacity when hovering
              } else {
                fadeAmount = map(distanceToCustomer, maxDistance, 0, 0, customer.alpha);
                fadeAmount = constrain(fadeAmount, 0, customer.alpha);
              }
              
              // subtle glow effect when hovered
              if (isHovered) {
                fill(255, 100, 100, fadeAmount * 0.3);
                noStroke();
                rect(buttonX - 3, buttonY - 3, buttonWidth + 6, buttonHeight + 6, 7);
              }
              
              // button background
              fill(isHovered ? color(220, 60, 60, fadeAmount) : color(180, 50, 50, fadeAmount));
              stroke(255, 255, 255, fadeAmount * 0.8);
              strokeWeight(1.5);
              rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
              
              // button text
              fill(255, 255, 255, fadeAmount);
              noStroke();
              textAlign(CENTER, CENTER);
              textSize(isHovered ? 12 : 11);
              textStyle(BOLD);
              text('SOLD OUT', buttonX + buttonWidth/2, buttonY + buttonHeight/2);
              textStyle(NORMAL);
              
              // optional: small warning icon (triangle with !)
              if (isHovered) {
                fill(255, 255, 255, fadeAmount);
                textSize(10);
                // text('⚠', buttonX - 10, buttonY + buttonHeight/2);
              }
            }
          }
        }
      }
      pop();
    }
  }
}

function checkSoldOutButtons() {
  // check for clicks on "Sold Out" buttons for customers whose dishes are unavailable
  for (let customer of customers) {
    if (customer.state === 'ordering') {
      // check if this customer's order is no longer servable
      let orderedDish = menuItems.find(item => item.name === customer.order);
      let isDishAvailable = orderedDish && orderedDish.unlocked && orderedDish.available && hasIngredientsForDish(orderedDish.name);
      
      if (!isDishAvailable) {
        // calculate button position (below the customer's order dialogue)
        let buttonX = customer.x - 50;
        let buttonY = customer.y - 60;
        let buttonWidth = 100;
        let buttonHeight = 25;
        
        // check if mouse is over the button
        if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && mouseY < buttonY + buttonHeight) {
          
          console.log('Sold out - customer leaving without payment');
          let ratingPenalty = -0.05;
          dailyStats.ratingChange += ratingPenalty;
          currentRating = constrain(currentRating + ratingPenalty, 0, 5);
          console.log('Rating penalty: ' + ratingPenalty + ' → New rating: ' + currentRating.toFixed(1));
          
          // customer leaves immediately
          customer.state = 'leaving';
          customer.facing = 'side';
          customer.dialogue = 'Sold out...';
          
          // clear their plate
          plateDishes[customer.plateIndex] = null;
          
          // play error sound
          if (errorSound) {
            errorSound.play();
          }
          
          return true; // click was handled
        }
      }
    }
  }
  return false;
}

function createCustomer() {
  // choose a customer type that is NOT currently active
  const availableTypes = getAvailableCustomerTypes();
  if (availableTypes.length === 0) {
    console.log('All customer types are already on-screen; skipping spawn.');
    return;
  }
  const customerType = availableTypes[int(random(availableTypes.length))];

  // filter only SERVABLE dishes (unlocked + available + has ingredients)
  const availableDishes = menuItems.filter(item => 
    item.unlocked && item.available && hasIngredientsForDish(item.name)
  );
  if (availableDishes.length === 0) {
    console.log('No available dishes! Customer cannot be created.');
    return;
  }
  
  const randomDishItem = availableDishes[int(random(availableDishes.length))];
  const randomDish = randomDishItem.name;

  // track which plates are occupied by customers (count all states so we don't double-seat)
  const occupiedPlates = new Set(customers.map(c => c.plateIndex));
  // find free plates
  const freePlates = [];
  for (let i = 0; i < 3; i++) {
    if (!occupiedPlates.has(i)) freePlates.push(i);
  }
  if (freePlates.length === 0) {
    console.log('All 3 plates occupied! No room for new customer.');
    return;
  }

  // choose a free plate
  const plateIndex = freePlates[int(random(freePlates.length))];
  const targetX = platePositions[plateIndex].x;

  const newCustomer = {
    x: -100, // start off-screen left
    y: platePositions[plateIndex].y - 144,
    targetX: targetX,
    plateIndex: plateIndex,
    type: customerType,
    facing: 'side',
    state: 'walking', // walking -> turning -> ordering -> eating -> postComment -> leaving
    order: randomDish,
    dialogue: null,
    turnTimer: 0,
    eatTimer: 0,
    alpha: 255,
    earningsInfo: null,
    moneyAdded: false, // flag to prevent double-adding money
    walkSoundPlaying: false // flag to track if walk sound is currently playing
  };

  let decorScore = (typeof getDecorationScore === 'function') ? getDecorationScore() : 0;
  if (decorScore > 0) { // NEW: only compliment if decorScore > 0
    let complimentChance = constrain(decorScore * 0.08, 0, 0.5);
    if (random() < complimentChance) {
      newCustomer.envCompliment = true;
    }
  }
  customers.push(newCustomer);
  console.log('New customer (' + customerType + ') ordering: ' + randomDish);
}
  
function checkCustomerOrder(plateIndex, dishName) {
  // find customer at this plate
  for (let customer of customers) {
    if (customer.plateIndex === plateIndex && customer.state === 'ordering') {
      if (dishName === customer.order) {
        customer.dialogue = 'Thanks!';
        return true;
      } else {
        customer.dialogue = 'It can be better.';
        return false;
      }
    }
  }
  return false;
}

function calculateEarnings(orderedDish, servedDish, servedIngredients) {
  // local helpers to avoid scope issues
  const getMenuItemByName = (name) => (menuItems || []).find(it => it.name === name) || null;
  const priceNumber = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return Number(String(priceStr).replace('$','')) || 0;
  };

  // prices
  const orderedItem = getMenuItemByName(orderedDish);
  if (!orderedItem) {
    console.log('ERROR: Could not find menu item for ' + orderedDish);
    return { base: 0, tip: 0, total: 0, ratingChange: 0, displayText: 'Error!' };  // ADDED ratingChange: 0
  }
  const orderedBase = priceNumber(orderedItem.price);

  // freshness (avg day number across served ingredients)
  let totalDay = 0, cnt = 0;
  for (const name of (servedIngredients || [])) {
    if (String(name).trim().toLowerCase() === 'rice') continue;
    const ing = ingredients.find(i => i.name === name);
    if (!ing) continue;
    const m = String(ing.freshness || '').match(/Day\s+(\d+)/i);
    if (m) { totalDay += Number(m[1]); cnt++; }
  }

  const isFresh = (cnt === 0) ? true : (totalDay / cnt) < 2;

  let base = 0, tip = 0, tipReason = '', displayText = '';
  let ratingChange = 0;  // NEW: Rating change for this customer

  if (servedDish === orderedDish) {
    // correct orders
    base = orderedBase;
    if (isFresh) {
      tip = 10;
      tipReason = 'Perfect. Exceptionally fresh!';
      ratingChange = 0.08;
    } else {
      tip = 5;
      tipReason = 'Good. Could be a bit fresher.';
      ratingChange = 0.04;
    }
  } else {
    // wrong orders
    const servedItem = getMenuItemByName(servedDish);
    const servedBase = servedItem ? priceNumber(servedItem.price) : orderedBase;
    base = Math.round(servedBase * 0.5);
    if (isFresh) {
      tip = 3;
      tipReason = 'Mixed up, but delicious and fresh.';
      ratingChange = -0.05;
    } else {
      tip = 0;
      tipReason = 'Not my order, and not very fresh.';
      ratingChange = -0.12;
    }
  }

  const total = base + tip;

  displayText = tip > 0
    ? `$${base} + $${tip} tip\n(${tipReason})`
    : `$${base}\n(${tipReason})`;

  console.log(`Earnings: $${base} base + $${tip} tip = $${total}, Rating: ${ratingChange > 0 ? '+' : ''}${ratingChange.toFixed(2)}`);
  return { base, tip, total, ratingChange, displayText, tipReason };  // ADDED ratingChange to return
}