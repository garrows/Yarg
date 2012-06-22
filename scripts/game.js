update = function(dt) {
	//Turn left or right
	if (k_a && !k_d) {
		car.angle += car.speed * dt/10;
	} else if (!k_a && k_d) {
		car.angle -= car.speed * dt/10;
	}
	//Breaks
	if (k_s) {
		car.speed -= 3*dt;
	} else {
		car.speed += dt;
	}
	car.x += Math.cos(car.angle) * car.speed * dt;
	car.y += Math.sin(car.angle) * car.speed * dt;
	
	offset.x = Math.round(car.x);
	offset.y = Math.round(-car.y);
	
	drawLevel(dt);
};

drawLevel = function(dt) {
	//Only redraw on change. 
	if (offset.x == lastOffset.x && offset.y == lastOffset.y) {
		return;
	}
	lastOffset.x = offset.x;
	lastOffset.y = offset.y;
		
	ctx.fillStyle = 'rgb(118,140,101)'; //Calculator green
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';

	var xx = 0,
	yy = 0,
	x = 0, 
	y = 0,
	tx = 0, 
	ty = 0,
	w = (canvas.width / 128),
	h = (canvas.height / 64),
	ww = w * 0.8,
	hh = h * 0.8;
   
   ctx.putImageData(mapBitmap, offset.x, offset.y);
   ctx.fillStyle = 'black';
   ctx.fillRect(64*w, 28*h, ww, hh);
   /*
	for (var x = 0; x < 128; x++) {
		xx = x * w;
		tx = x + offset.x;
		for (var y = 0; y < 64; y++) {
			yy = y * h;
			ty = y + offset.y;
			if (tx in level && ty in level[tx] && level[tx][ty] === 1) {
				ctx.fillRect(xx, yy, ww, hh);
			}
			if (x == 64 && y == 32) {
				if (tx in level && ty in level[tx] && level[tx][ty] === 1) {
					//Collision
					car.speed -= dt * 10;
					if (car.speed < 3) {
						car.speed = 3;
					}
					ctx.fillStyle = 'rgb(118,140,101)'; //Calculator green
					
				} else {
					ctx.fillStyle = 'black';
				}
				ctx.fillRect(xx, yy, ww, hh);
				ctx.fillStyle = 'black';
			}
		}
	}
   */
};

var lastTime = Date.now();
mainGameLoop = function() {
   var now = Date.now();
	var dt = now - lastTime;
   lastTime = now;
	update(dt/700);
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

var mapBitmap = null;
setupLevel = function() {
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
      //var levelCanvas = document.getElementById("levelCanvas");
		levelCanvas.width = levelImg.width * w;
		levelCanvas.height = levelImg.height * h;
      var levelCtx = levelCanvas.getContext("2d");

		var levelInfoCtx = levelInfoCanvas.getContext("2d");
		levelInfoCtx.drawImage(levelImg, 0, 0);
		var levelData = levelInfoCtx.getImageData(0, 0, levelImg.width, levelImg.height);
		level = [];
		
      levelCtx.fillStyle = 'rgb(118,140,101)'; //Calculator green
      levelCtx.fillRect(0, 0, levelCanvas.width, levelCanvas.height);
      levelCtx.fillStyle = 'black';
      
		
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
			} else {
				level[x][y] = 0;
			}
		}
      
      mapBitmap = levelCtx.getImageData(0, 0, levelCanvas.width, levelCanvas.height);
		startLoop();
	};
	levelImg.src = '../images/level1.png';
};

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
      default:
         //log(event); 
         break;
   }
};

var mouseDown = false;
mouseMove = function(e) {
   //get position relative to bitmap
   var x = e.layerX - canvas.offsetParent.offsetLeft; 

   //Convert to center coords
   x = -((canvas.width/2) - x);
   console.log(x);
   if (x > 0) {
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

var offset = {x: 0, y:0};
var lastOffset = {x: 0, y:0};
var car = {
	x : 353,
	y : 960,
	angle : 3/2 * Math.PI,
	speed : 10
};


setupLevel();
setupUserEvents();