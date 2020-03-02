
class Controller {
    constructor(canvas) {
        
        this.color  = "rgb(0,0,0)";
        this.colors = [0, 0, 0];
        this.shifts = [0, 0, 0];

        this.rightDown = false;
        this.rightUp = true;

        this.leftDown = false;
        this.leftUp = true;

        this.upDown = false;
        this.upUp = true;    

        this.downDown = false;
        this.downUp = true;

        this.space = false;

        this.position  = {
            x: 0,
            y: 0
        }

        this.startPosition = {
            x: 0,
            y: 0
        }

                              
        this.move = function(x, y, isStart) {
            if(isStart){
                this.startPosition.x = x;
                this.startPosition.y = y;
            }else{
                this.position.x = x;
                this.position.y = y;
            }
            console.log('Start ', this.startPosition, 'End', this.position);
            
        }

        this.stopMove = function(){
            this.startPosition.x = 0;
            this.startPosition.y = 0;
            this.position.x = 0;
            this.position.y = 0
        };
      
        this.color = "rgb(" + this.colors[0] + "," + this.colors[1] + "," + this.colors[2] + ")";
      
    };                
}

