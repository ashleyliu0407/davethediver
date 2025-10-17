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