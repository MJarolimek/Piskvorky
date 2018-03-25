enum Color {Empty, Red, Green}
enum Ver {Top, Bottom=2}
enum Hor {Left, Right}

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
        this.players.push(new Player(playerId1, Color.Red));
        this.players.push(new Player(playerId2, Color.Green));
        this.currentPlayer = 0;//todo random order

        //cells
        this.cell = new Cell(3, Math.pow(2, this.maxLevel*2), undefined);
    }

    public nextPlayer()
    {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    public addStone(x:number, y:number):Cell
    {
        var size:number = Math.pow(2, this.players[this.currentPlayer].getLevel());
        var color = this.players[this.currentPlayer].color;
        var cellHalfSize = Math.pow(2, this.maxLevel*2)/2;
        
        var cell = this.cell.add(x, y, x + cellHalfSize, y + cellHalfSize, size, color);
    
        if(cell != undefined)
        {

            this.testWinRound(cell);
            //this.nextPlayer();
            return cell;
        }
        else
        {
            console.log("error: You try to put new stone into full cell.");

            return undefined;
        }
    }

    public testWinRound(cell:Cell):boolean
    {
        var horizontal:Array<Cell>;
        horizontal = this.getLine(cell, new Point(-1,0)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1,0)));

        var vertical:Array<Cell>;
        vertical = this.getLine(cell, new Point(0,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(0,1)));

        var diagonal:Array<Cell>;
        diagonal = this.getLine(cell, new Point(-1,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1,1)));

        var antidiagonal:Array<Cell>;
        antidiagonal = this.getLine(cell, new Point(1,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(-1,1)));

        if(horizontal.length >= 5)
        {
            var winLine = horizontal;
        }
        else if(vertical.length >= 5)
        {
            var winLine = vertical;
        }
        else if(diagonal.length >= 5)
        {
            var winLine = diagonal;
        }
        else if(antidiagonal.length >= 5)
        {
            var winLine = antidiagonal;
        }

        if(winLine)
        {
            var str = "You win: ";
            winLine.forEach(element => {
                str += element.originalPos.toString();
            });
            console.log(str);

            return true;
        }

        return false;
    }

    private getLine(cell:Cell, vec:Point):Array<Cell>
    {
        if(vec.x < 0 && vec.y < 0)
        {
            //get left up
            var A = (Ver.Bottom | Hor.Right);
            var B = -1;
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = (Ver.Top | Hor.Right);

            var dir = -3;
        }
        else if(vec.x > 0 && vec.y < 0)
        {
            //get right up
            var A = (Ver.Bottom | Hor.Left);
            var B = -1;
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);
            var E = (Ver.Top | Hor.Left);

            var dir = -1;
        }
        else if(vec.x < 0 && vec.y > 0)
        {
            //get left down
            var A = (Ver.Top | Hor.Right);
            var B = -1;
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = (Ver.Bottom | Hor.Right);
            
            var dir = 1;
        }
        else if(vec.x > 0 && vec.y > 0)
        {
            //get right down
            var A = (Ver.Top | Hor.Left);
            var B = -1;
            var C = (Ver.Bottom | Hor.Left);
            var D = (Ver.Bottom | Hor.Right);
            var E = (Ver.Top | Hor.Right);

            var dir = 3;
        }
        else if(vec.x < 0)
        {
            //get left
            var A = (Ver.Top | Hor.Right);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = -1;

            var dir = -1;
        }
        else if(vec.x > 0)
        {
            //get right
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Bottom | Hor.Left);
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);
            var E = -1;

            var dir = 1;
        }
        else if(vec.y < 0)
        {
            //get up
            var A = (Ver.Bottom | Hor.Left);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Top | Hor.Right);
            var E = -1;
            
            var dir = -2;
        }
        else if(vec.y > 0)
        {
            //get down
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Top | Hor.Right);
            var C = (Ver.Bottom | Hor.Left);
            var D = (Ver.Bottom | Hor.Right);
            var E = -1;

            var dir = 2;
        }

        var color = cell.getColor();
        var buffer = new Array();

        for(var i=0; i < 4; i++)    //4 iteration
        {
            var index = cell.index;
            
            if(index == A || index == B) //in same parent
            {
                cell = cell.parent.children[index+dir];

                if(cell && color == cell.getColor())    //same color
                {
                    buffer.push(cell);
                }
                else    //empty or different color
                {
                    return buffer;
                }
            }
            else    //in different parent
            {
                var counter = 0;

                //go up in tree
                while(cell.index == C || cell.index == D || cell.index == E)
                {
                   if(cell.parent.parent)
                   {
                       counter++;
                       cell = cell.parent;
                   }
                   else
                   {
                        return buffer;  //finish in root
                   }
                }

                //go right from current cell
                cell = cell.parent.children[cell.index+dir];

                if(!cell || cell.getColor() != Color.Empty)
                {
                    return buffer;
                }

                //go down in tree
                while(counter > 1)
                {
                    counter--;
                    cell = cell.children[index-dir];
                    if(!cell || cell.getColor() != Color.Empty)
                    {
                        return buffer;
                    }
                }
                
                //leaf
                cell = cell.children[index-dir];
                if(cell && color == cell.getColor())
                {
                    buffer.push(cell);
                }
                else    //empty or different color
                {
                    return buffer;
                }
            }
        }
        return buffer;
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

    public toString():string
    {
        return "["+this.x+"; "+this.y+"]";
    }
}


class Cell
{
    readonly index:number;
    readonly size:number;
    readonly parent:Cell;
    private color:Color = Color.Empty;
    public children:Array<Cell>;
    public originalPos:Point;

    constructor(index:number, size:number, parent:Cell)
    {
        //console.log("Cell: " + index + "; " + size);
        this.index = index;
        this.size = size;
        this.parent = parent;
        this.children = new Array();
    }

    public add(originalX:number, originalY:number, x:number, y:number, size:number, color:Color):Cell
    {
        //console.log("add(" + x + ", " + y + ", " + size + ", " + color+")");
        if(size == this.size)   //stone cover full cell
        {
            if(this.color == Color.Empty)
            {
                this.color = color;
                this.originalPos = new Point(originalX, originalY);
                return this;
            }
            else
            {
                return undefined;
            }
        }
        
        var cellHalfSize =  this.size/2;
        if(x < cellHalfSize)   //left
        {
            if(y < cellHalfSize)   //top
            {
                var childIndex = 0;
                var offsetY = 0;
            }
            else    //bottom
            {
                var childIndex = 2;
                var offsetY = cellHalfSize;
            }
            var offsetX = 0;
        }
        else    //right
        {
            if(y < cellHalfSize)   //top
            {
                var childIndex = 1;
                var offsetY = 0;
            }
            else    //bottom
            {
                var childIndex = 3;
                var offsetY = cellHalfSize;
            }
            var offsetX = cellHalfSize;
        }

        if(this.children[childIndex] == undefined)    //create child
        {
            var child = new Cell(childIndex, cellHalfSize, this);
            this.children[childIndex] = child;
        }
        
        return this.children[childIndex].add(originalX, originalY, x - offsetX, y - offsetY, size, color);
    }

    public getColor():Color
    {
        return this.color;
    }

}

class Player
{
    private level:number;
    readonly id:string;
    readonly color:Color; 

    constructor(id:string, color)
    {
        this.id = id;
        this.level = 0;
        this.color = color;
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

var round = new Round(playerId1,playerId2, 2);

round.addStone(1,1);
round.addStone(3,3);
round.addStone(2,2);
round.addStone(-1,-1);
round.addStone(0,0);
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