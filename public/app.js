var X = 0,
    Y = 0,
    socket,
    TILE_WIDTH = 99,
    TILE_HEIGHT = 82,
    WIDTH,
    HEIGHT,
    current = 0;

onhashchange = loadMap;


// Implement Object.keys for browsers that don't have it
if (!Object.keys) {
  Object.keys = function (obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }
}

// forEach for objects, very handy
Object.forEach = function forEach(obj, callback, thisObject) {
  var keys = Object.keys(obj);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    var key = keys[i];
    callback.call(thisObject, obj[key], key, obj);
  }
};


function generateTiles() {
  var html = [];
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      html.push('<div id="background_' + x + "x" + y + '" style="top: ' + (y * TILE_HEIGHT) + 'px; left: ' + x * TILE_WIDTH + 'px"></div>');
    }
  }
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      html.push('<div class="tileHandle" id="' + x + "x" + y + '" style="top: ' + (y * TILE_HEIGHT) + 'px; left: ' + x * TILE_WIDTH + 'px"></div>');
    }
  }

  mapDiv.innerHTML = html.join("\n");
}

function generatePalette() {
  var html = [];
  imageClasses.forEach(function (name, i) {
    html.push('<div style="top: ' + (i * 120 + 20) + 'px; left: 20px" class="tile ' + name + '"></div>');
  });
  imageClasses.forEach(function (name, i) {
    var className = (i == 0) ? "tileHandle tileActive" : "tileHandle";
    html.push('<div id="item-' + i + '" style="top: ' + (i * 120 + 20) + 'px; left: 20px" class="' + className + '"></div>');
  });
  paletteDiv.innerHTML = html.join("\n");
}

function loadMap() {
  var hash = window.location.hash.replace(/^#/, '');
  if (!hash) {
    window.location.hash = "#" + X + "/" + Y;
  }
  var parts = hash.split("/");
  X = parseInt(parts[0], 10);
  Y = parseInt(parts[1], 10);
  oldWIDTH = WIDTH;
  oldHEIGHT = HEIGHT;
  WIDTH = parseInt(parts[2], 10) || Math.floor(document.width / TILE_WIDTH) + 1;
  HEIGHT = parseInt(parts[3], 10) || Math.floor(document.height / TILE_HEIGHT) + 1;

  if (oldWIDTH != WIDTH || oldHEIGHT != HEIGHT) {
    generateTiles();
  }

  generatePalette();

  socket.send(JSON.stringify({x:X,y:Y,w:WIDTH,h:HEIGHT}));

}


function get(id) {
  return document.getElementById(id);
}

var mapDiv, paletteDiv, mainDiv;

window.onload = function () {

  mapDiv = get("map");
  paletteDiv = get("palette");
  mainDiv = get("main");


  mainDiv.addEventListener('click', onClick);
  mainDiv.addEventListener('keypress', onKeypress);

  socket = new io.Socket(null);
  socket.connect();
  socket.on('message', onMessage);
  socket.on('connect', loadMap);

};

function onMessage(message) {
  try {
    message = JSON.parse(message);
  } catch (e) {
    console.log(message);
    return;
  }
  Object.forEach(message, function (column, x) {
    x = parseInt(x, 10);
    Object.forEach(column, function (value, y) {
      y = parseInt(y, 10);
      set(x, y, value);
    });
  });
}

// Pan with the wasd keys
function onKeypress(e) {
  switch(e.charCode) {
    case 119: // w
      window.location.hash = "#" + X + "/" + (Y - 1);
      break;
    case 97:  // a
      window.location.hash = "#" + (X - 1) + "/" + Y;
      break;
    case 115: // s
      window.location.hash = "#" + X + "/" + (Y + 1);
      break;
    case 100: // d
      window.location.hash = "#" + (X + 1) + "/" + Y;
      break;
  }
}

function onClick(e) {
  if (e.target.className.substr("tileHandle") < 0) return;
  var id = e.target.id;

  if (id.indexOf('item-') === 0) {
    current = id.substr(id.indexOf('-') + 1);
    document.getElementsByClassName("tileActive")[0].className = "tileHandle";
    e.target.className += " tileActive";
    return;
  }
  if (id.indexOf('x') > 0) {
    var parts = id.split("x");
    save(parseInt(parts[0], 10) + X, parseInt(parts[1], 10) + Y, current);
  }
}

function save(x, y, value) {
  x = parseInt(x, 10);
  y = parseInt(y, 10);
  socket.send(JSON.stringify({x:x,y:y,v:value}));
}

function set(x, y, value) {
  x = parseInt(x, 10);
  y = parseInt(y, 10);
  var id = 'background_' + (x - X) + "x" + (y - Y);
  var div = get(id);
  if (div) {
    div.className = "tile " + imageClasses[value];
  }
}

