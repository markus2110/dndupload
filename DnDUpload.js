/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * 
 * http://helephant.com/2009/08/17/javascript-prototype-chaining/
 */

/**
 * DnDUpload Helper Class
 * @type Object
 */
var _DnD = {
  forEach : function(obj, callback, scope) {
    for (_key in obj) {
      if (typeof obj[_key] !== 'function')
      callback(obj[_key],_key,scope);
    }
  }
};


/**
 * 
 * @param string elID
 * @param object options
 * @returns DnDUpload.prototype
 */
var DnDUpload = function(elID, options) {
  this.Element    = document.getElementById(elID);
  this.FileQueue  = [];
  this.init(options);
  return this;
};


/**
 * 
 * @type object
 */
DnDUpload.prototype = {
  
  /**
   * Selected Element Id
   * @type String
   */
  ID                : false,
  
  
  /**
   * Selected HTML Element
   * @type Object
   */
  Element           : null,
          

  /**
   * 
   * @type type
   */
  DropZone          : null,
  
  
  /**
   * 
   * @type type
   */
  UploadControls    : null,
  
  
  /**
   * total file size to upload
   * @type Number
   */
  totalFileSize     : 0,
  
  
  /**
   * number of bytes uploaded
   * @type Number
   */
  totalFileSizeP    : 0,
  
  
  /**
   * number of async uploads in progress
   * @type Number
   */
  uploadInProcess   : 0,
  
  
  /**
   * upload pause
   * @type Boolean
   */
  uploadPause       : false,
  
  /**
   * Size types and number of bytes
   * @type Object
   */
  sizeType: {
    'byte'  : 0,
    'kb'    : 1024,
    'mb'    : 1048576,
    'gb'    : 1073741824,
    'tb'    : 1099511627776,
    
    0: 'byte', 1024: 'kb', 1048576: 'mb', 1073741824: 'gb', 1099511627776: 'tb'
  },  
  
  
  
  
  properties :{
    
    /**
     * 
     * @type Array
     */
    allowedFileTypes : ['jpg','bmp','png','gif'],
            
            
    /**
     * (string) 1MB or (number) 1048576
     * number value should be in byte
     * @type mixed 
     */  
    maxAllowedFileSize : '250MB',      
            
            
    /**
     * (string) 1MB or (number) 1048576
     * number value should be in byte
     * @type mixed 
     */
    maxServerUploadSize : '512kb',
            
    /**
     * 
     * @type String
     */
    url : 'upload.php',
    
    
    /**
     * 
     * @type String
     */
    removeUrl : 'upload.php?remove=1',
    
    
    /**
     * 
     * @type Number
     */
    totalAsyncUploads : 1,


    /**
     * 
     * @type String
     */
    layout  : 'default',

            

    /**
     * 
     * @type Number
     */
    height  : 400,
            
    /**
     * 
     * @type Number
     */
    width   : 600        

  },
  
  templates : {
    /**
     * DropZone Container Template
     * @type Array
     */
    dropZoneTpl: [
      '<form name="frm{ID}" action="#" method="post" enctype="multipart/form-data">',
        '<div id="FileContainer_{ID}" class="FileContainer"></div>',  
        '<div id="DropText_{ID}" class="DropText">{i18n.dropText}</div>',
      '</form>',

      '<div id="TotalUpload_{ID}" class="TotalUpload">',
        '<div class="progress"><div id="TotalUploadProgress_{ID}" style="width:0%">&nbsp;</div></div>',
        '<div class="meta">',
          '<div class="percentage">0%</div>',
          '<span>&nbsp</span>',
          '<div class="uploadControl">',
          '<a href="javascript:void(0);"    class="stop" title="{i18n.STOP}">&nbsp;</a>',
            '<a href="javascript:void(0);"  class="pause" title="{i18n.PAUSE}">&nbsp;</a>',
            '<a href="javascript:void(0);"  class="play" title="{i18n.PLAY}">&nbsp;</a>',
          '</div>',
        '</div>',
      '</div>'
    ],    
            

    /**
     * File Template
     * @type Array
     */
    fileTemplate: [
      '<div class="preview {fileType}">',
        //'<div class="statusIcon complete"></div>',
      '</div>',
      '<div class="progress"><span style="width:0%">&nbsp;</span></div>',
      '<div class="fileMeta">',
        '<div class="fileSize"><strong>{fileSize}</strong> {fileSizeType}</div>',
        '<div class="fileName" title="{fileName}">{fileName}</div>',
      '</div>',
      '<div class="removeFile"><a href="#" onclick="return false;">{i18n.remove}</a></div>',
      '<button type="button" class="cancel">{i18n.cancel}</button>',

    ]
  },
  

          
          
          

          
  
  _addEventListener : function(){
    var _this = this;
    
    this.DropZone.addEventListener('click',   function(event){DnDUpload.prototype.onClick(event,_this);return false;});
    
    this.Element.addEventListener('dragover', function(event){DnDUpload.prototype.onDragOver(event,_this);return false;});
    this.Element.addEventListener('dragexit', function(event){DnDUpload.prototype.onDragEnd(event,_this);return false;});
    this.Element.addEventListener('dragleave',function(event){DnDUpload.prototype.onDragEnd(event,_this);return false;});
    this.Element.addEventListener('dragend',  function(event){DnDUpload.prototype.onDragEnd(event,_this);return false;});
    this.Element.addEventListener('drop',     function(event){DnDUpload.prototype.onDrop(event,_this);return false;});
    
    // Upload control buttons
    this.UploadControls = document.getElementById("TotalUpload_"+this.ID).getElementsByTagName('a');
    this.UploadControls[0].addEventListener('click', function(event){DnDUpload.prototype.cancelAll(_this);return false;});
    this.UploadControls[1].addEventListener('click', function(event){DnDUpload.prototype.pauseAll(_this);return false;});
    this.UploadControls[2].addEventListener('click', function(event){DnDUpload.prototype.startUpload(_this);return false;});
  },

          
  onClick : function(event,_this){
    // find hidden input field
    if(event.target===_this.DropZone){
      hiddenInput = _this.Element.getElementsByClassName('hiddenFileInput')[0];
      return hiddenInput.click();
    }
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
    _DnD.forEach(files, function(file){
      if(typeof file === 'object')
        _this._addFile(file);  
    });
    
    _this.onDragEnd(event,_this);
    return false;
  },          
          
          
  startUpload : function(_this){
    _this.uploadPause=false;
    
    if(_this.uploadInProcess===0){
      _DnD.forEach(_this.FileQueue, function(fileObj,index,_this){
        _this.uploadInProcess++;
        do{
          console.log('not ready');
        }while(_this.sendChunks(fileObj)==='DONE')      
      },_this);
    };

    _this.UploadControls[0].className="stop";
    _this.UploadControls[1].className="pause";
    _this.UploadControls[2].className="play active";
    
  },
          
          
  pauseAll : function(_this){
    if(_this.uploadInProcess>0){
      _this.uploadPause = true;
      _this.UploadControls[0].className="stop";
      _this.UploadControls[1].className="pause active";
      _this.UploadControls[2].className="play";
    }
    
  },          


  cancelAll : function(_this){
    console.log('Cancel');
    _this.uploadInProcess = 0;
    _this.uploadPause     = false;
    _this.UploadControls[0].className="stop active";
    _this.UploadControls[1].className="pause";
    _this.UploadControls[2].className="play";
  },            
            
    sendChunks : function(fileObj, totalSend){
      
      //console.log(fileObj);
      var _this         = this;
      var totalSend     = totalSend || 0;
      var totalFileSize = fileObj.file.size;

      console.log(this.uploadInProcess);
      if(this.uploadPause){
        window.setTimeout(function(){
          _this.sendChunks(fileObj,totalSend);
        }, 1000);    
        return false;
      }      
      
      var progressBar = fileObj.fileEl.getElementsByTagName('span');
      var totalBar    = document.getElementById("TotalUploadProgress_"+this.ID);
      var pre         = document.getElementById("TotalUpload_"+this.ID).getElementsByClassName('percentage')[0];

      
      fEnd = (totalSend+this.maxServerUploadSize>=totalFileSize) ? totalFileSize : totalSend+this.maxServerUploadSize;
      
      var formData = new FormData();
      formData.append('id', 'test');
      formData.append('path', '/download/test/');
      formData.append('fileName', fileObj.file.name);
      formData.append('fileType', fileObj.file.type);
      formData.append('file', fileObj.file.slice(totalSend,fEnd));

      

      var sTime = new Date().getTime();
      var eTime = 0;
      var tSent = fEnd-totalSend;
      var xhr = new XMLHttpRequest();
      
      xhr.open('POST', this.url);
      
      
      xhr.onreadystatechange = function(){
        if(this.readyState === this.DONE){
          eTime = new Date().getTime();
          var totalTime = eTime-sTime;
          var x = totalTime / 1000;
          
          var d = _this._getReadableFileSize(tSent/x,true)
          
          console.log('send', d);
        }
      }

//      xhr.onloadend= function(){}      
      
      xhr.onload = function(){
        
        if(totalSend < totalFileSize){
          totalSend += _this.maxServerUploadSize;
          _this.totalFileSizeP += _this.maxServerUploadSize;
          
          //console.log(_this.totalFileSizeP);
          var p = Math.floor((_this.totalFileSizeP/_this.totalFileSize)*100);
          totalBar.style.width = p+'%';     
          pre.innerHTML = p+'%';     
          
          _this.sendChunks(fileObj,totalSend);          
        }else{
          progressBar[0].style.width = '100%';  
          _this.uploadInProcess--;
          return 'DONE';
        }
      };
      
      xhr.upload.addEventListener("progress", function(e){
        var s = totalSend+e.loaded;
        var p = Math.round((s/totalFileSize)*100);
        progressBar[0].style.width = p+'%';              
      }, false);     

      
      xhr.send(formData);        
    },          
   
 
       
          
          
  _addFile : function(fileObj){
    var _this = this;
    
    if(this.checkFile(fileObj)){
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

      var removeTag = file.getElementsByTagName('a')[0];
      removeTag.addEventListener('click', function(event){DnDUpload.prototype._removeFile(file,_this)});

      document.getElementById("FileContainer_"+this.ID).appendChild(file);

      this.FileQueue.push({
        file    : fileObj,
        fileEl  : file
      });

      if(tempVars.fileType === 'image')
        this.setPreviewImage(fileObj,file);

      this.totalFileSize += fileObj.size;
      this._calculateTotal();      
    }
  },
          
  /**
   * Checks is filetype allowed and is file not already exists in FileQueue
   * 
   * @param {object} fileObj
   * @returns {Boolean}
   */        
  checkFile : function(fileObj){
    var allowed = false;

    // check is file allowed
    if(this.allowedFileTypes !== null){
      var filePrefix = fileObj.name.split(".");
      filePrefix = filePrefix[filePrefix.length-1];
      for(i in this.allowedFileTypes){
        if(typeof this.allowedFileTypes[i] === 'string' && filePrefix===this.allowedFileTypes[i]){
          allowed = true;
          break;
        }
      }
      if(!allowed){
        alert(this._prepareString(this.i18n.errors.FILE_NOT_ALLOWED,{FileType:filePrefix}));
        return false;
      }
    }

    // check is file already exists
    var fileNameUploaded = fileObj.name;
    if(this.FileQueue.length > 0){
      for(file in this.FileQueue){
        var fileName  = this.FileQueue[file].file.name;
        if(fileNameUploaded === fileName){
          alert(this._prepareString(this.i18n.errors.FILE_ALREADY_EXISTS,{FileName:fileObj.name}));
          return false;
        }
      }      
      allowed = true;
    }
    
    // check is file size
    if(fileObj.size>this.maxAllowedFileSize){
      var readable = this._getReadableFileSize(this.maxAllowedFileSize);
      var maxAllowed = readable.size + " "+readable.type;
      alert(this._prepareString(this.i18n.errors.FILE_TOO_BIG,{FileName:fileObj.name, AllowedFileSize:maxAllowed}));
      return false;
    }else{
      allowed = true;
    }

    return allowed;
  },
  
  
  setPreviewImage : function(fileObj,el){
    if(fileObj)
    var reader = new FileReader();
    reader.onload = function(e){
      if(e.target.result){
        
        console.log(el.getElementsByTagName('div'));
        
        var previewImg = document.createElement('img');
        previewImg.src    = e.target.result;
        previewImg.title  = fileObj.name;
        previewImg.alt    = fileObj.name;
        previewImg.style.width  = "100%";

        var preview = el.getElementsByTagName('div')[0];
        preview.appendChild(previewImg);
      };
    }
    reader.readAsDataURL(fileObj);
    
    console.log(fileObj);
  },
          
          
  _removeFile : function(file, _this){
    
    // todo : cancel Upload
    
    
    var newQueue = [];
    _DnD.forEach(_this.FileQueue,function(fileObj,index,_that){
      if(fileObj.fileEl !== file){
        newQueue.push(fileObj);
      }
      
      // reduce total file size
      else{
        _that.totalFileSize -= fileObj.file.size;
      }
    },_this);
    _this.FileQueue = newQueue;

    var parentEl = file.parentElement;
    parentEl.removeChild(file);
    
    _this._calculateTotal();
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
          
          
  
          
  _prepareString : function(_string, varObj){
    var tempVars = _string.match(/\{.*?\}/g);

    
    if(!varObj){
      return _string;
    }
    
    _DnD.forEach(tempVars,function(varName){
      var propName  = varName.substring(1,varName.length-1);
      var replace   = (varObj && varObj[propName]) ? varObj[propName] : propName;  
      _string = _string.replace(varName, replace);
    });
    
    return _string;
    
  },
          
          
  

          
          
  _checkBrowser : function(){
    if(window.FileReader===undefined){
      var error = document.createElement('div');
      error.className = 'error';
      error.innerHTML = [
        '<div class="message">'+this.i18n.messages.BROWSER_NOT_SUPPORTED+'</div>',
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


  // NEW
  
  /**
   * 
   * @param Object options
   * @returns void
   */
  init: function(options) {
    this.ID = this.Element.id;
    
    this.setOptions(options).buildDropZone();
    
//    if(this._checkBrowser()){
//      this._addEventListener();      
//    }      
  },  
  
  
  /**
   * 
   * @param Object options
   * @returns {DnDUpload.prototype}
   */
  setOptions : function(options){
    if(options){
      _DnD.forEach(options,function(value,key,_this){
        _this.setProperty(key,value);
      },this);      
    }
    
    /**
     * set max allowd file size
     */
    if(typeof this.properties.maxAllowedFileSize === 'string'){
      var intVal    = parseInt(this.properties.maxAllowedFileSize);
      var sizeType  = this.properties.maxAllowedFileSize.replace(intVal, "");
      this.properties.maxAllowedFileSize = intVal*this.sizeType[sizeType.toLowerCase()];
    };

    /**
     * set max allowd server upload size
     */
    if(typeof this.properties.maxServerUploadSize === 'string'){
      var intVal    = parseInt(this.properties.maxServerUploadSize);
      var sizeType  = this.properties.maxServerUploadSize.replace(intVal, "");
      this.properties.maxServerUploadSize = intVal*this.sizeType[sizeType.toLowerCase()];
    }; 
    
    return this;
  },  
  
          
  /**
   * Creates the DropZone HTML
   * @returns {DnDUpload.prototype}
   */
  buildDropZone: function() {
    var width   = this.getProperty('width');
    var height  = this.getProperty('height');
    
    this.DropZone = document.createElement('div');
    this.DropZone.className = 'DropZone ' + this.getProperty('layout');

    this.DropZone.innerHTML = this.prepareTemplate(this.templates.dropZoneTpl);
    
    this.DropZone.style.width   = (typeof width === 'string')   ? width   : width+'px';
    this.DropZone.style.height  = (typeof height === 'string')  ? height  : height+'px';
    this.Element.appendChild(this.DropZone);
    
    this.createHiddenInput();
    this.calculateTotal();
    
    return this;
  },          


  /**
   * 
   * @param Array template
   * @param Object varObj
   * @returns String
   */
  prepareTemplate : function(template, varObj){
    var html = template.join("");
    var tempVars = html.match(/\{.*?\}/g);
    
    _DnD.forEach(tempVars,function(varName,index,_this){
      var propName = varName.substring(1,varName.length-1);
      
      // use i18n value
      if(propName.indexOf('i18n')>=0){
        var i18nVar = propName.substring(5);
        var value = (_this.i18n[i18nVar]) ? _this.i18n[i18nVar] : i18nVar;
      }else{
        var value = (varObj && varObj[propName]) ? varObj[propName] : _this[propName];  
      }
      
      html = html.replace(varName, value);
    },this);      
    
    
    return html;
  },
          
   

  /**
   * Creates a hidden file input.
   * On DropZone click the default select file window will be shown
   * @returns void
   */
  createHiddenInput : function(){
    var hiddenFileInput = document.createElement('input');
    hiddenFileInput.type              = 'file';
    hiddenFileInput.name              = 'hiddenFileInput';
    hiddenFileInput.className         = 'hiddenFileInput';
    //hiddenFileInput.style.visibility  = 'hidden';
    hiddenFileInput.style.position    = 'absolute';
    hiddenFileInput.style.top         = "-1000px";
    hiddenFileInput.style.left        = "-1000px";
    
    //hiddenFileInput.setAttribute("multiple", "multiple");
    this.Element.appendChild(hiddenFileInput);
    
    // on file select
    var _this = this;
    return hiddenFileInput.addEventListener('change', function(event){
      _DnD.forEach(this.files,function(file){
        if(typeof file === 'object')
          _this._addFile(file);  
      });
    });
  },     
  
  /**
   * 
   * @returns void
   */
  calculateTotal : function(){
    var metaContainer       = document.getElementById("TotalUpload_"+this.ID).getElementsByTagName('span')[0];
    var readableTotalSize   = this.getReadableFileSize(this.totalFileSize,true);
    
    metaContainer.innerHTML = [
      this.FileQueue.length,
      ' '+this.i18n.files,
      " / ",
      readableTotalSize.size,
      " ",
      readableTotalSize.type
    ].join(""); 
  },
  
  
  /**
   * returns a human readable file size object
   * 
   * @param Number size
   * @param bool precision
   * @returns Object
   */
  getReadableFileSize : function(size, precision){
    var obj = {size: size, type : 'byte'};
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


  /**
   * returns the property value
   * @param String name
   * @returns mixed
   */
  getProperty : function(name){
    if(this.properties[name])
      return this.properties[name];
    else
      return false;
  },


  /**
   * set the value of a given property, if exist
   * @param String name
   * @param mixed value
   * @returns void
   */
  setProperty : function(name,value){
    if(this.properties[name])
      this.properties[name] = value;
  },          
  
  EOF: 'END OF OBJ'
};




