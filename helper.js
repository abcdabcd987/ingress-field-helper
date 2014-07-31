var algo = {};

var helper = {
  //------Private Variables:
  body: null,
  canvas: null,
  ctx: null,
  img: null,
  dragMouseX: 0,
  dragMouseY: 0,
  offsetX: 0,
  offsetY: 0,
  lastUpdate: 0,


  //------Public Functions:
  Init: function Init() {
    helper.body = document.getElementsByTagName("body")[0];
    helper.body.addEventListener("dragenter", helper.bodyDragEnter, false);
    helper.body.addEventListener("dragleave", helper.bodyDragLeave, false);
    helper.body.addEventListener("dragover", helper.bodyDragOver, false);
    helper.body.addEventListener("drop", helper.bodyDrop, false);
    window.addEventListener('resize', function(e) { helper.updateCanvas(); });

    helper.canvas = document.getElementById('canvas');
    helper.ctx = helper.canvas.getContext('2d');
  },


  //------Private Functions:
  addClass: function addClass(element, className) {
    element.className += ' ' + className;
  },

  removeClass: function removeClass(element, className) {
    var rxp = new RegExp("\\s?\\b" + className + "\\b", "g");
    element.className = element.className.replace(rxp, '');
  },

  bodyDragEnter: function bodyDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    helper.addClass(this, 'drag-over');
  },

  bodyDragLeave: function bodyDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    helper.removeClass(this, 'drag-over');
  },

  bodyDragOver: function bodyDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  bodyDrop: function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    helper.removeClass(this, 'drag-over');

    var file = e.dataTransfer.files;
    if (file.length !== 1) {
      console.error('You should drag and drop only ONE file.');
      return true;
    }
    file = file[0];

    if (!file.type.match('image/png')) {
      console.error('Support png only.');
      return true;
    }

    var img = new Image();
    var reader = new FileReader();
    img.onload = function() {
      helper.canvas.width = img.width;
      helper.canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      helper.img = ctx.getImageData(0, 0, img.width, img.height);

      helper.body.removeEventListener("dragenter", helper.bodyDragEnter);
      helper.body.removeEventListener("dragleave", helper.bodyDragLeave);
      helper.body.removeEventListener("dragover", helper.bodyDragOver);
      helper.body.removeEventListener("drop", helper.bodyDrop);

      helper.canvas.addEventListener("mousedown", helper.canvasMouseDown, false);
      helper.canvas.addEventListener("mouseup", helper.canvasMouseUp, false);

      helper.updateCanvas();
    };
    reader.onload = function(e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  getRGBA: function getRGBA(img, x, y) {
    var w = img.width;
    var i = (y*w+x)*4;
    return (img.data[i]<<24) | (img.data[i+1]<<16) | (img.data[i+2]<<8) | img.data[i+3];
  },

  setRGBA: function setRGBA(img, x, y, v) {
    var w = img.width;
    var i = (y*w+x)*4;
    img.data[i] = v>>>24;
    img.data[i+1] = (v>>>16)&0xFF;
    img.data[i+2] = (v>>>8)&0xFF;
    img.data[i+3] = v&0xFF;
  },

  updateCanvas: function updateCanvas() {
    var timer_st = (new Date()).getTime();
    //if (timer_st-helper.lastUpdate < 200) {
    //  return;
    //}

    helper.width = helper.canvas.clientWidth;
    helper.height = helper.canvas.clientHeight;
    var data = helper.ctx.createImageData(helper.width, helper.height);
    for (var i = 0; i < helper.height; ++i) {
      for (var j = 0; j < helper.width; ++j) {
        var isInside = helper.offsetY <= i && i <= helper.offsetY+helper.img.height
                    && helper.offsetX <= j && j <= helper.offsetX+helper.img.width;
        var rgba = null;
        if (isInside) {
          rgba = helper.getRGBA(helper.img, j-helper.offsetX, i-helper.offsetY);
        } else {
          var blockY = (i>>3)&1;
          var blockX = (j>>3)&1;
          if (blockX != blockY) {
            rgba = (192<<24) | (192<<16) | (192<<8) | 255;
          } else {
            rgba = (248<<24) | (248<<16) | (248<<8) | 255;
          }
        }
        helper.setRGBA(data, j, i, rgba);
      }
    }
    helper.canvas.width = helper.width;
    helper.canvas.height = helper.height;
    helper.ctx.putImageData(data, 0, 0);

    var timer_ed = (new Date()).getTime();
    console.debug('helper.updateCanvas: ' + (timer_ed - timer_st) + 'ms', 'Interval: ' + (timer_st-helper.lastUpdate) + 'ms');
    helper.lastUpdate = timer_st;
  },

  updateDragMouse: function updateDragMouse(e) {
    helper.dragMouseX = e.x;
    helper.dragMouseY = e.y;
  },

  canvasMouseDown: function canvasMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    helper.canvas.addEventListener("mousemove", helper.canvasMouseMove, false);
    helper.updateDragMouse(e);
  },

  canvasMouseMove: function canvasMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();
    helper.offsetX += e.x - helper.dragMouseX;
    helper.offsetY += e.y - helper.dragMouseY;
    helper.updateDragMouse(e);
    helper.updateCanvas();
  },

  canvasMouseUp: function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    helper.canvas.removeEventListener("mousemove", helper.canvasMouseMove);
  },
};
