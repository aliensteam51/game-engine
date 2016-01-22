GameEngine.GLRenderer = GameEngine.Renderer.extend({
  _className: "GameEngine.GLRenderer",
  _programScripts: [],
  _programKeys: [],
  
  loadPrograms: function(completion) {
    var programScripts = this._programScripts;
    var programKeys = this._programKeys;
                          
    var loadCount = programKeys.length;
    var completionFunction = function() {
      loadCount --;
      if (loadCount === 0) {
        this.setupGL();
        if (completion) {
          completion();
        }
      }
    }.bind(this);
    
    for (var i = 0; i < programKeys.length; i ++) {
      this.loadProgram(programKeys[i], programScripts[i], completionFunction);
    }
  },
  
  loadProgram: function(programKey, scriptIDs, completion) {
    var script1 = document.getElementById(scriptIDs[0]);
    var script2 = document.getElementById(scriptIDs[1]);
    var scripts = [script1, script2];
    
    // First load the shader scripts
    loadScripts(scripts, function() {
      var gl = getGL();
      var program = createProgramFromScripts(gl, scriptIDs[0], scriptIDs[1]);
      if (program) {
        this[programKey] = program;
        if (completion) {
          completion();
        }
      }
      else {
        console.log("WARNING " + this._className + ": Failed to create WebGL program");
        if (completion) {
          completion();
        }
      }
    }.bind(this));
  },
  
  setupGL: function() {
  },
  
  render: function(objectToRender) {
  
  }
});