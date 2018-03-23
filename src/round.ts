enum Color {Red, Green}

class Round
{
    readonly maxLevel:number;   //2^(maxLevel-1) = size of biggest stone; 2^(maxLevel*2) = size of biggest cell
    private center:Point;
    private currentPlayer:number;
    private players:Array<Player>;
    private cell:Cell;

    constructor(playerId1:string, playerId2:string, maxLevel:number)
    {
        console.log("start " + maxLevel);

        this.center = new Point();
        this.maxLevel = maxLevel;
        
        //players
        this.players = new Array();
        this.players.push(new Player(playerId1));
        this.players.push(new Player(playerId2));
        this.currentPlayer = 0;//todo random order

        //cells
        this.cell = new Cell(3, Math.pow(2, this.maxLevel*2));
    }

    public nextPlayer()
    {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    public addStone(x:number,y:number)
    {
        var size:number = Math.pow(2, this.players[this.currentPlayer].getLevel());
        var color = this.currentPlayer;
        var cellHalfSize = Math.pow(2, this.maxLevel*2)/2;
        //test empty space
       
        //add to
        this.cell.add(x + cellHalfSize, y + cellHalfSize, size, color);

    }

    /*getAllStones()
    {

    }*/
}

class Point
{
    public x:number = 0;
    public y:number = 0;

    constructor(x?:number, y?:number)
    {
        this.x = x;
        this.y = y;
    }
}


class Cell
{
    index:number;
    size:number;
    color:Color;
    children:Array<Cell>;

    constructor(index:number, size:number)
    {
        console.log("Cell: " + index + "; " + size);
        this.index = index;
        this.size = size;
        this.children = new Array();
    }

    public add(x:number, y:number, size:number, color:Color)
    {
        console.log("add(" + x + ", " + y + ", " + size + ", " + color+")");
        if(size == this.size)   //stone cover full cell
        {
            this.color = color;
            //todo

            return;
        }

        if(x < this.size/2)   //left
        {
            if(y < this.size/2)   //top
            {
                var childIndex = 0;
                var offsetY = 0;
            }
            else    //bottom
            {
                var childIndex = 2;
                var offsetY = this.size/2;
            }
            var offsetX = 0;
        }
        else    //right
        {
            if(y < this.size/2)   //top
            {
                var childIndex = 1;
                var offsetY = 0;
            }
            else    //bottom
            {
                var childIndex = 3;
                var offsetY = this.size/2;
            }
            var offsetX = this.size/2;
        }

        if(this.children[childIndex] == undefined)    //create child
        {
            var child = new Cell(childIndex, this.size/2);
            this.children[childIndex] = child;
        }
        
        
        this.children[childIndex].add(x - offsetX, y - offsetY, size, color);
    }

    /*private getDir():Point
    {
        switch (this.index)
        {
            case 0:
                return new Point(-1,-1);
            case 1:
                return new Point(1,-1);
            case 2:
                return new Point(-1,1);
            case 3:
                return new Point(1,1);
            default:
                return new Point(0,0);
        }
    }*/
}

class Player
{
    private level:number;
    readonly id:string;

    constructor(id:string)
    {
        this.id = id;
        this.level = 0;
    }

    public levelUp()
    {
        this.level++;
    }

    public getLevel():number
    {
       return this.level;
    }
}

//TEST GAME

var playerId1 = "A";
var playerId2 = "B";

var round = new Round(playerId1,playerId2, 5);

round.addStone(0,0);
//round.nextPlayer();
round.addStone(-1,0);

/*



klik na tlacitko start
vykresli grid
vykresli animovane kameny
getAllStones()
vykresli animovane pouzitelna pole
getFullPlaces()
interaktivni faze
addStone()
otestuj dohrani kola
testFinish()
zmen aktivniho hrace

*/