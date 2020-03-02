

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





