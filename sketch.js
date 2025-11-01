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
    playButton = createButton("Play Game");
    playButton.position(width / 2 - 100, height / 2 + 200); // center the button
    playButton.size(180, 60);
    playButton.style("font-size", "30px");
    playButton.style("color", "#bddcfdff");
    playButton.style("background-color", "#084387ff");
    playButton.style("border-radius", "8px");
    playButton.style("cursor", "pointer");
    playButton.style("font-family", "Quantico, sans-serif");
    // When clicked, go to another page
    playButton.mousePressed(() => {
        playButton.style("transform", "scale(0.95)");
        playButton.style("background-color", "#003d80");
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