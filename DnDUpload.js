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
  
  FileQueue : [],

   
  dropZoneHeight    : 400,
  
  dropZoneWidth     : 400,
  
  dropZoneText      : 'Drop here',
  
  dropZoneStyle     : 'default',
  
  cancelButton      : 'Cancel',

  maxFileSize       : 500,
  
  totalFileSize     : 0,
  
  serverUploadLimit : 4,
  
  message : {
    BROWSER_NOT_SUPPORTED : 'the browser doesn\'t support the awesome dran n\' drop method!'
  },
         
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
      '<div class="fileSize"><strong>{fileSize}</strong> {fileSizeType}</div>',
      '<div class="fileName" title="{fileName}">{fileName}</div>',
    '</div>',
    '<button type="button" class="cancel">{cancelButton}</button>',
  ],
          
  
          
  init: function(options) {
    this._setOptions(options);
    this._buildDropZone();
    
    
    
    if(this._checkBrowser()){
      this._addEventListener();      
    }
  },
          
  
  _addEventListener : function(){
    var _this = this;
    
    this.Element.addEventListener('click',    function(event){DnDUpload.prototype.onClick(event,_this);return false;});
    
    this.Element.addEventListener('dragover', function(event){DnDUpload.prototype.onDragOver(event,_this);return false;});
    this.Element.addEventListener('dragexit', function(event){DnDUpload.prototype.onDragEnd(event,_this);return false;});
    this.Element.addEventListener('dragend',  function(event){DnDUpload.prototype.onDragEnd(event,_this);return false;});
    this.Element.addEventListener('drop',     function(event){DnDUpload.prototype.onDrop(event,_this);return false;});
  },
          
  onClick : function(event,_this){          
    // find hidden input field
    var hiddenInput = _this.Element.getElementsByClassName('hiddenFileInput')[0];
    hiddenInput.click();
    return false;
  },
    
  onDragOver : function(event,_this){
    event.preventDefault();event.stopPropagation();      
    var DD = _this.Element.getElementsByClassName('DropZone')[0];
    DD.classList.add('enter');
    return false;
  },
          
  onDragEnd : function(event,_this){
    event.preventDefault();event.stopPropagation();      
    var DD = _this.Element.getElementsByClassName('DropZone')[0];
    DD.classList.remove('enter');
    return false;
  },
          
  onDrop  : function(event,_this){
    event.preventDefault();event.stopPropagation();      
    
    var DD = _this.Element.getElementsByClassName('DropZone')[0];
    
    var files = event.dataTransfer.files;
    files.each(function(index,file){
      if(typeof file === 'object')
        _this._addFile(file);  
    });    
    
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
    
    this._createHiddenInput();
    
    return this;
  },
          
          
  _createHiddenInput : function(){
    var hiddenFileInput = document.createElement('input');
    hiddenFileInput.type      = 'file';
    hiddenFileInput.name      = 'hiddenFileInput';
    hiddenFileInput.className = 'hiddenFileInput';
    hiddenFileInput.style.display = 'none';
    //hiddenFileInput.setAttribute("multiple", "multiple");
    this.Element.appendChild(hiddenFileInput);
    
    // on file select
    var _this = this;
    hiddenFileInput.addEventListener('change', function(event){
      this.files.each(function(index,file){
        if(typeof file === 'object')
          _this._addFile(file);  
      });
    });
  },
          
  _addFile : function(fileObj){
    
    var readableFile = this._getReadableFileSize(fileObj.size);
    
    var tempVars = {
      fileName      : fileObj.name,
      fileType      : this._getFileType(fileObj.type),
      fileSize      : readableFile.size,
      fileSizeType  : readableFile.type,
    }
    var file = document.createElement('div');
    file.className = 'file';
    file.innerHTML = this._prepareTemplate(this.fileTemplate,tempVars);
    this.DropZone.getElementsByClassName('FileContainer')[0].appendChild(file);
    
    this.FileQueue.push({
      file    : fileObj,
      fileEl  : file
    });
    
    this.totalFileSize += fileObj.size;
    console.log(this._getReadableFileSize(this.totalFileSize,true));
  },
          
  _getReadableFileSize : function(size, precision){
    var obj = {size: size,type : 'byte'};
    if(size<1024) return obj;
    for(maxSize in this.sizeType){
      if(size<=maxSize)
        break;

      s = size/maxSize;
      obj.size = (precision) ? Math.round(s * 100) / 100 : Math.round(s);
      obj.type = this.sizeType[maxSize];
    };    
    return obj;
  },
          
  _getFileType : function(type){
    if(type.indexOf('video')>=0) 
      fileType = 'movie';
    else if(type.indexOf('zip')>=0) 
      fileType = 'zip';
    else if(type.indexOf('image')>=0) 
      fileType = 'image';
    else 
      fileType = 'doc';

    return fileType;
  },          
  
  
  _prepareTemplate : function(template, varObj){
    var html = template.join("");
    var tempVars = html.match(/\{.*?\}/g);
    
    tempVars.each(function(key,varName,_this){
      var propName = varName.substring(1,varName.length-1);
      var value = (varObj && varObj[propName]) ? varObj[propName] : _this[propName];
      html = html.replace(varName, value);
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
          
          
  _checkBrowser : function(){

    if(window.FileReader===undefined){
      var error = document.createElement('div');
      error.className = 'error';
      error.innerHTML = [
        '<div class="message">Your browser does not support drag\'n\'drop file uploads.</div>',
        '<div class="supportedBrowsers">',
          '<div class="ff"><span>FireFox</span></div>',
          '<div class="chrome"><span>Chrome</span></div>',
          '<div class="ie10"><span>IE 10</span></div>',
        '</div>'
      ].join("");
      this.Element.firstChild.appendChild(error);
      return false;
    }
    return true;
  },


  EOF: 'END OF OBJ'
};




