//ENUMS
enum Color {Empty, Red, Green}
enum Ver {Top, Bottom=2}
enum Hor {Left, Right}
enum Keycode {Left = 65, Right = 68, Up = 87, Down = 83, ZoomIn = 73, ZoomOut = 79}
enum Status {Menu, Ingame, UIOverlay}
enum IngameStatus {WaitUser, AddNew, AddNewAnim, ShowWin, ShowWinAnim, FadeOut, FadeIn}

//CONST
const c_cellSize = 32;         //size of basic cell in pixels
const c_sizeMultiple = 128;    //2^(maxLevel-1) = size of biggest stone; 2^(maxLevel)*sizeMultiple = size of biggest cell resp. board
const c_animationTime = 250;   //duration of move and scale animation in milisec
const c_rootWidth = 550;
const c_rootHeight = 400;

//BASIC FUNCTIONS
function getSizeOfCell(maxLevel:number):number
{
    return Math.pow(2, maxLevel)*c_sizeMultiple;
}

function getSizeOfBoard(maxLevel:number):number
{
    return getSizeOfCell(maxLevel)*c_cellSize;
}

//CLASSES
class Cell  //resolution of Round in cells
{
    readonly index:number;
    readonly size:number;
    readonly parent:Cell;
    private color:Color = Color.Empty;
    public children:Array<Cell>;
    public originalPos:Point;
    public mc:any;

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
            if(this.color == Color.Empty && this.children.length == 0)  //cel has to has no children
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

    public setColor(color:Color)
    {
        this.color = color;
    }

    public toString():string
    {
        return "{"+this.index+", color:"+this.color+"; size:"+this.size+"; originalPos:"+this.originalPos.toString()+"}";
    }

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

class Rectangle
{
    public x:number = 0;
    public y:number = 0;
    public width:number = 0;
    public height:number = 0;

    constructor(x?:number, y?:number, width?:number, height?:number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public toString():string
    {
        return "["+this.x+"; "+this.y+"; "+this.width+"; "+this.height+"]";
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

    public levelUp():number
    {
        this.level++;
        return this.level;
    }

    public getLevel():number
    {
       return this.level;
    }
}

class Round
{
    readonly maxLevel:number;   //2^(maxLevel-1) = size of biggest stone; 2^(maxLevel)*sizeMultiple = size of biggest cell resp. board
    private currentPlayer:number;
    private players:Array<Player>;
    private cell:Cell;

    public board:Board;

    public addStones:Array<Cell>;           //hard add because in window
    public addStonesNew:Array<Cell>;        //anim add when place new
    public addStonesFadeIn:Array<Cell>;     //anim add when change to bigger
    public removeStones:Array<Cell>;        //hard remove because in window
    public removeStonesFadeOut:Array<Cell>; //anim remove because change to bigger
    public winLine:Array<Cell>;
    
    public ingameStatus:IngameStatus;

    constructor(playerId1:string, playerId2:string, maxLevel:number, positionX:number, positionY:number)
    {
        console.log("start game of: " + playerId1 + "; " + playerId2 + "; " + maxLevel);

        this.maxLevel = maxLevel;
        
        this.addStones = new Array();
        this.addStonesNew = new Array();
        this.addStonesFadeIn = new Array();
        this.removeStones = new Array();
        this.removeStonesFadeOut = new Array();
        this.winLine = new Array();

        //players
        this.players = new Array();
        this.players.push(new Player(playerId1, Color.Red));
        this.players.push(new Player(playerId2, Color.Green));
        this.currentPlayer = 0;//todo random order

        //cells
        this.cell = new Cell(3, getSizeOfCell(this.maxLevel), undefined);

        //board
        this.board = new Board(maxLevel, new Point(positionX, positionY), new Rectangle(0, 0, c_rootWidth, c_rootHeight));
   
        //window in cell coordinates and position in top left corner
        this.setWindow();

        this.ingameStatus = IngameStatus.WaitUser;
    }

    public nextPlayer()
    {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    public setWindow()
    {
        var cellWindow = this.getCellWindow();

        this.addStones = this.addStones.concat(this.getVisibleStones(this.cell, cellWindow));

        console.log("visible " + this.addStones.length + " cells: " + this.addStones.toString());
    }

    public updateWindow()
    {
        var cellWindow = this.getCellWindow();

        var result:Array<Array<Cell>> = this.getVisibleStonesIncrement(this.cell, cellWindow);

        this.addStones = this.addStones.concat(result[0]);
        this.removeStones = this.removeStones.concat(result[1]);

        console.log("add " + result[0].length + " cells: " + result[0].toString());
        console.log("remove " + result[1].length + " cells: " + result[1].toString());
    }

    public boardMove(xDir:number, yDir:number)
    {
        this.board.move(xDir, yDir);
        this.updateWindow();
    }

    public boardZoom(dir:number, originX:number, originY:number)
    {
        this.board.zoom(dir, originX, originY);
        this.updateWindow();
    }

    private getCellWindow():Rectangle
    {
        var invertScale = 1/this.board.getScale();

        var boardCoord = this.board.getBoardCoord(0, 0);

        var x = boardCoord.x / c_cellSize;
        var y = boardCoord.y / c_cellSize;
        var width = this.board.window.width * invertScale / c_cellSize;
        var height = this.board.window.height * invertScale / c_cellSize;

        var cellWindow = new Rectangle(x, y, width, height)

        //console.log("getCellWindow " + cellWindow.toString());

        return cellWindow;
    }
    
    private getVisibleStones(cell:Cell, newWindow:Rectangle):Array<Cell>
    {      
        if(cell)
        {  
            if(cell.getColor() != Color.Empty)
            {
                //is out
                if(cell.originalPos.x + cell.size < newWindow.x || cell.originalPos.y + cell.size < newWindow.y || 
                    cell.originalPos.x > newWindow.x + newWindow.width || cell.originalPos.y > newWindow.y + newWindow.height)
                {
                    return [];
                }
                else    //is in
                {
                    return [cell];
                }
            }
            else
            {
                var stones:Array<Cell> = new Array();

                for(var i=0; i < 4; i++)
                {
                    if(cell.children[i])
                    {
                        stones = stones.concat(this.getVisibleStones(cell.children[i], newWindow));
                    }
                }

                return stones;
            }
        }
        return [];
    }

    private getVisibleStonesIncrement(cell:Cell, newWindow:Rectangle):Array<Array<Cell>>
    {      
        if(cell)
        {  
            if(cell.getColor() != Color.Empty)
            {
                //is out
                if(cell.originalPos.x + cell.size < newWindow.x || cell.originalPos.y + cell.size < newWindow.y || 
                    cell.originalPos.x > newWindow.x + newWindow.width || cell.originalPos.y > newWindow.y + newWindow.height)
                {
                    if(cell.mc)
                    {
                        return [[],[cell]];
                    }
                    else
                    {
                        return [[],[]];
                    }

                }
                else    //is in
                {
                    if(!cell.mc)
                    {
                        return [[cell],[]];
                    }
                    else
                    {
                        return [[],[]];
                    }
                }
            }
            else
            {
                var addStones:Array<Cell> = new Array();
                var removeStones:Array<Cell> = new Array();

                for(var i=0; i < 4; i++)
                {
                    if(cell.children[i])
                    {
                        var arrays = this.getVisibleStonesIncrement(cell.children[i], newWindow);
                        addStones = addStones.concat(arrays[0]);
                        removeStones = removeStones.concat(arrays[1]);
                    }
                }

                return [addStones,removeStones];
            }
        }
        return [[],[]];
    }

    private isStoneVisible(cell:Cell):boolean
    {
        var window = this.getCellWindow();

        if(cell.originalPos.x + cell.size < window.x || cell.originalPos.y + cell.size < window.y || 
            cell.originalPos.x > window.x + window.width || cell.originalPos.y > window.y + window.height)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    public addStoneBoardCoord(x:number, y:number)   //coordinates in stage
    {
        var boardCoord = this.board.getBoardCoord(x, y);
        this.addStone(boardCoord.x / c_cellSize, boardCoord.y / c_cellSize);
    }

    public addStone(x:number, y:number) //coordinates in cell
    {
        var size:number = Math.pow(2, this.players[this.currentPlayer].getLevel());
        var color = this.players[this.currentPlayer].color;

        x = Math.floor(x - (Math.abs(Math.floor(x)) % size));
        y = Math.floor(y - (Math.abs(Math.floor(y)) % size));

        var cellHalfSize = getSizeOfCell(this.maxLevel)/2;
        if(x < -cellHalfSize || y < -cellHalfSize || x >= cellHalfSize || y >= cellHalfSize)
        {
            console.log("error: You try to put new stone out of playing area: "+ x + "; "+ y);
        }
        
        var cell = this.cell.add(x, y, x + cellHalfSize, y + cellHalfSize, size, color);
    
        if(cell != undefined)
        {
            //test visibility
            if(this.isStoneVisible(cell))
            {
                this.addStonesNew.push(cell);
                this.ingameStatus = IngameStatus.AddNew;
            }

            //test win
            var winLine = this.testWinRound(cell);

            if(winLine)
            {
                this.winLine = winLine;
                /*var str = "Player " + this.players[this.currentPlayer].id + " win: ";
                winLine.forEach(element => {
                    str += element.originalPos.toString();
                });
                console.log(str);

                if(this.players[this.currentPlayer].getLevel() < this.maxLevel-1)
                {
                    this.upgradeLevel();
                }
                else
                {
                    console.log("Player " + this.players[this.currentPlayer].id + " win whole game!");
                }*/
            }
            else
            {
                this.nextPlayer();
            }
        }
        else
        {
            console.log("error: You try to put new stone into full cell: "+ x + "; " + y);
        }
    }

    public testWinRound(cell:Cell):Array<Cell>
    {
        var horizontal:Array<Cell>;
        horizontal = this.getLine(cell, new Point(-1,0)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1,0)));

        var vertical:Array<Cell>;
        vertical = this.getLine(cell, new Point(0,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(0,1)));

        //var diagonal:Array<Cell>;
        //diagonal = this.getLine2(cell, new Point(-1,-1)).reverse().concat([cell]).concat(this.getLine2(cell, new Point(1,1)));

        var antidiagonal:Array<Cell>;
        antidiagonal = this.getLine2(cell, new Point(1,-1)).reverse().concat([cell]).concat(this.getLine2(cell, new Point(-1,1)));

        console.log("anti" + antidiagonal.toString());

        if(horizontal.length >= 5)
        {
            var winLine = horizontal;
        }
        else if(vertical.length >= 5)
        {
            var winLine = vertical;
        }
        /*else if(diagonal.length >= 5)
        {
            var winLine = diagonal;
        }*/
        else if(antidiagonal.length >= 5)
        {
            var winLine = antidiagonal;
        }

        if(winLine)
        {
            var str = "Player " + this.players[this.currentPlayer].id + " win: ";
            winLine.forEach(element => {
                str += element.originalPos.toString();
            });
            console.log(str);
            return winLine;
        }

        return undefined;
    }

    private getLine(cell:Cell, vec:Point):Array<Cell>
    {
        if(vec.x < 0)
        {
            //console.log("get left");
            var A = (Ver.Top | Hor.Right);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);

            var dir = -1;
        }
        else if(vec.x > 0)
        {
            //console.log("get right");
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Bottom | Hor.Left);
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);

            var dir = 1;
        }
        else if(vec.y < 0)
        {
            //console.log("get up");
            var A = (Ver.Bottom | Hor.Left);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Top | Hor.Right);
            
            var dir = -2;
        }
        else if(vec.y > 0)
        {
            //console.log("get down");
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Top | Hor.Right);
            var C = (Ver.Bottom | Hor.Left);
            var D = (Ver.Bottom | Hor.Right);

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
                let path = [];

                //go up in tree
                while(cell.index == C || cell.index == D)
                {
                   //console.log("goUp "+ cell.index);
                   if(cell.parent.parent)
                   {
                       cell = cell.parent;
                       path.push(cell.index);
                   }
                   else
                   {
                        return buffer;  //finish in root
                   }
                }
                //go right from current cell
                //console.log("jump "+cell.index +"+"+dir);
                cell = cell.parent.children[path.pop()+dir];

                if(!cell || cell.getColor() != Color.Empty)
                {
                    return buffer;
                }

                //go down in tree
                while(path.length > 0)
                {
                    //console.log("goDown "+cell.index +"-"+dir);
                    cell = cell.children[path.pop()-dir];
                    if(!cell || cell.getColor() != Color.Empty)
                    {
                        return buffer;
                    }
                }
                
                //leaf
                //console.log("leaf " + index + "-" + dir);
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

    private getLine2(cell:Cell, vec:Point):Array<Cell>
    {
        if(vec.x < 0 && vec.y < 0)
        {
            //get left up
            var A = (Ver.Bottom | Hor.Right);
            var B = (Ver.Top | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);

            var dir = [-3];
        }
        else if(vec.x > 0 && vec.y < 0)
        {
            console.log("get right up");
            var A = (Ver.Bottom | Hor.Left);
            var B = (Ver.Top | Hor.Left);
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);

            var dir = [3,1,-1,-3];
        }
        else if(vec.x < 0 && vec.y > 0)
        {
            console.log("get left down");
            var A = (Ver.Top | Hor.Right);//1
            var B = (Ver.Bottom | Hor.Right);//3
            var C = (Ver.Bottom | Hor.Left);//2
            var D = (Ver.Top | Hor.Left);//0
            
            var dir = [3,1,-1,-3];
        }
        else if(vec.x > 0 && vec.y > 0)
        {
            //get right down
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Top | Hor.Right)
            var C = (Ver.Bottom | Hor.Right);
            var D = (Ver.Bottom | Hor.Left);

            var dir = [3];
        }

        var color = cell.getColor();
        var buffer = new Array();

        console.log("start");

        for(var i=0; i < 4; i++)    //4 iteration
        {
            var index = cell.index;
            
            if(index == A) //in same parent
            {
                cell = cell.parent.children[index+dir[A]];

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
                let path = [];


                while(cell.index != A 
                    && (path.length == 0 
                            || ((path[path.length-1] != D || cell.index != B) 
                                && (path[path.length-1] != B || cell.index != D))))
                {
                    console.log(cell.index + "; "+ A + "; "+ path[path.length-1]);
                   if(cell.parent.parent)
                   {
                        path.push(cell.index);
                        cell = cell.parent;
                   }
                   else
                   {
                       console.log("finish in root");
                        return buffer;  //finish in root
                   }
                }
                console.log(cell.index + " path" + path.toString());

                //go right from current cell
                if(cell.index == B || cell.index == D || (cell.index == A && path[path.length-1] == C))
                {
                    cell = cell.parent.children[C];
                }
                else if(cell.index == A)
                {
                    cell = cell.parent.children[path[path.length-1]];

                }

                if(!cell || cell.getColor() != Color.Empty)
                {
                    return buffer;
                }

                //go down in tree
                while(path.length > 1)
                {
                    let pathIndex = path.pop();
                    let pathIndexChild = path[path.length-1];

                    cell = cell.children[pathIndex+dir[pathIndex]];
                    
                    
                    if(!cell || cell.getColor() != Color.Empty)
                    {
                        return buffer;
                    }
                }
                
                //leaf
                cell = cell.children[index+dir[index]];
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

    private upgradeLevel()
    {
        var size = Math.pow(2, this.players[this.currentPlayer].levelUp());
        var color = this.players[this.currentPlayer].color;

        //add all potential cells to array
        var queue:Array<Cell> = new Array();
        queue = this.getChildrenOfSize(this.cell, size);

        //assorted to win and pat Cells
        var winCells:Array<Cell> = new Array();
        var patCells:Array<Cell> = new Array();
    
        queue.forEach(cell => 
        {
           var counter1 = 0;
           var counter2 = 0;
           var originalPos;

           for(var i=0; i < 4; i++)
           {
                if(cell.children[i] && cell.children[i].originalPos)
                {
                    if(cell.children[i].getColor() == color)
                    {
                        counter1++;
                    }
                    else
                    {
                        counter2++;
                    }

                    if(originalPos == undefined)
                    {
                        var x = cell.children[i].originalPos.x - (i%2)*cell.children[i].size;            //offset x position from child 
                        var y = cell.children[i].originalPos.y - Math.floor(i/2)*cell.children[i].size;  //offset y position from child 
                        originalPos = new Point(x, y);
                    }
                }
           }

           if(counter1 > counter2)  //win
           {
               cell.setColor(color);
               cell.originalPos = originalPos;
               winCells.push(cell);
           }
           else if(counter1 == counter2 && counter1 > 0)    //pat and almost one cell is full on curent size
           {
                cell.originalPos = originalPos; //todo remove - only cells with not empty color has originalPos
                patCells.push(cell);
           } 
        });

        var str = "All win cells: ";
        winCells.forEach(element => {
            str += element.originalPos.toString();
        });
        console.log(str);

        var str = "All pat cells: ";
        patCells.forEach(element => {
            str += element.originalPos.toString();
        });
        console.log(str);
    }

    private getChildrenOfSize(cell:Cell, size:number):Array<Cell>
    {
        if(cell && cell.getColor() == Color.Empty)
        {
            if(cell.size > size) //bigger
            {
                return this.getChildrenOfSize(cell.children[0], size).concat(this.getChildrenOfSize(cell.children[1], size)).concat(this.getChildrenOfSize(cell.children[2], size)).concat(this.getChildrenOfSize(cell.children[3], size));
            }
            else
            {
                return [cell];
            }
        }
        else    //empty
        {
            return [];
        }
    }
}

class Board //resoulution of Board in pixels
{
    public isStable:boolean;
    public zoomLevel:number;
    public position:Point;

    readonly maxZoomLevel:number;
    readonly window:Rectangle; 

    constructor(maxLevel:number, position:Point, window:Rectangle)
    {
        this.zoomLevel = 1;
        this.maxZoomLevel = maxLevel + 1;

        this.position = position;
        this.window = window;

        this.isStable = true;
    }

    public move(xDir:number, yDir:number)
    {
        //console.log("move("+xDir+", "+yDir+")");

        var position = new Point(this.position.x + xDir*c_cellSize*this.zoomLevel, this.position.y + yDir*c_cellSize*this.zoomLevel);
        position = this.checkBoundaries(position);

        this.position.x = position.x;
        this.position.y = position.y;

        this.isStable = false;
    }

    public zoom(dir:number, originX:number, originY:number)
    {
        //console.log("zoom("+dir+")");

        var previousZoomLevel = this.zoomLevel;
        
        if(dir > 0)
        {
            if(this.zoomLevel + 1 > this.maxZoomLevel)
            {
                this.zoomLevel = this.maxZoomLevel;
            }
            else
            {
                this.zoomLevel += 1;
            }
        }
        else if(dir < 0)
        {
            if(this.zoomLevel - 1 < 1)
            {
                this.zoomLevel = 1;
            }
            else
            {
                this.zoomLevel -= 1;
            }
        }

        if(this.zoomLevel != previousZoomLevel)
        {
            var previousScale = 1/(Math.pow(2,previousZoomLevel-1));
            var currentScale = 1/(Math.pow(2,this.zoomLevel-1));
            var scale = currentScale/previousScale;

            var position = new Point(originX + (this.position.x - originX)*scale, originY + (this.position.y - originY)*scale);
            position = this.checkBoundaries(position);

            this.position.x = position.x;
            this.position.y = position.y;

            this.isStable = false;
        }
    }

    public getScale():number
    {
        return 1/(Math.pow(2,this.zoomLevel-1));
    }

    public getPosition():Point
    {
        return this.position;
    }

    public getBoardCoord(x:number, y:number):Point  //from stage coord to board coord
    {
        var invertScale = 1/this.getScale();

        var newX = (x - this.window.x - this.position.x) * invertScale;
        var newY = (y - this.window.y - this.position.y) * invertScale;

        return new Point(newX, newY);
    }

    private checkBoundaries(position:Point):Point
    {
        var sizeX = getSizeOfBoard(this.maxZoomLevel-1)*this.getScale();    //in window space
        var sizeY = getSizeOfBoard(this.maxZoomLevel-1)*this.getScale();

        var newPosition:Point = new Point(position.x, position.y);
        
        //x
        if(sizeX < this.window.width)
        {
            newPosition.x = this.window.x + this.window.width/2;
        }
        else if(position.x > this.window.x + sizeX/2)
        {
            newPosition.x = this.window.x + sizeX/2;
        }
        else if(position.x < - this.window.x - sizeX/2 + this.window.width)
        {
            newPosition.x = - this.window.x - sizeX/2 + this.window.width;
        }

        //y
        if(sizeY < this.window.height)
        {
            newPosition.y = this.window.y + this.window.height/2;
        }
        else if(position.y > this.window.y + sizeY/2)
        {
            newPosition.y = this.window.y + sizeY/2;
        }
        else if(position.y < - this.window.y - sizeY/2 + this.window.height)
        {
            newPosition.y = - this.window.y - sizeY/2 + this.window.height;
        }

        return newPosition;
    }
}

//TODO
//draw grid efectivly - dynamic add and remove, layers
//colorize selected cell in WaitUser
//mouse drag and drop
//animation states fadeIn, fadeOut
//minigame chalenge
//show message - x win round/game
//touch events move and zoom

//text databaze
//menu settings
//skin

//BUGS
//not win in some direction