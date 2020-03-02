/*
	This class holds all the game logic

	TODO:
	Im thinking about using a json file of levels maybe, like where enemies 
*/
class Game {
	constructor() {
		this.color  = "rgb(0,0,0)";
		this.colors = [0, 0, 0];
		this.shifts = [0, 0, 0];
		this.fishArray = [];
		// World Size
		this.width = 5000;
		this.height = 5000;
		this.player = new Player(this.width/2, this.height/2);
		this.gameover = false;
	}

	clamp(value, min, max){
		if(value < min) return min;
		else if(value > max) return max;
		return value;
	}

	draw(){
		ctx.clearRect(0,0,canvas.width, canvas.height);

		ctx.scale(-20, -20) // Doubles size of anything draw to canvas.
		
		ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
		ctx.clearRect(0, 0, canvas.width, canvas.height);//clear the viewport AFTER the matrix is reset

		//Clamp the camera position to the world bounds while centering the camera around the player
		this.clamp(-player.x + canvas.width/2, 0, canvas.width);
		this.clamp(-player.y + canvas.height/2, 0, this.height - canvas.height);
		
		ctx.translate( -player.x-player.width/2+canvas.width/2, -player.y-player.height/2+canvas.height/2 );


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
			ctx.rect(0, ground, game.width, canvas.height);
			ctx.fillStyle = 'saddlebrown';
			ctx.fill();

			

			//draw burrow
			ctx.closePath();
			ctx.beginPath();
			ctx.rect(30, ground+30, game.width-30, canvas.height);
			ctx.fillStyle = 'black';
			ctx.fill();

			//draw burrow opening
			ctx.closePath();
			ctx.beginPath();
			ctx.rect(burrowOpening.x, burrowOpening.y, burrowOpening.width, burrowOpening.height);
			ctx.fillStyle = 'black';
			ctx.fill();

			//draw ground bottom
			ctx.closePath();
			ctx.beginPath();
			ctx.rect(0, familyAttrs.y+50, game.width, canvas.height);
			ctx.fillStyle = 'saddlebrown';
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
			//stockPile.draw();
		}
	}
	
	update(dt){
		
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

		// //update family
		// for (let i = 0; i < familyArray.length; i++) {
		//     familyArray[i].update();
		//     if(familyArray[i].food <= 0){
		//         gameover();
		//     }
		// }
	
		//update enemyArray
		for (let i = 0; i < enemyArray.length; i++) {
			enemyArray[i].update();
			//if enemy is out of bounds
			if(hitEnemy(player, enemyArray[i]) || enemyArray[i].x > rightBounds*2 || enemyArray[i].x < leftBounds*1.2){
				enemyArray.splice(i, 1);
			}
		}

		//update bulletArray
		for (let i = 0; i < bulletArray.length; i++) {
			bulletArray[i].update();
			//if hit enemy
			for (let j = 0; j < enemyArray.length; j++){
				//if enemy is out of bounds
				if(hitSquare(bulletArray[i], enemyArray[j])){
					bulletArray.splice(i,1);
					enemyArray.splice(j, 1);
					//issue with sq1 not defined because loop just has length of 2
					//maybe we just break the loop to fix this bug for now                
					break;
				}
			}
			if(bulletArray[i] < 0 || bulletArray[i] > canvas.width){
			}
		}
		//check gameover state
		if(player.health <= 0){
			gameover();
		}
		score++;
	}
}