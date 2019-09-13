
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
music.play();

canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");

//global constants
let gameStarted = false;
const gravity = 0.8;
const ground = canvas.height/1.3;//use this for the land above the burrow
const bearSpeed = 5;
const leftBounds = -1000;
const rightBounds = canvas.width + 1000;
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



class Player{
    constructor(){
        this.width = 50;
        this.height = 50;
        this.x = 100;
        this.y = familyAttrs.y;
        this.dx = 0;
        this.dy = 0;
        this.moveRight = false;
        this.moveLeft = false;
        this.right = true;
        this.left = false;
        this.jumped = false;
        this.spikeSize = 30;
        this.health = 5;
        this.food = 10;
        this.inBurrow = true;
        this.backDamage = 10;
        this.spikeDamage = 5;
    }

    draw(){
        //draw player stats
        ctx.font = "30px Arial";
        
        let hearts = 'Health: ';
        let berries = 'Food: ';
        for(let i = 0; i < this.health; i++){
            hearts += '❤️';
        }        
        for(let i = 0; i < this.food; i++){
            berries += '🍓';
        }
        ctx.fillText(hearts, 10, 50);
        ctx.fillText(berries, 10, 100);

        if(this.right){
            ctx.drawImage(porcupine,0, 0, 256, 256, this.x-this.width+10, this.y-this.height+5,this.width*3,this.height*3);
        }
        else if(this.left){
            ctx.drawImage(porcupine, 256, 0, 512, 256, this.x-this.width-10, this.y-this.height+5, this.width*6, this.height*3);
        }
    }

    update(){
        
        //drop food by one
        this.food -= 0.01;

        //if not on ground
        if(this.y + this.height < ground){
            this.dy += gravity;
            this.y += this.dy;
        }
        if(this.jumped){
            this.y += this.dy;
        }
        //if below ground and not in burrow
        if(this.y + this.height > ground && !this.inBurrow){
            this.jumped = false;
            // to not get stuck in the ground
            this.y = ground - this.height;
        }

        //move in the direction of the keydown
        this.x += this.dx;


        // keep within the canvas
        if (this.x < 0){
          this.x = 0;
        }
        else if (this.x + this.width > canvas.width){
          this.x = canvas.width - this.width;
        }


        //check to see if in burrow
        if(this.inBurrow){
            this.y = familyAttrs.y;
        }

        //if player is in stockpile
        if(hitSquare(this, stockPile) && this.food > 10){
            this.food--;
            stockPile.food++;
        }
    }

    jump(){
        if(!this.inBurrow){
            this.dy = -10;
            this.jumped = true;
        }else if(this.x > burrowOpening.x && this.x < burrowOpening.x + burrowOpening.width && this.inBurrow){
            this.inBurrow = false;
            this.y = ground;
        }
    }

    fall(){
      // can only fall when rising
      if (this.dy < 0 && !this.inBurrow){
        this.dy = this.dy * 0.2; // setting it to zero made it too...magentic
      }
    }

    moveDown(){
        //if over the burrow opening
        if(this.x > burrowOpening.x && this.x < burrowOpening.x + burrowOpening.width){
            this.inBurrow = true;
        }
    }

    shoot(){
        let direction;
        if(this.right){
            direction = 'right';
        }else{
            direction = 'left';
        }
        bulletArray.push(new Bullet(this.x, this.y + this.height/2, direction));
        this.food--;
    }

}

class Bullet{
    constructor(x,y, direction){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.direction = direction;
        this.dx = 0;
    }
    update(){
        if(this.direction == 'right'){
            this.dx = 10;
        }else{
            this.dx = -10;
        }

        this.x += this.dx;
    }
    draw(){
        ctx.font = "30px Arial";
        ctx.fillText('🍓', this.x, this.y);
    }
}

class Enemy{
    constructor(x, dx){
        this.width = 100;
        this.height = 200;
        this.x = x;
        this.y = ground - this.height;
        this.dx = dx;
        this.dy = 0;
        this.food = 2;
    }

    draw(){
        if(this.dx > 0){
            ctx.drawImage(bear, 272, 0, 544, 272, this.x-50, this.y, this.width*4, this.height);
        }
        else{
            ctx.drawImage(bear, 0, 0, 272, 272, this.x-50, this.y, this.width*2, this.height);
        }
    }

    update(){
        this.x += this.dx;

        //increase speed in relation to how much food the player is holding
        this.dx = 0;
        for (let i = 0; i < player.food; i++) {
            this.dx += 1;
        }

        if(this.food != 0){
            for (let i = 0; i < foodArray.length; i++) {
                if(hitDot(this, foodArray[i])){
                    this.food--;
                    foodArray.splice(i, 1);
                }
            }
        }
    }
}

class Food{
    constructor(x,y,radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    draw(){
        ctx.fillText('🍓', this.x-this.radius, this.y+this.radius);
    }
}

class Family{
    constructor(x,y,dx){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.width = familyAttrs.width;
        this.height = familyAttrs.height;
        this.dy = 0;
        this.food = 10;
        this.health = 1;
        this.right = true;
        this.left = false;
        if(this.dx == 0){
            this.dx++;
        }
    }

    draw(){
        if(this.dx > 0){
            ctx.drawImage(porcupine,0, 0, 256, 256, this.x-this.width+10, this.y-this.height+5,this.width*3,this.height*3);
        }
        else{
            ctx.drawImage(porcupine, 256, 0, 512, 256, this.x-this.width-10, this.y-this.height+5, this.width*6, this.height*3);
        }
        //draw food
        let berries = '';
        for(let i = 0; i < this.food; i++){
            berries += '🍓';
        }
        ctx.font = "12px Arial";
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(berries, this.x, this.y);
    }

    update(){
        if(this.x + this.width > canvas.width || this.x < 30){
            this.dx *= -1;
        }

        this.x += this.dx;
        this.food -= 0.008;

        //if the family hit the storage gives food
        if(hitSquare(this, stockPile) && stockPile.food > 0 && this.food < 10){
            stockPile.food--;
            this.food++;
            
        }
        if(this.x + this.width <= stockPile.x){
            //take one away from stockpile
            stockPile.food--;
            this.food++;
            //add one food

        }
    }
}

/*
    Add a location to store the food
*/
class StockPile{
    constructor(){
        this.width = burrowOpening.width;
        this.height = burrowOpening.height*3;
        this.x = 30;
        this.y = canvas.height-this.height;
        this.food = 10;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
        //draw the food
        ctx.font = "30px Arial bold";
        ctx.fillStyle = "white";
        ctx.fillText('Storage:', this.x, this.y+20);
        ctx.fillText('🍓 x' + this.food, this.x, this.y+this.height/2);
    }

    addFood(){

    }
}

function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hitDot(mouse, dot){
    //we need to check if its past the line of x
    if(mouse.x + mouse.width > dot.x - dot.radius &&//right side of square left side of dot
        mouse.y < dot.y + dot.radius &&//top of square bottom of dot
        mouse.x < dot.x + dot.radius &&
        mouse.y + mouse.height > dot.y + dot.radius){
            return true;
    }
}

//checks if the player hit the enemy
function hitEnemy(sq1, sq2){
    if(sq1.y < sq2.y + sq2.height &&//check square 1 top
        sq1.y + sq1.height > sq2.y&&//check square 1 bottom
        sq1.x < sq2.x + sq2.width &&//check square 1 left
        sq1.x + sq1.width > sq2.x)
    {//check square 1 right
        if(sq2.dx > 0 && sq1.right != true || sq2.dx < 0 && sq1.left != true){
            player.health--;
        }
        return true;
    }
}

function hitSquare(sq1, sq2){
    if(sq1.y < sq2.y + sq2.height &&//check square 1 top
        sq1.y + sq1.height > sq2.y&&//check square 1 bottom
        sq1.x < sq2.x + sq2.width &&//check square 1 left
        sq1.x + sq1.width > sq2.x)
    {//check square 1 right
        return true;
    }
}


function update(dt){

    //player updates to use delta time
    if(player.moveRight){
        player.x += 1/2 * dt;
    }
    if(player.moveLeft){
        player.x -= 1/2 * dt;
    }
    if(!player.moveLeft && !player.moveRight){
        player.dx = 0;
    }
    player.update();


    //check if hit food
    for (let i = 0; i < foodArray.length; i++) {
        if(hitDot(player, foodArray[i])){
            foodArray.splice(i, 1);
            player.food+=1;
        }
    }

    //update family
    for (let i = 0; i < familyArray.length; i++) {
        familyArray[i].update();
        if(familyArray[i].food <= 0){
            gameover();
        }
    }
    
    //update enemyArray
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].update();

        //if enemy is out of bounds
        if(hitEnemy(player, enemyArray[i]) || enemyArray[i].x > rightBounds || enemyArray[i].x < leftBounds){
            enemyArray.splice(i, 1);
        }
    }

    //update bulletArray
    for (let i = 0; i < bulletArray.length; i++) {
        bulletArray[i].update();

        //if out of bounds;
        if(bulletArray[i].x > canvas.width || bulletArray[i].x < 0){
            bulletArray.splice(i, 1);
        }

        //if hit enemy
    }

    //check gameover state
    if(player.health <= 0 || player.food <= 0){
        gameover();
    }
    score++;
}

//draw everything
function render(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    if(!continueAnimation){
       ctx.font = "50px Arial bold";
       ctx.fillStyle = 'white';
       ctx.fillText('GAME OVER, YOU LOSE', canvas.width/3, canvas.height/2.5);
       ctx.fillText('Score: ' + score, canvas.width/3, canvas.height/2);
       ctx.fillText('Press r to restart', canvas.width/3, canvas.height/1.5);
       
    }else{
        //draw score
        ctx.font = "20px Arial bold";
        ctx.fillStyle = 'black';
        ctx.fillText('Score: ' + score, canvas.width-200, 50);

        //draw foodarea
        ctx.closePath();
        ctx.beginPath();
        // using an image for the bush
        ctx.drawImage(bush, canvas.width/2, ground-100-ballRadius, canvas.width/4, 100+ballRadius*2);

        //draw ground
        ctx.closePath();
        ctx.beginPath();
        ctx.rect(0, ground, canvas.width, canvas.height);
        ctx.fillStyle = 'saddlebrown';
        ctx.fill();

        //draw burrow
        ctx.closePath();
        ctx.beginPath();
        ctx.rect(30, ground+30, canvas.width-30, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fill();

        //draw burrow opening
        ctx.closePath();
        ctx.beginPath();
        ctx.rect(burrowOpening.x, burrowOpening.y, burrowOpening.width, burrowOpening.height);
        ctx.fillStyle = 'black';
        ctx.fill();

        //draw player
        player.draw();

        //draw food
        for (let i = 0; i < foodArray.length; i++) {
            foodArray[i].draw();
        }

        //draw enemies
        for (let i = 0; i < enemyArray.length; i++) {
            enemyArray[i].draw();
        }

        //draw family
        for (let i = 0; i < familyArray.length; i++) {
            familyArray[i].draw();
        }

        //update enemyArray
        for (let i = 0; i < bulletArray.length; i++) {
            bulletArray[i].draw();
        }

        //draw stockpile
        stockPile.draw();
    }
}


function gameover(){
    continueAnimation = false;
}


//this is what handles the game loop
function animate(){
    if(continueAnimation){
        let now = Date.now();
        let dt = now - lastUpdate;
        lastUpdate = now;

        update(dt);
        render(dt);
        requestAnimationFrame(animate);
    }
}

function start(){
    
    document.getElementById('start_screen').style.display = 'none';
    document.getElementById('canvas').style.display = 'block';
    player = new Player();
    
    //set gameloop condition to true
    continueAnimation = true;

    animationId = requestAnimationFrame(animate);
    
    //since this is on load we only have one setinterval which makes this object creation not bad
    //maybe we use delta time in the update function to create these objects
    foodInterval = setInterval(()=>{
        if(foodArray.length < 15){
            foodArray.push(new Food(randomInt(canvas.width/2, canvas.width/1.35), randomInt(ground-100,ground-20), ballRadius));
        }
    }, 500);

    enemyInterval = setInterval(()=>{
        //also add enemies, maybe a different interval
        //we need to check where the player is
        //get random position for either side of the screen
        if(enemyArray.length < 10){
            if(randomInt(0,1) == 0){
                enemyArray.push(new Enemy(randomInt(leftBounds, 0), 5));
            }else{
                enemyArray.push(new Enemy(randomInt(canvas.width, rightBounds), -5));
            }
        }
    }, 2500);

    familyArray.push(new Family(randomInt(30, canvas.width-30), familyAttrs.y, randomInt(-10,-5)));
    familyArray.push(new Family(randomInt(30, canvas.width-30), familyAttrs.y, randomInt(5,10))); 

    //create stockpile obj on game start
    stockPile = new StockPile();
}

function reset(){
    player = new Player();
    
    //set gameloop condition to true
    continueAnimation = true;            
    
    //clear intervals
    clearInterval(foodInterval);
    clearInterval(enemyInterval);
    //clear arrays
    familyArray = [];
    enemyArray = [];
    foodArray = [];

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
            if(randomInt(0,1) == 0){
                enemyArray.push(new Enemy(randomInt(leftBounds, 0), 5));
            }else{
                enemyArray.push(new Enemy(randomInt(canvas.width, rightBounds), -5));
            }
        }
    }, 2500);

    

    familyArray.push(new Family(randomInt(30, canvas.width-30), familyAttrs.y, randomInt(-10,-5)));
    familyArray.push(new Family(randomInt(30, canvas.width-30), familyAttrs.y, randomInt(5,10))); 

    //create stockpile obj on game start
    stockPile = new StockPile();
}

document.addEventListener('keydown', (e)=>{
    if(e.keyCode == 39){//right
        player.moveRight = true;
        player.right = true;
        player.left = false;
    }
    if(e.keyCode == 37){//left
        player.moveLeft = true;
        player.right = false;
        player.left = true;
    }
    if(e.keyCode == 38 && player.jumped == false){//up
        player.jump();
    }
    if(e.keyCode == 40 && player.jumped == false){//down
        player.moveDown();
    }
    if((e.keyCode == 32 || e.keyCode == 13) && gameStarted == false){
        gameStarted = true;
        start();
    }

    if(e.keyCode == 32 && gameStarted){
        player.shoot();
    }

    if(e.keyCode == 82){
        reset();
    }
    

});

document.addEventListener('keyup', (e)=>{
    if(e.keyCode == 39){//right
        player.moveRight = false;
    }
    if(e.keyCode == 37){//left
        player.moveLeft= false;
    }
    if(e.keyCode == 38){//up
      player.fall();
    }
});

document.getElementById('start_button').addEventListener('click', ()=>{
    if(gameStarted == false){
        gameStarted = true;
        start();
    }
});

/* Slider info */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}