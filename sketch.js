let backgroundImg;
let myGif; 




//button 
let playButton;
let gameStarted = false;

function preload(){
    backgroundImg = loadImage("images/DTD.png");
    myGif = loadImage("images/plants.gif");

}


function setup(){
    createCanvas(1400,800);
    //Button
    playButton = createButton("New Game");
    playButton.position(width / 2 - 200, height / 2 + 200); // center the button
    playButton.size(180, 60);
    playButton.style("font-size", "20px");
    playButton.style("color", "#bddcfdff");
    playButton.style("background-color", "#084387ff");
    playButton.style("border-radius", "8px");
    playButton.style("cursor", "pointer");
    playButton.style("font-family", "Quantico, sans-serif");
    // When clicked, go to another page
    playButton.mousePressed(() => {
        localStorage.removeItem("gameData");
        playButton.style("transform", "scale(0.95)");
        playButton.style("background-color", "#003d80");
        window.location.href = "day.html";  
    });

    //Button
    continueButton = createButton("Continue Game");
    continueButton.position(width / 2 - 10, height / 2 + 200); // center the button
    continueButton.size(180, 60);
    continueButton.style("font-size", "20px");
    continueButton.style("color", "#bddcfdff");
    continueButton.style("background-color", "#084387ff");
    continueButton.style("border-radius", "8px");
    continueButton.style("cursor", "pointer");
    continueButton.style("font-family", "Quantico, sans-serif");
    // When clicked, go to another page
    continueButton.mousePressed(() => {
        continueButton.style("transform", "scale(0.95)");
        continueButton.style("background-color", "#003d80");
        window.location.href = "day.html";  // change this to your desired page
    });
}


function draw(){
 
  image(backgroundImg, 0, 0, width, height);
  image(myGif, 0, 0, width, height);

}

function startGame() {
  playButton.style("border", "solid");
  gameStarted = true;

}