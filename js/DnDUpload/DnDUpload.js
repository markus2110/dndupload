/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * 
 * http://helephant.com/2009/08/17/javascript-prototype-chaining/
 */
Object.prototype.each = function(callback, scope) {
  for (_key in this) {
    if (typeof this[_key] !== 'function')
      callback(_key, this[_key], scope);
  }
};



var DnDUpload = function(elID, options) {
  this.Element = document.getElementById(elID);
  this.init(options);
};

/**
 * 
 * @type type
 */
DnDUpload.prototype = {
  Element: null,
          
  DropZone: null,

   
  dropZoneHeight  : 400,
  
  dropZoneWidth   : 400,
  
  dropZoneText    : 'Drop here',
  
  dropZoneStyle   : 'default',
  
  cancelButton    : 'Cancel',

  maxFileSize     : 500,
  
  serverUploadLimit : 4,
  
         
  sizeType: {
    0: 'byte', 1024: 'kb', 1048576: 'mb', 1073741824: 'gb', 1099511627776: 'tb'
  },
  
  // DropZone Template
  dropZoneTpl: [
    '<form name="frm{dropZoneID}" action="#" method="post" enctype="multipart/form-data">',
        '<div id="FileContainer_{dropZoneID}" class="FileContainer"></div>',
        '<div id="DropText_{dropZoneID}" class="DropText">{dropZoneText}</div>',
    '</form>'
  ],
          
  // File Template
  fileTemplate: [
    '<div class="preview {fileType}">',
      '<div class="statusIcon pending"></div>',
    '</div>',
    '<div class="progress"><span style="width:0%"></span></div>',
    '<div class="fileMeta">',
      '<div class="fileSize"><strong>{fileSize}</strong>{fileSizeType}</div>',
      '<div class="fileName" title="{fileName}">{fileName}</div>',
    '</div>',
    '<button type="button" class="cancel">{cancelButton}</button>',
  ],
          
  
          
  init: function(options) {

    this._setOptions(options);

    this._buildDropZone();

    this._addEventListener();
    
  },
          
  
  _addEventListener : function(){
    var _this = this;
    
    //this.Element.addEventListener('mouseover',  function(event){DnDUpload.prototype.onMouseOver(event,_this);return false;});
    //this.Element.addEventListener('mouseout',   function(event){DnDUpload.prototype.onMouseOut(event,_this);return false;});
    
    //this.Element.addEventListener('ondragover',   function(event){return false;});
    //this.Element.addEventListener('dragout',    function(event){DnDUpload.prototype.onMouseOut(event,_this);return false;});
    //this.Element.addEventListener('dragend',    function(event){DnDUpload.prototype.onMouseOut(event,_this);return false;});
    
    
    //this.Element.ondragover   = function(e){return false};
    this.Element.addEventListener('dragover',     function(event){DnDUpload.prototype.onMouseOver(event,_this);return false;});
    this.Element.addEventListener('dragexit',     function(event){DnDUpload.prototype.onMouseOut(event,_this);return false;});
    this.Element.addEventListener('drop',         function(event){DnDUpload.prototype.onDrop(event,_this);return false;});
    
    
  },
    
          
  onMouseOver : function(event,_this){
    event.preventDefault();event.stopPropagation();      
    
    var DD = _this.Element.getElementsByClassName('DropZone')[0];
    //console.log(DD.className); //.add('enter');
    return false;
  },
          
  onMouseOut  : function(event,_this){
    event.preventDefault();event.stopPropagation();      
    
    var DD = _this.Element.getElementsByClassName('DropZone')[0];
    DD.classList.remove('enter');
    return false;
  },
          
  onDrop  : function(event,_this){
    event.preventDefault();event.stopPropagation();      
    
    var DD = _this.Element.getElementsByClassName('DropZone')[0];
    
    var dropData = event.dataTransfer;
    //console.log(dropData);
    console.dir(dropData);
    
    return false;
    
  },          
          
          
          
  /**
   * 
   * @returns {DnDUpload.prototype}
   */
  _buildDropZone: function() {
    this.DropZone = document.createElement('div');
    this.DropZone.className = 'DropZone ' + this.dropZoneStyle;

    this.DropZone.innerHTML = this._prepareTemplate(this.dropZoneTpl);
    this.DropZone.style.width   = this.dropZoneWidth+'px';
    this.DropZone.style.height  = this.dropZoneHeight+'px';
    
    this.Element.appendChild(this.DropZone);
    return this;
  },
          
          
  _addFile : function(){
    var file = document.createElement('div');
    file.className = 'file';
    file.innerHTML = this._prepareTemplate(this.fileTemplate);
    this.DropZone.getElementsByClassName('FileContainer')[0].appendChild(file);
  },
  
  
  _prepareTemplate : function(template){
    var html = template.join("");
    var tempVars = html.match(/\{.*?\}/g);
    tempVars.each(function(key,varName,_this){
      var propName = varName.substring(1,varName.length-1);
      html = html.replace(varName, _this[propName]);
    },this);
    return html;
  },
  
  _setOptions : function(options){
    if(options){
      options.each(function(key,value,_this){
        if(_this[key])
          _this[key] = value;
      },this);      
    }
  },


  EOF: 'END OF OBJ'
};




