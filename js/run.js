


//globals non-constants variables
let canvas,
    player,
    ctx,
    foodArray = [],
    enemyArray = [],
    familyArray = [],
    bulletArray = [],
    lastUpdate = Date.now(),
    continueAnimation = false,
    stockPile,
    score = 0,
    enemyInterval,
    foodInterval;


//sprites
var porcupine = new Image();
porcupine.src = "porcupine.png";

var bush = new Image();
bush.src = "bush.png";

var bear = new Image();
bear.src = "bear.png";

var music = new Audio("explosion.mp3");

/* Slider info */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");

//global constants
let gameStarted = false;
const gravity = 0.8;
const ground = canvas.height/1.3;//use this for the land above the burrow
const bearSpeed = 5;
const leftBounds = -100;
const rightBounds = canvas.width + 100;
const ballRadius = 10;
const burrowOpening = {
    x: 100,
    y: ground,
    width: 100,
    height: 40
}
const familyAttrs = {
    width: 50,
    height: 50,
    x: canvas.width/1.2,
    y: canvas.height - 50,
};

let game = new Game();
let controller = new Controller(canvas);


//start game
document.getElementById('start_button').addEventListener('click', ()=>{
    if(gameStarted == false){
        music.volume = slider.value/100;
        reset();
    }
});
// document.getElementById('start_screen').addEventListener('click', ()=>{
//     //start game
//     init();
// });


document.addEventListener('keydown', (e)=>{
    if(e.keyCode == 39 || e.keyCode == 68){//right
        player.moveRight = true;
        player.right = true;
        player.left = false;
    }
    if(e.keyCode == 37 || e.keyCode == 65){//left
        player.moveLeft = true;
        player.right = false;
        player.left = true;
    }
    if(e.keyCode == 87 || e.keyCode == 38 && player.jumped == false){//up
        player.jump();
    }
    if(e.keyCode == 83 && player.jumped == false){//down
        player.moveDown();
    }
    if((e.keyCode == 32 || e.keyCode == 13) && gameStarted == false){
        music.volume = slider.value/100;
        reset();
    }

    if(e.keyCode == 32 && gameStarted && continueAnimation){
        player.shoot();
        music.play();
    }

    if(e.keyCode == 82){
        reset();
    }
    

});

document.addEventListener('keyup', (e)=>{
    if(e.keyCode == 39  || e.keyCode == 68){//right
        player.moveRight = false;
    }
    if(e.keyCode == 37  || e.keyCode == 65){//left
        player.moveLeft= false;
    }
    if( e.keyCode == 87 ||  e.keyCode == 38){//up
      player.fall();
    }
});


canvas.addEventListener('mousemove', (evt)=>{
    //controller.move(evt.x, evt.y);
});


canvas.addEventListener('touchmove', function(e){
    let x,y;
    x = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
    y = e.changedTouches[0].clientY - canvas.getBoundingClientRect().top;
    controller.move(x, y, false);

    //update mobileViewport; Suggestion: cancel when fish gets X big
    updateMobView(x, y);
});

canvas.addEventListener('touchstart', function(e){
    let x,y;
    x = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
    y = e.changedTouches[0].clientY - canvas.getBoundingClientRect().top;
    controller.move(x, y, true);

    //update mobileViewport; Suggestion: cancel when fish gets X big
    updateMobView(x, y);
});

//to hide the mobileViewport when not in use
canvas.addEventListener('touchend', function(e){
    controller.stopMove();
    mobileView.style.display = "none";
});

canvas.addEventListener('click', ()=>{

});




/**
 * Main Game Loop
 * 
 */
function animate(){
    if(continueAnimation){
        
        let now = Date.now();
        let dt = now - lastUpdate;
        lastUpdate = now;

        game.update(dt);
        game.draw(dt);
        
    }

    //hoping this fixes the reset bug for now
    requestAnimationFrame(animate);
}

/**
 * This will start the game
 */
function init(){
    //hide start and show canvas
    document.getElementById('start_screen').style.display = "none";
    canvas.style.display = "block";
    animate();
}

// function reset(){
//     document.getElementById('start_screen').style.display = "block";
//     canvas.style.display = "none";
//     game = new Game();
// }


function reset(){

    if(!gameStarted){
        gameStarted = true;
        document.getElementById('start_screen').style.display = 'none';
        document.getElementById('canvas').style.display = 'block';
        requestAnimationFrame(animate);
    }
    

    score = 0;

    player = new Player();
    player.food = 10;
    
    //set gameloop condition to true
    continueAnimation = true;            
    console.log(continueAnimation);
    
    
    //clear intervals
    clearInterval(foodInterval);
    clearInterval(enemyInterval);
    //clear arrays
    familyArray = [];
    enemyArray = [];
    foodArray = [];
    bulletArray = [];

    foodInterval = setInterval(()=>{
        if(foodArray.length < 5){
            foodArray.push(new Food(randomInt(canvas.width/2, canvas.width/1.35), randomInt(ground-100,ground-20), ballRadius));
        }
    }, 500);

    enemyInterval = setInterval(()=>{
        //also add enemies, maybe a different interval
        //we need to check where the player is
        //get random position for either side of the screen
        if(enemyArray.length < 10){
            
            if(randomInt(0,2) >= 1){
                enemyArray.push(new Enemy(randomInt(leftBounds, 0), 5));
            }else{
                enemyArray.push(new Enemy(randomInt(canvas.width, canvas.width+10), -5));
            }
        }
    }, 2000);

    

    familyArray.push(new Family(randomInt(30, canvas.width-30), familyAttrs.y, randomInt(-10,-5)));
    familyArray.push(new Family(randomInt(30, canvas.width-30), familyAttrs.y, randomInt(5,10))); 

    //create stockpile obj on game start
    stockPile = new StockPile();
}
