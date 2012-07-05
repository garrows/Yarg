var INITIAL_SPEED = 15;
var MINIMUM_SPEED = 6;
var CALCULATOR_GREEN = 'rgb(118,140,101)';
var LEVEL_IMAGE = 'images/level1.png';
var INTRO_IMAGE = 'images/intro.png';

var GAME_MODES = {
    MENU : 0,
    GAME : 1
};

update = function(dt) {
	if (!drawer.isReady(LEVEL_IMAGE)) {
		return;
	}
	//Turn left or right
	if (k_a && !k_d) {
		car.angle -= car.speed * dt/10;
	} else if (!k_a && k_d) {
		car.angle += car.speed * dt/10;
	}
	//Breaks
	if (k_s && car.speed > 0) {
		car.speed = car.speed * Math.pow(0.5, dt);
	} else {
		car.speed += dt;
	}
	
	car.x += Math.cos(car.angle) * car.speed * dt;
	car.y += Math.sin(car.angle) * car.speed * dt;
	if (car.x < 0) { car.x = 0; }
	if (car.x > level.length-1) { car.x = level.length-1; }
	if (car.y < 0) { car.y = 0; }
	if (car.y > level[0].length-1) { car.y = level[0].length-1; }
	if (car.speed < MINIMUM_SPEED && !k_s) { restartCar(); return;}
	if (car.speed < MINIMUM_SPEED) { car.speed = MINIMUM_SPEED; }
	
	offset.x = Math.round(-car.x) * canvas.width / 128;
	offset.y = Math.round(-car.y) * canvas.height / 64;
	
	//Offroad?
	if (level[Math.round(car.x)][Math.round(car.y)] == 1) {
		car.speed = car.speed * Math.pow(0.2, dt);
		car.color = CALCULATOR_GREEN;
	}
	else
	{
		car.color = 'black';
	}
	
	drawer.draw(LEVEL_IMAGE, offset);
};

Drawer = function() {
	this.init = function() {
		this.lastDraw = {x: null, y: null, image: null};
		this.w = (canvas.width / 128);
		this.h = (canvas.height / 64);
		this.ww = this.w * 0.8;
		this.hh = this.h * 0.8;	 
		this.images = [];
	};
	
	this.drawBitmap = function(bitmap, offset) {
		//Only redraw on change. 
		if (offset.x === this.lastDraw.x && offset.y === this.lastDraw.y && bitmap === this.lastDraw.image) {
			return;
		}
		
		this.lastDraw.x = offset.x;
		this.lastDraw.y = offset.y;
		this.lastDraw.image = bitmap;
			
		ctx.fillStyle = CALCULATOR_GREEN; //Calculator green
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'black';

		ctx.putImageData(bitmap, offset.x + canvas.width/2, offset.y + canvas.height/2);
		ctx.fillStyle = car.color;
		ctx.fillRect(64 * this.w, 32 * this.h, this.ww, this.hh);
	};
	
	this.isReady = function(filename) {
		if (filename in this.images) {
			if (this.images[filename].ready)
			{
				return true;
			}
		}
		else
		{
			this.images[filename] = {
				filename: filename,
				ready: false,
				bitmap: null
			};
			console.log(this.images);
			this.loadImage(filename);
		}
		return false;
	}
	
	this.draw = function(filename, offset) {
		if (this.isReady(filename)) {
			this.drawBitmap(this.images[filename].bitmap, offset);
			return true;
		}
		return false;
	};
	
	this.loadImage = function(filename) {
		var levelImg = new Image();
		levelImg.onload = function() {
			var x, y, xx, yy,
			w = (canvas.width / 128),
			h = (canvas.height / 64),
			ww = w * 0.8,
			hh = h * 0.8;

			var levelInfoCanvas = document.createElement('canvas');
			levelInfoCanvas.width = levelImg.width;
			levelInfoCanvas.height = levelImg.height;

			var levelCanvas = document.createElement('canvas');
			levelCanvas.width = levelImg.width * w;
			levelCanvas.height = levelImg.height * h;
			var levelCtx = levelCanvas.getContext("2d");

			var levelInfoCtx = levelInfoCanvas.getContext("2d");
			levelInfoCtx.drawImage(levelImg, 0, 0);
			var levelData = levelInfoCtx.getImageData(0, 0, levelImg.width, levelImg.height);
			level = [];

			levelCtx.fillStyle = CALCULATOR_GREEN; //Calculator green
			levelCtx.fillRect(0, 0, levelCanvas.width, levelCanvas.height);
			levelCtx.fillStyle = 'black';

			var startPoint = {x:null,y:null};
			var startDirectionPoint = {x:0,y:0};
			for (var i = 0; i < levelData.data.length; i+=4) {
				x = (i/4) % levelData.width;
				y = Math.floor((i/4 / levelData.width));
				xx = x * w;
				yy = y * h;
				if (!(x in level)) {
					level[x] = [];
				}
				if (levelData.data[i] == 0 && levelData.data[i+1] == 0 && levelData.data[i+2] == 0) {
					level[x][y] = 1;
					levelCtx.fillRect(xx, yy, ww, hh);
				} else if (levelData.data[i] == 255 && levelData.data[i+1] == 0 && levelData.data[i+2] == 0) {
					startPoint.x = x;
					startPoint.y = y;
				} else if (levelData.data[i] == 0 && levelData.data[i+1] == 255 && levelData.data[i+2] == 0) {
					startDirectionPoint.x = x;
					startDirectionPoint.y = y;
				} else {
					level[x][y] = 0;
				}
			}
			
			if (startPoint.x != null && startPoint.y != null) {
				car.x = startPoint.x;
				car.y = startPoint.y;
				if (startDirectionPoint.x == startPoint.x) {
					if (startDirectionPoint.y > startPoint.y) {
						car.angle = 0.5 * Math.PI;
					} else {
						car.angle = 1.5 * Math.PI;
					}
				} else if (startDirectionPoint.x > startPoint.x) {
					car.angle = Math.PI;
				} else {
					car.angle = 0;
				}
				car.startPoint = startPoint;
				car.startAngle = car.angle;
			}
		  
			mapBitmap = levelCtx.getImageData(0, 0, levelCanvas.width, levelCanvas.height);
			//Stupid inheritance. 
			drawer.images[filename].bitmap = mapBitmap;
			drawer.images[filename].ready = true;
			
		};
		levelImg.src = filename;
	};

	
	this.init();
};


var lastTime = Date.now();
mainGameLoop = function() {
	var now = Date.now();
	var dt = now - lastTime;
	lastTime = now;
	
	switch(gameMode)
	{
		case GAME_MODES.MENU:
			drawer.draw(INTRO_IMAGE, {x: -canvas.width/2, y: -canvas.height/2});
			//Preloading.
			drawer.isReady(LEVEL_IMAGE);
		break;
		case GAME_MODES.RACING:
			update(dt/1000);		
		break;
	}
};

startLoop = function() {
	var animFrame = window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame    ||
                   window.oRequestAnimationFrame      ||
                   window.msRequestAnimationFrame     ||
                   null ;

   if ( animFrame !== null ) {      
      if ( false ) { //$.browser.mozilla ) { //cbfed putting in jquery
         var recursiveAnim = function() {
             mainGameLoop();
             animFrame();
         };
      
         // setup for multiple calls
         window.addEventListener("MozBeforePaint", recursiveAnim, false);
      
         // start the main loop
         animFrame();
      } else {
         var recursiveAnim = function() {
            mainGameLoop();
             animFrame( recursiveAnim, canvas );
         };
      
         // start the mainloop
         animFrame( recursiveAnim, canvas );
      }
   } else {
      var ONE_FRAME_TIME = 1000.0 / 60.0 ;
      setInterval( mainGameLoop, ONE_FRAME_TIME );
   }
}

var k_w = false,
k_s = false,
k_d = false,
k_a = false;
keypressed = function(event) {
	switch(event.which)
	{
		case 38: // up
			k_w = event.type == 'keydown';
			k_s = false;
			break;
		case 39: // right
			k_d = event.type == 'keydown';
			k_a = false;
		break;
		case 40: // down
			k_s = event.type == 'keydown';
			k_w = false;
		break;
		case 37: // left
			k_a = event.type == 'keydown';
			k_d = false;
		break;
		case 13: // Enter
			if (event.type == 'keyup') {
				switch(gameMode)
				{
					case GAME_MODES.MENU:
						restartCar();
						gameMode = GAME_MODES.RACING;
					break;
					case GAME_MODES.RACING:
						gameMode = GAME_MODES.MENU;
					break;
				}
			}
		break;
		default:
			console.log(event); 
		break;
   }
};

restartCar = function() {
	if (typeof(car.startPoint) !== 'undefined') {
		car.x = car.startPoint.x;
		car.y = car.startPoint.y;
		car.angle = car.startAngle;
		car.speed = INITIAL_SPEED;
	}
};

var mouseDown = false;
mouseMove = function(e) {
   //get position relative to bitmap
   var x = e.layerX - canvas.offsetParent.offsetLeft; 

   //Convert to center coords
   x = -((canvas.width/2) - x);
   console.log(x);
   if (x < 0) {
      if (mouseDown) {
         k_d = mouseDown;
      }
      k_a = false;
   } else {
      if (mouseDown) {
         k_a = mouseDown;
      }
      k_d = false;
   }
};

mouseEvents = function (e) {
   mouseDown = e.type == "mousedown";
   mouseMove(e);
};

touchHandler = function(event) {
  //Gets the touch event
  var touches = event.changedTouches,
      first = touches[0],
      type = "";
  switch(event.type)
  {
     case "touchstart": type = "mousedown";   break;
     case "touchmove":  type = "mousemove";   break;        
     case "touchend":   
        type="mouseup"; 
        //click event if its a tap. 
        if (lastTouchEvent == "touchstart") {
          type="click";
        }
        break;
     default: return;
  }
  //Used for determining taps
  lastTouchEvent = event.type;
  //Create the mouseEvent and raise it.
  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                first.screenX, first.screenY, 
                                first.clientX, first.clientY, false, 
                                false, false, false, 0/*left*/, null);

  first.target.dispatchEvent(simulatedEvent);
  //Turns off the default event.
  event.preventDefault();
};


setupUserEvents = function() {
	//canvas.onmousedown = mouseEvents;
	//canvas.onmouseup = mouseEvents;
	//canvas.onmousemove = mouseMove;
	document.onkeydown=keypressed;
	document.onkeyup=keypressed;
	try { document.addEventListener("touchstart",  touchHandler, true); } catch(err) {  }
	try { document.addEventListener("touchmove",   touchHandler, true); } catch(err) {  }
	try { document.addEventListener("touchend",    touchHandler, true); } catch(err) {  }
	try { document.addEventListener("touchcancel", touchHandler, true); } catch(err) {  }
};


var canvas = document.getElementById("canvas"),
ctx = canvas.getContext("2d");

var offset = {x: 0, y: 0};
var car = {
	x : 0,
	y : 0,
	angle : 0,
	speed : INITIAL_SPEED,
	color : 'black'
};

var gameMode = GAME_MODES.MENU;

drawer = new Drawer();
startLoop();
setupUserEvents();