///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //

// TODO: DECLARE and INTIALIZE your constants here
var STAR_SIZE = 70;
var EDGE_WIDTH = 5;
var MAX_STARS = 20;

var VERTEX = 0;
var EDGE = 1;

var Game_State;
var P1 = 0; //Puzzle 1
var P2 = 1; //Puzzle 2
var P3 = 2; //...
var P4 = 3;
var P5 = 4;
var P6 = 5; //Traverse Puzzle 1
var C1 = 50;
var C2 = 51;
var C3 = 52;
var numPuzzles = 5;

var TITLE_SCREEN = 100;
var PUZZLE = 101;
var CHALLENGE = 102;

//Test for help screen
var NONE = 0;
var HELP_1 = 1;
var HELP_2 = 2;
var Help_Screen = NONE;

var Puzzle_Type;
var CREATE = 0;
var TRAVERSE = 1;

var Puzzles_Unlocked = new Array(true,false,false,false,false);
var Challenges_Unlocked = new Array(false,false,false);

var Message_On = true; //turns message Window on/off
var message_swipe = false; //tracks a swipe to open the Message Board

var message_1 = new Array(); //starts at the left-most end of the Message Board
var message_2 = new Array(); //starts at the mid-point of the Message Board

var Main_Menu = loadImage("Main_Menu.png");
var Background = loadImage("Background.png");
var Puzzle_Background = loadImage("Puzzle_Background.png");
var Star_Image = loadImage("Star_Image.png");
var Message = loadImage("Message.png");
var Rectangle_Button = loadImage("Rectangle_Button.png");
var Square_Button = loadImage("Square_Button.png");
var Back_Arrow = loadImage("Back_Arrow.png");
var Refresh_Button = loadImage("Refresh_Button.png");
var Dotted_Line = loadImage("Dotted_Line.png");
var Help_Screen1 = loadImage("Controls_Screen1.png");
var Help_Screen2 = loadImage("Controls_Screen2.png");

///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                        //

// TODO: DECLARE your variables here
var Stars = [];
var SG_Stars = []; //indices of stars in subGraph
var star_i = -1;
//edge drawing vars
var Edge_Array;
var SG_Edge_Array;
var edge_count;
var SG_edge_count;

//For use in puzzles with immortal stars
var immortalStars = 0;
var immortalEdges = [];

//Tracks the mouse location
var mouseX = 0;
var mouseY = 0;

//Timer for animations
var Timer = 0;

///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //

// When setup happens...
function onSetup() {
    // TODO: INITIALIZE your variables here
	Game_State = TITLE_SCREEN;
	Puzzle_Type = CREATE;
	//createPuzzleGame();
	//createP11();

}

function onTouchStart(x,y) {
	
	var i = findStar(x,y,1);
	if ( Game_State < 100 ) {
		star_i = i;
		message_swipe = false;
		if ( y > canvas.height-320 ) {
			message_swipe = true;			
		}
	}
	console.log("Help_Screen: " + Help_Screen);
}

function onTouchEnd(x,y) {

	var j = findStar(x,y);
	if ( Help_Screen > NONE ) {
		if ( Help_Screen == HELP_1 ) {
			Help_Screen = HELP_2;
		}
		else {
			Help_Screen = NONE;
			createPuzzleGame();
		}
	}
	else if ( Game_State < 100 ) {
		if (Message_On == true) {
			if ( x > 50 && x < 125 && y > 50 && y < 125 ) {
				if ( Game_State < 50 ) {
					createPuzzleScreen();
				}
				else {
					createChallengeScreen();
				}
			}
			else if ( x > canvas.width-125 && x < canvas.width-50 && y > 50 && y < 125 ) {
				createPuzzleGame();
			}
			else if ( x > 275 && x < 530 && y > canvas.height-275 && y < canvas.height-20 ) {
				Help_Screen = HELP_1;
				Timer = currentTime();
			}
			else if ( x > 540 && x < 910 && y > canvas.height-260 && y < canvas.height-50) {
				if ( testPuzzle(Game_State) ) {
					console.log("Solved!");
				}
				else {
					console.log("Failed!");
				}
				Message_On = true;
			}
			else if ( mouseY < canvas.height-320 ) {
				Message_On = false;
			}
		}
		else if ( y < canvas.height-320 && message_swipe == true && star_i == -1 ) {
			setMessage(Game_State);
		}
		else {
			var loc = getLoc(x,y);
			
			if ( Puzzle_Type == CREATE ) {
				if ( j == -1 || star_i == -1 ) {
					if ( star_i == j ) {
						createStar(x,y);
					}
					else if ( j == -1 ) {
						moveStar(x,y,star_i);
					}
				}
				else if (star_i == j && !(star_i < immortalStars)) {
					removeStar(star_i);
				}
				else {
					if (Edge_Array[star_i][j] == 1) {
						if ( immortalEdges[star_i][j] == 0 ) {
							removeEdge(star_i,j);
						}
					}
					else {
						createEdge(star_i,j);
					}	
				}
				star_i = -1;
				message_swipe = false;
			}
			if ( Puzzle_Type == TRAVERSE ) {
				if ( star_i != -1 && star_i == j ) {
					toggleStar(star_i);
				}
				else if ( star_i != -1 && j != -1 && Edge_Array[star_i][j] == 1 ) {
					toggleEdge(star_i,j);
				}
			}
		}
	}
	else if ( Game_State == TITLE_SCREEN ) {
		if ( x > 600 && x < 1320 && y > 480 && y < 640 ) {
			createPuzzleScreen();
		}
		else if ( x > 600 && x < 1320 && y > 660 && y < 820 ) {
			createChallengeScreen();
		}
		else if ( x > 600 && x < 1320 && y > 840 && y < 1000 ) {
			Help_Screen = HELP_1;
			Timer = currentTime();
		}
	}
	else if ( Game_State == PUZZLE ) {
		var i = findStar(x,y,1);
		if ( x > 50 && x < 125 && y > 50 && y < 125 ) {
			Game_State = TITLE_SCREEN;
		}
		else if ( i != -1 && Puzzles_Unlocked[i] == true ) {
			Game_State = i;
			if ( i == 0 && Puzzles_Unlocked[1] == false ) {
				Help_Screen = HELP_1;
				Timer = currentTime();
			}
			createPuzzleGame();
		}
	}
	else if ( Game_State == CHALLENGE ) {
		var i = findStar(x,y,1);
		if ( x > 50 && x < 125 && y > 50 && y < 125 ) {
			Game_State = TITLE_SCREEN;
		}
		else if ( i != -1 && Challenges_Unlocked[i] == true ) {
			Game_State = 50+i;
			createPuzzleGame();
		}
	}
}

function onKeyStart(key) {
	if ( key == asciiCode(" ") ) {
		/*createSubGraphStars();
		var star = Stars[0];
		console.log("[[" + star.x + "," + star.y + "],");
		for (var i=1; i<length(Stars)-1; ++i) {
			var star = Stars[i];
			console.log("[" + star.x + "," + star.y + "],");
		}
		var star = Stars[length(Stars)-1];
		console.log("[" + star.x + "," + star.y + "]];");
		console.log(Edge_Array);*/

		//Toggle Puzzle Type
		Puzzle_Type = (Puzzle_Type + 1) % 2;
	}
}

function findStar(x,y,graph) {
	var loc = getLoc(x,y);
	var dist = STAR_SIZE;
	if ( Game_State > 100 ) {
		dist = dist*1.5;
	}
	var i = 0;
	while (i < length(Stars)) {
		star = Stars[i];
		if (getDistance(loc,star) <= dist) {
			return i;
		}
		i = i + 1;
	}
	return -1;
}

//converts coord to an object
function getLoc(x,y) {
	var loc = new Object();
	loc.x = x;
	loc.y = y;
	return loc;
}

/*
function onTouchMove(x,y) {
	if (star_i != -1) {
		moveStar(x,y,star_i);
	}
}
*/

function onMouseMove(x,y) {
	mouseX = x;
	mouseY = y;
}

// Called 30 times or more per second
function onTick() {
	
    doGraphics();

}


///////////////////////////////////////////////////////////////
//                                                           //
//                      HELPER RULES                         //

function doGraphics() {
	
	if ( Help_Screen > NONE ) {
		if ( Help_Screen == HELP_1 ) {
			drawImage(Help_Screen1,0,0,canvas.width,canvas.height);	
			var trans = abs(currentTime() - Timer - 1) / 1;
			fillText("Tap the screen to continue...",1390,canvas.height-40,makeColor(.8,.8,.8,trans),"45px Berylium","start","middle");
		}
		else if ( Help_Screen == HELP_2 ) {
			drawImage(Help_Screen2,0,0,canvas.width,canvas.height);	
			var trans = abs(currentTime() - Timer - 1) / 1;
			fillText("Tap the screen to continue...",1390,canvas.height-40,makeColor(.8,.8,.8,trans),"45px Berylium","start","middle");
		}
		if( currentTime() - Timer > 2 ) {
			Timer = currentTime();
		}
	}
	else if ( Game_State < 100 ) {
		drawImage(Background,0,0,canvas.width,canvas.height);
		var color = makeColor(0.9,0.9,0.9,1);
		var size = EDGE_WIDTH;
		var i = 0; 
		while (i < length(Stars)) {
			star = Stars[i];
			size = EDGE_WIDTH;
			if ( i == star_i ) {
				color = makeColor(0.8,0.8,0,1);
			}
			else if ( star_i != -1 && findStar(mouseX, mouseY, 1) == i ) {
				color = makeColor(0.8,0.8,0,1);
			}
			else if (star.subGraph == true) {
				color = makeColor(0.5,0.8,1,1);
				size = EDGE_WIDTH*3;
			}
			else {
				color = makeColor(0.9,0.9,0.9,1);
			}
			drawImage(Star_Image,star.x-35,star.y-35,70,70);
			strokeCircle(star.x,star.y,STAR_SIZE,color,size);
			var j = 0;
			while (j < length(Stars)) {
				if (Edge_Array[i][j] == 1) {
					star2 = Stars[j];
					if ( SG_Edge_Array[star.i][star2.i] == 1 ) {
						color = makeColor(0.5,0.8,1,1);
						size = EDGE_WIDTH*3;
					}
					else {
						color = makeColor(0.9,0.9,0.9,1);
						size = EDGE_WIDTH;
					}
					strokeLine(star.x,star.y,star2.x,star2.y,color,size);
				}
				j = j + 1;
			}
			i = i + 1;
		}
		if ( Message_On == true ) {
			drawImage(Message,0,0,canvas.width,canvas.height);	
			drawImage(Back_Arrow,50,50,75,75);
			drawImage(Refresh_Button,canvas.width-125,50,75,75);
			drawImage(Square_Button,25,canvas.height-275,255,255);
			drawImage(Star_Image,100,canvas.height-210,100,125);
			fillRectangle(25,canvas.height-275,255,255, makeColor(0,0,.1,.5));
			drawImage(Square_Button,275,canvas.height-275,255,255);
			//strokeLine(350,canvas.height-100,450,canvas.height-200,makeColor(.9,.9,.9,1),10);
			fillText("?",360,canvas.height-145,makeColor(.8,.8,.8,1),"175px Berylium","start","middle");
			drawImage(Rectangle_Button,525,canvas.height-280,425,265);
			fillText("Submit",580,canvas.height-150,makeColor(.7,.7,.7,1),"110px Berylium","start","middle");
			
			for (var x=0; x < length(message_2); ++x) {
				fillText(message_2[x],975,canvas.height-240+(x*45), makeColor(.5,.5,.5,1),"bold 45px Berylium","start","middle");
			}
			//strokeLine(350,canvas.height-320,450,canvas.height-320,makeColor(.5,.5,.5,1),10);
		}
		else if (mouseY >= canvas.height-320) {
			var trans = 0.5;
			if (mouseY < canvas.height-160) {
				trans = 0.5 - ((canvas.height-160 - mouseY) / 320);
			}
			fillRectangle(0, canvas.height-320, canvas.width, canvas.height, makeColor(0,0,.1,trans));
		}	
	}
	else if ( Game_State > 100 ) { //Puzzle-Challenge Select Screens
		var unlocked_c = makeColor(.9,.9,.9,1);
		var locked_c = makeColor(.5,.5,.5,.3);
		
		drawImage(Puzzle_Background,0,0,canvas.width,canvas.height);
		drawImage(Back_Arrow,50,50,75,75);
		
		for (var x=0; x < length(message_1); ++x) {
			fillText(message_1[x],50,canvas.height-200+(x*60), makeColor(.5,.5,.5,1),"bold 55px Berylium","start","middle");
		}
		if ( Game_State == PUZZLE ) {
			for (var x=0; x < 5; ++x ) {
				var star = Stars[x];
				if ( Puzzles_Unlocked[x] ) {
					strokeCircle(star.x,star.y,STAR_SIZE*1.5,unlocked_c,EDGE_WIDTH*1.5);
					drawImage(Star_Image,star.x-50,star.y-50,STAR_SIZE*1.5,STAR_SIZE*1.5);
					if ( x > 0 && Puzzles_Unlocked[x-1] ) {
						star2 = Stars[x-1];
						strokeLine(star.x,star.y,star2.x,star2.y,makeColor(0.9,0.9,0.9,1),EDGE_WIDTH*1.5);
					}
				}
				else {
					strokeCircle(star.x,star.y,STAR_SIZE*1.5,locked_c,EDGE_WIDTH*1.5);
				}
			}
		}
		else if ( Game_State == CHALLENGE ) {
			for (var x=0; x < 3; ++x ) {
				var star = Stars[x];
				if ( Challenges_Unlocked[x] ) {
					strokeCircle(star.x,star.y,STAR_SIZE*1.5,unlocked_c,EDGE_WIDTH*1.5);
					drawImage(Star_Image,star.x-50,star.y-50,STAR_SIZE*1.5,STAR_SIZE*1.5);
					if ( x > 0 && Challenges_Unlocked[x-1] ) {
						star2 = Stars[x-1];
						strokeLine(star.x,star.y,star2.x,star2.y,makeColor(0.9,0.9,0.9,1),EDGE_WIDTH*1.5);
					}
				}
				else {
					strokeCircle(star.x,star.y,STAR_SIZE*1.5,locked_c,EDGE_WIDTH*1.5);
				}
			}
		}
	}
	else {
		drawImage(Main_Menu,0,0,canvas.width,canvas.height);
		fillText("Version 0.2.1",1720,canvas.height-30,makeColor(.8,.8,.8,1),"35px Berylium","start","middle");

	}
}

function createPuzzleScreen() {
	Game_State = PUZZLE;
	
	var star = new Object();
	star.i = 0;
	star.x = 200;
	star.y = 600;
	Stars[0] = star;
	
	star = new Object();
	star.i = 1;
	star.x = 550;
	star.y = 220;
	Stars[1] = star;
	
	star = new Object();
	star.i = 2;
	star.x = 900;
	star.y = 700;
	Stars[2] = star;
	
	star = new Object();
	star.i = 3;
	star.x = 1250;
	star.y = 380;
	Stars[3] = star;
	
	star = new Object();
	star.i = 4;
	star.x = 1700;
	star.y = 540;
	Stars[4] = star;
	
	setMessage(200);
}

function createChallengeScreen() {
	Game_State = CHALLENGE;
	
	star = new Object();
	star.i = 0;
	star.x = 400;
	star.y = 380;
	Stars[0] = star;
	
	star = new Object();
	star.i = 1;
	star.x = 750;
	star.y = 700;
	Stars[1] = star;
	
	star = new Object();
	star.i = 2;
	star.x = 1500;
	star.y = 540;
	Stars[2] = star;
	
	if ( !Challenges_Unlocked[0] ) {
		setMessage(201);
	}
	else {
		setMessage(202);
	}
}

function createPuzzleGame() {
	if ( Game_State < 100 ) {
		edge_count = 0; //move later
		SG_edge_count = 0;
		immortalStars = 0; //change in createP_() methods
		Edge_Array = new Array(MAX_STARS);
		SG_Edge_Array = new Array(MAX_STARS);
		immortalEdges = new Array(MAX_STARS);
		for (var i=0; i < length(Edge_Array); ++i) {
			Edge_Array[i] = new Array(MAX_STARS);
			SG_Edge_Array[i] = new Array(MAX_STARS);
			immortalEdges[i] = new Array(MAX_STARS);
			for (var j=0; j < MAX_STARS; ++j) {
				Edge_Array[i][j] = 0;
				SG_Edge_Array[i][j] = 0;
				immortalEdges[i][j] = 0;
			}
		}
		Stars = new Array();
		setMessage(Game_State);
	}
}

function createP6() {
	var starArray =[[1260,200],
					[440,420],
					[330,200],
					[550,200],
					[1430,750],
					[590,640],
					[1050,540],
					[1060,880],
					[780,970],
					[1190,1090],
					[1550,410]];
	immortalStars = length(starArray);	
	createStarArray(starArray);

	Edge_Array=[[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], 
				[0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
				[0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 
	 			[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
	 			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], 
	 			[0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], 
	 			[0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0], 
	 			[0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0], 
	 			[0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0], 
	 			[0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1], 
	 			[1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]];
	immortalEdges = Edge_Array;
}

function createP7() {
	var starArray= [[900,200],
 					[750,750],
				    [226,550],
 					[900,1050],
 					[1600,550],
 					[900,550],
 					[610,550],
 					[1200,550]];
 	immortalStars = length(starArray);	
 	createStarArray(starArray);

	Edge_Array=[[0, 0, 1, 0, 1, 1, 1, 1], 
				[0, 0, 1, 0, 0, 0, 1, 0], 
				[1, 1, 0, 1, 0, 0, 0, 0], 
				[0, 0, 1, 0, 1, 1, 0, 1], 
				[1, 0, 0, 1, 0, 0, 0, 1], 
				[1, 0, 0, 1, 0, 0, 1, 0], 
				[1, 1, 0, 0, 0, 1, 0, 0], 
				[1, 0, 0, 1, 1, 0, 0, 0]];
	immortalEdges = Edge_Array;
}

function createP8() {
	
	var starArray= [[650,230],
					[1200,230],
					[925,450],
					[350,700],
					[1500,700],
					[925,650],
					[750,800],
					[1100,800],
					[600,1100],
					[1250,1100]];
	immortalStars = length(starArray);	
	createStarArray(starArray);

	Edge_Array=[[0, 1, 0, 1, 0, 0, 1, 0, 0, 0], 
				[1, 0, 0, 0, 1, 0, 0, 1, 0, 0], 
				[0, 0, 0, 1, 1, 1, 0, 0, 0, 0], 
				[1, 0, 1, 0, 0, 0, 0, 0, 1, 0], 
				[0, 1, 1, 0, 0, 0, 0, 0, 0, 1], 
				[0, 0, 1, 0, 0, 0, 1, 1, 0, 0], 
				[1, 0, 0, 0, 0, 1, 0, 0, 0, 1], 
				[0, 1, 0, 0, 0, 1, 0, 0, 1, 0], 
				[0, 0, 0, 1, 0, 0, 0, 1, 0, 1], 
				[0, 0, 0, 0, 1, 0, 1, 0, 1, 0]];
	immortalEdges = Edge_Array;
}

function createP9() {

	var starArray= [[200,560],
					[575,240],
					[575,560],
					[575,880],
					[950,240],
					[950,560],
					[950,880],
					[1325,240],
					[1325,560],
					[1325,880],
					[1700,560]];
	immortalStars = length(starArray);	
	createStarArray(starArray);				

	Edge_Array=[[0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], 
				[1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0], 
				[1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], 
				[1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0], 
				[0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0], 
				[0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], 
				[0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0], 
				[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], 
				[0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1], 
				[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], 
				[0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0]];
	immortalEdges = Edge_Array;
}

//NOTE: CHANGE EDGE_ARRAY IF MAX_STARS IS CHANGED
function createP11() {

	var starArray= [[300,600],
					[300,900],
					[700,600],
					[700,900],
					[1100,600],
					[1100,900],
					[1500,600],
					[1500,900],
					[500,325],
					[900,325],
					[1300,325]];
	immortalStars = length(starArray);
	createStarArray(starArray);	

	Edge_Array=[[0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], 
				[1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], 
				[0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0], 
				[0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], 
				[1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
	immortalEdges = $.extend(true, [], a);
}

function createC8() {

	var starArray= [[700,800],
					[1100,800],
					[1150,500],
					[1400,750],
					[1350,300],
					[1600,550],
					[650,500],
					[400,750],
					[200,550],
					[450,300]];
	createStarArray(starArray);	
	immortalStars = length(starArray);

	Edge_Array=[[0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0], 
				[1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
	immortalEdges = Edge_Array;
}

//0-99 are for puzzles and challenges
//100-199 are for success and failure messages
//200-299 are for menu screens
function setMessage(message_number) {
	Message_On = true;
	if ( message_number == 0 ) {
		message_2 = new Array();
		insertBack(message_2,"Two stars are connected if there is a line between");
		insertBack(message_2,"them. A Constellation is connected if there is a "); 
		insertBack(message_2,"path between any two stars. Draw a Constellation"); 
		insertBack(message_2,"with 7 stars that is connected with the fewest");
		insertBack(message_2,"number of lines!");
	}
	else if ( message_number == 1 ) {
		message_2 = new Array();
		insertBack(message_2,"The degree of a star is the number of lines that");
		insertBack(message_2,"come out of it. Draw a Constellation with 5 stars");
		insertBack(message_2,"in which each star has degree 2!");
	}
	else if ( message_number == 2 ) {
		message_2 = new Array();
		insertBack(message_2,"Now draw a Constellation with 7 stars in which");
		insertBack(message_2,"six stars have degree 2 and one star has degree 4!");
	}
	else if ( message_number == 3 ) {
		message_2 = new Array();
		insertBack(message_2,"A bipartite Constellation can be divided into two");
		insertBack(message_2,"groups of stars in which no star in a group is");
		insertBack(message_2,"connected to another star in the same group.");
		insertBack(message_2,"Draw a bipartite Constellation with 7 stars and");
		insertBack(message_2,"6 connecting lines!");
	}
	else if ( message_number == 4 ) {
		message_2 = new Array();
		insertBack(message_2,"Now draw a bipartite Constellation with 8 stars");
		insertBack(message_2,"in which every star has degree 3!");
	}
	else if ( message_number == 50 ) {
		message_2 = new Array();
		insertBack(message_2,"For this Challenge, draw a Constellation with");
		insertBack(message_2,"6 stars in which every star has degree 2, but");
		insertBack(message_2,"the Constellation is not connected!");
	}
	else if ( message_number == 51 ) {
		message_2 = new Array();
		insertBack(message_2,"For this Challenge, draw a Constellation with");
		insertBack(message_2,"7 stars in which six stars have degree 2, and");
		insertBack(message_2,"one star has degree 3!");
	}
	else if ( message_number == 52 ) {
		message_2 = new Array();
		insertBack(message_2,"For this Challenge, draw a bipartite");
		insertBack(message_2,"Constellation with 8 stars of degree 3, and");
		insertBack(message_2,"bipartite groups of sizes 3 and 5!");
	}
	else if ( message_number == 100 ) {
		message_2 = new Array();
		insertBack(message_2,"Not the right number of stars!");
	}
	else if ( message_number == 101 ) {
		message_2 = new Array();
		insertBack(message_2,"This Constellation is not connected!");
	}
	else if ( message_number == 102 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! You used "  + edge_count + " edges to complete the");
		insertBack(message_2,"puzzle, can you make a Constellation with fewer?");
		Puzzles_Unlocked[1] = true;
	}
	else if ( message_number == 103 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! You found the optimal solution!");
		Puzzles_Unlocked[1] = true;
	}
	else if ( message_number == 104 ) {
		message_2 = new Array();
		insertBack(message_2,"Not all stars have degree 2!");
	}
	else if ( message_number == 105 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! You have created a cycle.");
		insertBack(message_2,"A new Challenge has been unlocked!");
		Puzzles_Unlocked[2] = true;
		Challenges_Unlocked[0] = true;
	}
	else if ( message_number == 106 ) {
		message_2 = new Array();
		insertBack(message_2,"Not all stars have the correct degree!");
	}
	else if ( message_number == 107 ) {
		message_2 = new Array();
		insertBack(message_2,"Too many stars with degree 4!");
	}
	else if ( message_number == 108 ) {
		message_2 = new Array();
		insertBack(message_2,"Not enough stars with degree 4!");
	}
	else if ( message_number == 109 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! You have found one solution. Can you");
		insertBack(message_2,"find another? Note that two Constellations are the");
		insertBack(message_2,"same if you can move around the stars of one to");
		insertBack(message_2,"make the other.");
		insertBack(message_2,"A new Challenge has been unlocked!");
		Puzzles_Unlocked[3] = true;
		Challenges_Unlocked[1] = true;
	}
	else if ( message_number == 110 ) {
		message_2 = new Array();
		insertBack(message_2,"This is not a bipartite Constellation!");
	}
	else if ( message_number == 111 ) {
		message_2 = new Array();
		insertBack(message_2,"Not enough connecting lines!");
	}
	else if ( message_number == 112 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! This puzzle has many solutions. Can");
		insertBack(message_2,"you find them all?");
		Puzzles_Unlocked[4] = true;
	}
	else if ( message_number == 113 ) {
		message_2 = new Array();
		insertBack(message_2,"Not all stars have degree 3!");
	}
	else if ( message_number == 114 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! This Constellation is very complex.");
		insertBack(message_2,"What kinds of obervations can you make?");
		insertBack(message_2,"A new Challenege has been unlocked!");
		Challenges_Unlocked[2] = true;
	}
	else if ( message_number == 115 ) {
		message_2 = new Array();
		insertBack(message_2,"This Constellation should not be connected!");
	}
	else if ( message_number == 116 ) {
		message_2 = new Array();
		insertBack(message_2,"Correct! A Constellation in which all stars");
		insertBack(message_2,"have degree 2 need not contain only one cycle.");
	}
	else if ( message_number == 117 ) {
		message_2 = new Array();
		insertBack(message_2,"Too many stars with degree 3!");
	}
	else if ( message_number == 118 ) {
		message_2 = new Array();
		insertBack(message_2,"Not enough stars with degree 3!");
	}
	else if ( message_number == 119 ) {
		message_2 = new Array();
		insertBack(message_2,"Bipartite groups are not the right size!");
	}
	else if ( message_number == 120 ) {
		message_2 = new Array();
		insertBack(message_2,"You can't create any more stars!");
	}
	else if ( message_number == 200 ) {
		message_1 = new Array();
		insertBack(message_1,"Click on one of the highlighted stars to begin!");
		insertBack(message_1,"Note: Not all Puzzles have only one solution. Can you find them all?")
	}
	else if ( message_number == 201 ) {
		message_1 = new Array();
		insertBack(message_1,"Solve Puzzles to unlock Challenges!");
		insertBack(message_1,"Note: Not all Challenges have a solution. Can you find the ones that do?")
	}
	else if ( message_number == 202 ) {
		message_1 = new Array();
		insertBack(message_1,"Click on one of the highlighted stars to begin!");
		insertBack(message_1,"Note: Not all Challenges have a solution. Can you find the ones that do?")
	}
}

function createStar(x,y) {
	if ( length(Stars) < MAX_STARS ) {
		var star = new Object();
		star.x = x;
		star.y = y;
		star.i = length(Stars);
		star.degree = 0;
		star.degree2 = 0;
		star.subGraph = false;
		insertBack(Stars,star);
	}
	else {
		setMessage(120); //Too many stars!
	}
}

function createStarArray(array) {
	while ( length(array) > 0 ) {
		var x = array[0][0];
		var y = array[0][1];
		createStar(x,y);
		removeFront(array);
	}
}

function createEdge(i,j) {
	Edge_Array[i][j] = 1;
	Edge_Array[j][i] = 1;
	++edge_count;
	updateDegree(i,1,1);
	updateDegree(j,1,1);
}

function toggleStar(i) {
	Stars[i].subGraph = !Stars[i].subGraph;
	Stars[i].degree2 = 0;
	if (Stars[i].subGraph == false) {
		for (var k=0; k < length(Stars); ++k) {
			var x = -1*SG_Edge_Array[i][k];
			updateDegree(k,x,2);
			SG_edge_count += x;
			SG_Edge_Array[i][k] = 0;
			SG_Edge_Array[k][i] = 0;
		}
	}
}

function toggleEdge(i,j) {
	var x = (-2 * SG_Edge_Array[i][j]) + 1; // x \on {-1,1}
	SG_Edge_Array[i][j] = (SG_Edge_Array[i][j] + 1) % 2;
	SG_Edge_Array[j][i] = SG_Edge_Array[i][j];
	updateDegree(i,x,2);
	updateDegree(j,x,2);
	SG_edge_count += x;
	if ( SG_Edge_Array[i][j] == 1 ) {
		Stars[i].subGraph = true;
		Stars[j].subGraph = true;
	}
}

function removeStar(i) {
	edge_count = edge_count - Stars[i].degree;
	var j = length(Stars)-1;
	var k = 0;
	while ( k < length(Stars) ) {
		
		var x = -1*Edge_Array[i][k];
		updateDegree(k,x,1);
		Edge_Array[i][k] = Edge_Array[j][k];
		Edge_Array[j][k] = 0;
		
		Edge_Array[k][i] = Edge_Array[k][j];
		Edge_Array[k][j] = 0;
		
		k = k + 1;
	}
	
	var star = Stars[j];
	star.i = i;
	Stars[i] = star;
	removeBack(Stars);
}

function removeEdge(i,j) {
	Edge_Array[i][j] = 0;
	Edge_Array[j][i] = 0;
	--edge_count;
	updateDegree(i,-1,1);
	updateDegree(j,-1,1);
}

function updateDegree(i,x,num) {
	var star = Stars[i];
	if (num == 1) {
		star.degree = star.degree + x;
	}
	else if (num == 2) {
		star.degree2 = star.degree2 + x;
	}
	Stars[i] = star;
}

function getDistance(obj1,obj2) {
	return sqrt( pow(obj1.x - obj2.x,2) + pow(obj1.y - obj2.y,2) )
}

function moveStar(x,y,i) {
	var star = Stars[i];
	star.x = x;
	star.y = y;
	star.i = i;
	Stars[i] = star;
}

function createSubGraphStars() {
	SG_Stars = new Array();
	for (var i=0; i < length(Stars); ++i) {
		var star = Stars[i];
		if (star.subGraph == true) {
			insertBack(SG_Stars,star);
		}
	}
}

function testPuzzle(puzzle) {
	var vertex_count = length(Stars);
	if (puzzle == 0) {
		if ( connectedTest(1) ) {
			if ( vertex_count == 7) {
				if (edge_count > 6) {
					setMessage(102); //Correct! But not optimal
				}
				else {
					setMessage(103); //Correct! optimal
				}
				return true;
			}
			setMessage(100); //not the right number of stars
			return false;
		}
		setMessage(101); //not connected
		return false;
	}
	
	else if (puzzle == 1) {
		for (var x = 0; x < vertex_count; ++x) {
			if ( Stars[x].degree != 2 ) { 
				setMessage(104); //not all degree 2
				return false; 
			}
		}
		if (vertex_count == 5) {
			setMessage(105); //Correct!
			return true;
		}
		else {
			setMessage(100); //not the right number of stars
			return false;
		}
	}
	
	else if (puzzle == 2) {
		var degreeFourCount = 0;
		if ( vertex_count != 7 ) {
			setMessage(100); //not enough stars
			return false;
		}
		for (var x = 0; x < vertex_count; ++x) {
			if ( Stars[x].degree != 2 && Stars[x].degree != 4) { 
				setMessage(106); //not correct degrees
				return false; 
			}
			else if (Stars[x].degree == 4) {
				++degreeFourCount;
				if (degreeFourCount == 2) {
					setMessage(107); //Too many stars with degree 4
					return false;
				}
			}
		}
		if ( degreeFourCount == 0 ) {
			setMessage(108); //Not enough stars with degree 4
			return false;
		}
		else {
			setMessage(109); //Correct!
			return true;
		}
	}
	
	else if (puzzle == 3) {
		if ( bipartiteTest(1,1) ) {
			if ( edge_count == 6 ) {
				if (vertex_count == 7) {
					setMessage(112); //Correct!
					return true;
				}
				else {
					setMessage(100); //not the right number of stars
					return false;
				}
			}
			else {
				setMessage(111); //not enough edges
				return false;
			}
		}
		setMessage(110); //not bipartite
		return false;
	}
	
	else if (puzzle == 4) {
		if ( bipartiteTest(1,1) ) {
			if (vertex_count == 8) {
				for (var x = 0; x < vertex_count; ++x) {
					if ( Stars[x].degree != 3 ) { 
						setMessage(113); //not all degree 3
						return false; 
					}
				}
				setMessage(114); //Correct!
				return true;
			}
			else {
				setMessage(100); //not the right number of stars
				return false;
			}
		}
		setMessage(110); //not bipartite
		return false;
	}
	else if ( puzzle == 50 ) {
		if ( vertex_count == 6 ) {
			if ( !connectedTest(1) ) {
				for (var x = 0; x < vertex_count; ++x) {
					if ( Stars[x].degree != 2 ) { 
						setMessage(104); //not all degree 2
						return false; 
					}
				}
				setMessage(116); //Correct!
				return true;
			}
			setMessage(115); //connected
			return false;
		}
		setMessage(100); //not the right number of stars!
		return false;
	}
	else if ( puzzle == 51) {
		var degreeThreeCount = 0;
		if ( vertex_count != 7 ) {
			setMessage(100); //not enough stars
			return false;
		}
		for (var x = 0; x < vertex_count; ++x) {
			if ( Stars[x].degree != 2 && Stars[x].degree != 3) { 
				setMessage(106); //not correct degrees
				return false; 
			}
			else if (Stars[x].degree == 3) {
				++degreeThreeCount;
				if (degreeThreeCount == 2) {
					setMessage(117); //Too many stars with degree 3
					return false;
				}
			}
		}
		if ( degreeThreeCount == 0 ) {
			setMessage(118); //Not enough stars with degree 3
			return false;
		}
	}
	else if ( puzzle == 52 ) {
		if ( bipartiteTest(1,1) ) {
			if ( bipartiteTest(2,1) ) {
				if (vertex_count == 8) {
					for (var x = 0; x < vertex_count; ++x) {
						if ( Stars[x].degree != 3 ) { 
							setMessage(113); //not all degree 3
							return false; 
						}
					}
					//Correct!
					return true;
				}
				else {
					setMessage(100); //not the right number of stars
					return false;
				}
			}
			setMessage(119); //Groups wrong size
			return false;
		}
		setMessage(110); //not bipartite
		return false;
	}
}

function connectedTest(graph) {
	if (graph == 1) {
		testArray = Stars;
	}
	else {
		testArray = SG_Stars;
	}

	var checkNext = new Array();
	var alreadyChecked = new Array();
	var numStars = length(testArray);
	insertBack(checkNext,0);
	insertBack(alreadyChecked,0);
	
	while ( length(checkNext) > 0 ) {
		var i = checkNext[0];
		for (var j=0; j < numStars; ++j) {
			if ( isConnected(i,j,graph) && !contains(alreadyChecked,j) ) {
				insertBack(checkNext,j);
				insertBack(alreadyChecked,j);
			}
		}
		removeFront(checkNext);
	}
	//console.log(alreadyChecked);
	if ( length(alreadyChecked) == numStars ) {
		return true;
	}
	return false;	
}

function isConnected(a,b,graph) {
	if (graph == 1) {
		return ( Edge_Array[a][b] == 1 );
	}
	else {
		return ( SG_Edge_Array[a][b] == 1 );
	}
}

function contains(array,value) {
	return !( indexOf(array,value) == -1 )
}

function bipartiteTest(test_number,graph) {
	var checkNext = new Array();
	for ( var x=0; x<length(Stars); ++x ) {
		insertBack(checkNext,x);
	}
	var firstGroup = new Array();
	var secondGroup = new Array();
	var i;
	var j;

	while ( length(checkNext) > 0 ) {
		i = checkNext[0];
		removeFront(checkNext);
		for ( var j = 0; j < length(Stars); ++j ) {
			if ( isConnected(i,j,graph) ) {
				if ( contains(firstGroup,j) || contains(secondGroup,j) ) {
					if ( contains(firstGroup,j) && contains(firstGroup,i) ) {
						return false;
					}
					else if ( contains(secondGroup,j) && contains(secondGroup,i) ) {
						return false;
					}
					else {
						//do nothing
					}
				}
				else if ( contains(firstGroup,i) ) {
					insertBack(secondGroup,j);
					insertFront(checkNext,j);
				}
				else {
					insertBack(firstGroup,j);
					insertFront(checkNext,j);
				}
			}
		}
	}
	if ( test_number == 1 ) {
		return true;
	}
	else if ( test_number == 2 ) {
		if ( (length(firstGroup) == 3 && length(secondGroup) == 5) || (length(firstGroup) == 5 && length(secondGroup) == 3) ) {
			return true;
		}
		else {	
			return false;
		}
	}
}

function spanningTreeTest() {
	if ( length(SG_Stars) == length(Stars) && SG_edge_count == length(Stars) - 1 &&
		connectedTest(2) ) {
		console.log("This is a spanning tree!");
		return true;
	}
	else {
		console.log("Not a spanning tree!");
		return false;
	}
}

function hamiltonianTest() {
	if ( length(SG_Stars) == length(Stars) && SG_edge_count == length(Stars) &&
		 connectedTest(2) ) {
		for (var x = 0; x < length(SG_Stars); ++x) {
			if ( SG_Stars[x].degree2 != 2 ) { 
				console.log("Not a hamiltonian cycle!");
				return false; 
			}
		}
		console.log("This is a hamiltonian cycle!")
		return true;
	}
	else {
		console.log("Not a hamiltonian cycle!");
		return false;
	}
}

function perfectMatchingTest() {
	if ( length(SG_Stars) == length(Stars) ) {
		for (var x = 0; x < length(SG_Stars); ++x) {
			if ( SG_Stars[x].degree2 != 1 ) { 
				console.log("Not a perfect matching!");
				return false; 
			}
		}
		console.log("This is a perfect matching!");
		return true;
	}
	else {
		console.log("Not a perfect matching!");
		return false;
	}
}

function eulerTourTest() {
	for ( var x = 0; x < length(SG_Stars); ++x ) {
		if ( SG_Stars[x].degree2 % 2 == 1 ) {
			return false;
		}
	}
	return true;
}

//finds the flow in a given network (unweighted)
//Assume a valid flow was already found
function networkFlowTest(s,t) {
	var lockVertices = SG_Stars; //Remember player flow to be reset at end of alg.
	var lockFlow = SG_Edge_Array;
	var flowValue = 0;
	while ( SG_Stars[s].degree > 0 ) {
		for ( var j = 0; j < length(SG_Stars); ++j ) {
			if ( isConnected(s,j,2) ) {
				removeEdge(s,j,2);
				flowValue = flowValue + testFlow(j,t);
			}
		}
	}
}

function testFlow(i,t) {
	while ( SG_Stars[i].degree == 1 ) {
		for ( var j = 0; j < length(SG_Stars); ++j ) {
			if ( isConnected(i,j,2) ) {
				removeEdge(i,j,2);
				i = j;
				break;
			}
		}
	}
	if (i == t) {
		return 1;
	}
	else {
		return 0;
	}
}
