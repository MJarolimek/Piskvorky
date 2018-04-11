//TEST ADD STONE AND TESTWIN FUNCTION

var playerId1 = "A";
var playerId2 = "B";

var ROUND = require('./main');

//TEST ADD STONE ON INVALID POSITION
/*
var round = new ROUND.Round(playerId1, playerId2, 2);
round.addStone(-65,1);
round.addStone(-129,1);
round.addStone(-257,1);     //error
round.addStone(0,257);      //error
round.addStone(-257,257);   //error
round.addStone(256.5,256);  //error


round = new ROUND.Round(playerId1, playerId2, 5);
round.addStone(-1025,1);
round.addStone(-2050,1);    //error
*/

//TEST ADD STONE INTO FULL CELL
/*
var round = new ROUND.Round(playerId1, playerId2, 2);
round.addStone(1,1);
round.addStone(1,1);
*/

//TEST TESTWIN HORIZONTAL WITH RESULT WIN

/*
var round = new ROUND.Round(playerId1, playerId2, 2);
round.addStone(-1,0);
round.addStone(3,0);
round.addStone(1,0);
round.addStone(0,0);
round.addStone(2,0);
round.addStone(4,0);

var round = new ROUND.Round(playerId1, playerId2, 2);
round.addStone(-1,256);
round.addStone(3,256);
round.addStone(1,256);
round.addStone(0,256);
round.addStone(2,256);
round.addStone(4,256);
*/

//TEST TESTWIN HORIZONTAL WITH RESULT NOT WIN
/*
var round = new ROUND.Round(playerId1, playerId2, 2);
round.addStone(-1,256);
round.addStone(3,256);
round.addStone(1,256);
round.addStone(0,255);
round.addStone(2,256);
round.addStone(4,256);

var round = new ROUND.Round(playerId1, playerId2, 1);
round.addStone(-1,-128);
round.addStone(3,-128);
round.addStone(1,-128);
round.addStone(0,-127);
round.addStone(2,-128);
round.addStone(4,-128);
*/

//TEST TESTWIN VERTICAL WITH RESULT WIN

//TEST TESTWIN VERTICAL WITH RESULT NOT WIN

//TEST TESTWIN DIAGONAL WITH RESULT WIN

//TEST TESTWIN DIAGONAL WITH RESULT NOT WIN

//TEST TESTWIN ANTIDIAGONAL WITH RESULT WIN

//TEST TESTWIN ANTIDIAGONAL WITH RESULT NOT WIN

//TEST LEVEL UP

round = new ROUND.Round(playerId1,playerId2, 3);

round.addStone(0,0);    //x
round.addStone(6,1);    //0

round.setWindow(-2, -2, 4, 4);

round.addStone(5,-5);    //x
round.addStone(6,2);    //0
round.addStone(4,-4);    //x
round.addStone(6,3);    //0
round.addStone(3,-3);    //x
round.addStone(6,4);    //0
round.addStone(2,-2);     //x
round.addStone(6,6);    //0
var cell = round.addStone(1,-1);    //x
round.testWinRound(cell);
//round.addStone(-1,-1);   //o
//round.addStone(-3,0);    //x

//round.updateWindow(-3, -2, 4, 4);