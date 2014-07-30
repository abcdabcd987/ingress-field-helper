var helper = {
  //------Private Variables:
  body: null,
  canvas: null,
  ctx: null,
  loaded: false,
  img: null,
  dragMouseX: 0,
  dragMouseY: 0,
  offsetX: 0,
  offsetY: 0,


  //------Public Functions:
  Init: function Init() {
    helper.body = document.getElementsByTagName("body")[0];
    helper.body.addEventListener("dragenter", helper.dragEnter, false);
    helper.body.addEventListener("dragleave", helper.dragLeave, false);
    helper.body.addEventListener("dragover", helper.dragOver, false);
    helper.body.addEventListener("drop", helper.drop, false);
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

  updateDragMouse: function updateDragMouse(e) {
    helper.dragMouseX = e.x;
    helper.dragMouseY = e.y;
  },

  dragEnter: function dragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!helper.loaded) {
      helper.addClass(this, 'drag-over');
      return;
    }

    //updateDragMouse(e);
  },

  dragLeave: function dragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!helper.loaded) {
      helper.removeClass(this, 'drag-over');
      return;
    }
  },

  dragOver: function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!helper.loaded) {
      return;
    }
    updateDragMouse(e);
  },

  drop: function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!helper.loaded) {
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

        helper.updateCanvas();
        helper.loaded = true;
      };
      reader.onload = function(e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      return;
    }
  },

  getRGBA: function getRGBA(img, x, y) {
    var w = img.width;
    var i = (y*w+x)*4;
    return [img.data[i], img.data[i+1], img.data[i+2], img.data[i+3]];
  },

  setRGBA: function setRGBA(img, x, y, v) {
    var w = img.width;
    var i = (y*w+x)*4;
    img.data[i] = v[0];
    img.data[i+1] = v[1];
    img.data[i+2] = v[2];
    img.data[i+3] = v[3];
  },

  updateCanvas: function updateCanvas() {
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
          var blockY = Math.floor(i/10) % 2;
          var blockX = Math.floor(j/10) % 2;
          if (blockX != blockY) {
            rgba = [192, 192, 192, 255];
          } else {
            rgba = [248, 248, 248, 255];
          }
        }
        helper.setRGBA(data, j, i, rgba);
      }
    }
    helper.canvas.width = helper.width;
    helper.canvas.height = helper.height;
    helper.ctx.putImageData(data, 0, 0);
  }

};
