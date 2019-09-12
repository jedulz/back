
//globals non-constants variables
let canvas,
    player,
    ctx,
    foodArray = [],
    enemyArray = [],
    familyArray = [],
    lastUpdate = Date.now(),
    continueAnimation = false;


//sprites
var porcupine = new Image();
porcupine.src = "porcupine.png";

var bush = new Image();
bush.src = "bush.png";

//canvas intialization
canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");

//globals
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
        this.y = canvas.height - this.height;
        this.dx = 0;
        this.dy = 0;
        this.moveRight = false;
        this.moveLeft = false;
        this.right = true;
        this.left = false;
        this.jumped = false;
        this.spikeSize = 30;
        this.health = 5;
        this.hunger = 100;
        this.inBurrow = false;
    }

    draw(){
        //draw player stats
        ctx.font = "30px Arial";
        
        let hearts = '';
        let grapes = '';
        for(let i = 0; i < this.health; i++){
            hearts += '❤️';
        }        
        for(let i = 0; i < this.hunger/10; i++){
            grapes += '🍓';
        }
        ctx.fillText(hearts, 10, 50);
        ctx.fillText(grapes, 10, 100);

        if(this.right){
            ctx.drawImage(porcupine,0, 0, 256, 256, this.x-this.width+10, this.y-this.height+5,this.width*3,this.height*3);
        }
        else if(this.left){
            ctx.drawImage(porcupine, 256, 0, 512, 256, this.x-this.width-10, this.y-this.height+5, this.width*6, this.height*3);
        }
    }

    update(){
        //drop hunger by one
        this.hunger-= 0.05;

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
    }

    jump(){
        if(!this.inBurrow){
            this.dy = -10;
            this.jumped = true;
        }else if(this.x > burrowOpening.x && this.x < burrowOpening.x + burrowOpening.width && this.inBurrow){
            console.log('going to ground');
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

}

class Enemy{
    constructor(x, dx){
        this.width = 100;
        this.height = 200;
        this.x = x;
        this.y = ground - this.height;
        this.dx = dx;
        this.dy = 0;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'blue';
        ctx.fill();
    }

    update(){
        this.x += this.dx;
    }
}

class Food{
    constructor(x,y,radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    draw(){
        ctx.fillText('🍓', this.x, this.y);
    }
}

class Family{
    constructor(){
        this.width = familyAttrs.width;
        this.height = familyAttrs.height;
        this.dx = 0;
        this.dy = 0;
        this.x = canvas.width/1.2;
        this.y = familyAttrs.y;
        this.hunger = 100;
        this.health = 1;
        this.right = true;
        this.left = false;
    }

    draw(){
        if(this.right){
            ctx.drawImage(porcupine,0, 0, 256, 256, this.x-this.width+10, this.y-this.height+5,this.width*3,this.height*3);
        }
        else if(this.left){
            ctx.drawImage(porcupine, 256, 0, 512, 256, this.x-this.width-10, this.y-this.height+5, this.width*6, this.height*3);
        }
    }

    update(){
        //move left to right
        if(this.left){
            this.dx = -3;
        }else{
            this.dx = 3;
        }
        
        //go back and forth in the burrow
        if(this.x + this.width > canvas.width){
            this.right = false;
            this.left = true;
        }else if(this.x < 30){
            this.right = true;
            this.left = false;
        }

        this.x += this.dx;
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
            player.hunger+=10;
        }
    }

    //update family
    for (let i = 0; i < familyArray.length; i++) {
        familyArray[i].update();
    }
    
    //update enemyArray
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].update();

        //if enemy is out of bounds
        if(hitEnemy(player, enemyArray[i]) || enemyArray[i].x > rightBounds || enemyArray[i].x < leftBounds){
            enemyArray.splice(i, 1);
        }
    }

    //check gameover state
    if(player.health <= 4 || player.hunger <= 0){
        console.log('gameover');
        //draw one last time
       ctx.font = "50px Arial bold";
       ctx.fillStyle = 'white';
       ctx.fillText('GAME OVER, YOU LOSE', canvas.width/3, canvas.height/2.5);
        gameover();
    }
}

//draw everything
function render(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    if(!continueAnimation){
       ctx.font = "50px Arial bold";
       ctx.fillStyle = 'white';
       ctx.fillText('GAME OVER, YOU LOSE', canvas.width/3, canvas.height/2.5);
       
    }else{

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

//finish loading everything and then start our game
window.onload = function(){
    player = new Player();
    
    //set gameloop condition to true
    continueAnimation = true;

    requestAnimationFrame(animate);
    
    //since this is on load we only have one setinterval which makes this object creation not bad
    //maybe we use delta time in the update function to create these objects
    setInterval(()=>{
        if(foodArray.length < 5){
            foodArray.push(new Food(randomInt(canvas.width/2, canvas.width/1.35), randomInt(ground-100,ground-20), ballRadius));
        }
    }, 500);

    setInterval(()=>{
        //also add enemies, maybe a different interval
        //we need to check where the player is
        //get random position for either side of the screen
        if(enemyArray.length < 2){
            if(randomInt(0,1) == 0){
                enemyArray.push(new Enemy(randomInt(leftBounds, 0), 5));
            }else{
                console.log('in this');

                enemyArray.push(new Enemy(randomInt(canvas.width, rightBounds), -5));
            }
        }
    }, 1000);

    familyArray.push(new Family());
};

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
    if(e.keyCode == 40 && player.jumped == false){//up
        player.moveDown();
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

