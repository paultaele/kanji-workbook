// #region ############### KANJI WORKBOOK CODE ############### 
;
// #region Initializer

function init() {

  // set background
  document.body.style.backgroundImage = Backgrounds.practiceImage;
  document.body.style.backgroundColor = Backgrounds.practiceColor;

  // check for valid login
  checkLogin();

  // get the canvas and its context
	canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // react to mouse events on the canvas, and mouseup on the entire document
  addCanvasListeners(canvas);

  // hide the workbook area initially
  var workbookArea = document.getElementById("workbookarea");
  workbookArea.style.display = "none";

  //
  idsToSymbolsData = readFileSync(idsToSymbolsDataFile);
}

function checkLogin() {

  // set login page
  var loginPage = "index.html";

  // get cookie
  var cookie = document.cookie;
  
  // debug
  console.log("cookie: " + cookie);

  // tokenize the cookie
  var tokens = cookie.split(/[\s;=]+/);

  // get index of "username"
  var found = tokens.findIndex(function(element) {
    return element === "username";
  });

  // case: "username" not found => go back to login page
  if (found < 0) { window.location.href = loginPage; }
  
  // get username
  var username_text = tokens[found + 1];

  // case: "username" is empty => go back to login page
  if (username_text === "") { window.location.href = loginPage; }

  // set header message
  var headerMessage = document.getElementById("header_message");
  headerMessage.innerHTML = "こんにちは, <strong>" + username_text + "</strong>";
}

function displayHeader() {

}

function reset() {
  //
  var workbookArea = document.getElementById("workbookarea");
  workbookArea.style.display = "grid";

  // #region Clear Setup
  // initialize the canvas states
  canvasStates = [];

  // clear feedback
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = "";
  // #endregion

  // #region Image Data Setup
  // read the image paths and load first image
  imagesData = getImagesData(imagesDataFile);
  imageIndex = 0;
  // loadCanvasImage(canvas, context, imagesData[imageIndex].path, true);
  // #endregion

  // #region Model Data Setup
  // read the models and templates data
  modelsData = readFileSync(modelsDataFile);
  templatesData = readFileSync(templatesDataFile);
  // #endregion

  // #region Button Setup
  // disable the transition buttons appropriately
  document.getElementById("backButton").disabled = true;
  if (imagesData.length < 2) {
    document.getElementById("nextButton").disabled = true;
  }
  
  // disable the feedback button
  document.getElementById("feedbackButton").disabled = true;
  // #endregion
}

function removeCanvasListeners(canvas) {
  canvas.removeEventListener('mousedown', canvas_mouseDown);
  canvas.removeEventListener('mousemove', canvas_mouseMove);
  canvas.removeEventListener('mouseup', canvas_mouseUp);

  canvas.removeEventListener('touchstart', canvas_touchStart);
  canvas.removeEventListener('touchend', canvas_touchEnd);
  canvas.removeEventListener('touchmove', canvas_touchMove);
}

function addCanvasListeners(canvas) {
  // react to mouse events on the canvas, and mouseup on the entire document
  canvas.addEventListener('mousedown', canvas_mouseDown, false);
  canvas.addEventListener('mousemove', canvas_mouseMove, false);
  canvas.addEventListener('mouseup', canvas_mouseUp, false);

  // react to touch events on the canvas
  canvas.addEventListener('touchstart', canvas_touchStart, false);
  canvas.addEventListener('touchend', canvas_touchEnd, false);
  canvas.addEventListener('touchmove', canvas_touchMove, false);
}

// #endregion

// #region Animation Functions

function stepsButton(canvas, context) {
  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  if (canvasState !== undefined) {
    context.putImageData(canvasState, 0, 0);
  }

  // get the strokes and corresponding results
  var modelStrokes = modelsData[imageIndex].strokes;
  var numStrokes = modelStrokes.length;
  
  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1000;
  var timeLimit = cycleTime * numStrokes;
  var cycle = -1;

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var modelStroke = modelStrokes[cycle];

      // paint the feedback stroke
      paintStrokes(context, [modelStroke], Colors.blue, Opaqueness.heavy, 10);
    }

    // animate the next step
    requestAnimationFrame(animate);
  });
}

function demoButton(canvas, context) {
  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);

  // revert to empty canvas
  // note: undefined check needed if canvas state hasn't been created (e.g., at start)
  var canvasState = canvasStates[0];
  if (canvasState !== undefined) {
    context.putImageData(canvasState, 0, 0);
  }

  // get the input and model sketch's strokes
  var modelStrokes = modelsData[imageIndex].strokes;

  // set the stroke properties
  var color = Colors.blue;
  var opaqueness = 1.0;
  context.lineWidth = 10;
  context.strokeStyle = "rgba(" + color + "," + opaqueness + ")";
  
  // initialize the data structures
  Anim.vertices = [];
  Anim.startVertices = [];

  // convert model strokes to vertices and start vertices
  var counter = 0;
  for (var i = 0; i < modelStrokes.length; ++i) {
    // get the current model stroke and corresponding points
    var modelStroke = modelStrokes[i];
    var modelPoints = modelStroke.points;

    // convert the model point to vertex
    for (var j = 0; j < modelPoints.length; ++j) {
      // get the current model point and corresponding vertex
      var modelPoint = modelPoints[j];
      var vertex = { x: modelPoint.x, y: modelPoint.y };
      Anim.vertices.push(vertex);
      
      // increment counter; needed to mark start vertices
      ++counter;
    }

    // add the counter position of next model stroke
    Anim.startVertices.push(counter);
  }

  // initialize the animation step
  Anim.step = 0;

  // run the animation
  demoAnimate();
}

function demoAnimate(time) {
  
  // final step not reached => send animation request
  if(Anim.step < Anim.vertices.length - 2) {
    requestAnimationFrame(demoAnimate);
  }

  // animation step's vertex is start of next stroke => skip
  if (Anim.step + 1 === Anim.startVertices[0]) {
    // increment step
    ++Anim.step;

    // disregard latest start vertex
    Anim.startVertices.shift();

    // skip animation
    return;
  }

  // draw a line segment from the last waypoint to the current waypoint
  context.beginPath();
  context.moveTo(Anim.vertices[Anim.step].x, Anim.vertices[Anim.step].y);
  context.lineTo(Anim.vertices[Anim.step + 1].x, Anim.vertices[Anim.step + 1].y);
  context.stroke();

  // increment the step
  ++Anim.step;

  // last step => revert to current strokes
  if (Anim.step === Anim.vertices.length - 1) {

    // restore to original canvas state
    context.putImageData(Anim.originalState, 0, 0);

    // restore to original button states
    lockInterface(false);
  }

}

function strokeMatchFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the current image index
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;

  // get the strokes and corresponding results
  var inputStrokes = CanvasData.strokes;
  var modelStrokes = modelsData[theIndex].strokes;
  var results = Results.strokeMatchResults;
  var numResults = results.length;

  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var inputStroke = inputStrokes[cycle];
      var result = results[cycle];

      // paint the feedback stroke
      if (result >= 0) {
        paintStrokes(context, [ modelStrokes[result] ], Colors.blue, Opaqueness.light, 20);
      }
      var color = result >= 0 ? Colors.black : Colors.red;
      paintStrokes(context, [ inputStroke ], color, Opaqueness.full, 10);
      
    }

    // animate the next step
    requestAnimationFrame(animate);
  });

}

function strokeValidFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the strokes and corresponding results
  var inputStrokes = CanvasData.strokes;
  var results = Results.strokeValidResults;
  var numResults = results.length;
  
  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  //
  paintStrokes(context, inputStrokes, Colors.gray, Opaqueness.full, 10);

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var inputStroke = inputStrokes[cycle];
      var result = results[cycle];

      // paint the feedback stroke
      var color = result ? Colors.blue : Colors.red;
      paintStrokes(context, [inputStroke], color, Opaqueness.heavy, 10);
    }

    // animate the next step
    requestAnimationFrame(animate);
  });

}

function strokeExistFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the current image index
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;

  // get the strokes and corresponding results
  var modelStrokes = modelsData[theIndex].strokes;
  var results = Results.strokeExistResults;
  var numResults = results.length;
  
  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  //
  paintStrokes(context, modelStrokes, Colors.gray, Opaqueness.full, 10);

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var modelStroke = modelStrokes[cycle];
      var result = results[cycle];

      // paint the feedback stroke
      var color = result !== null ? Colors.blue : Colors.red;
      paintStrokes(context, [modelStroke], color, Opaqueness.full, 10);
    }

    // animate the next step
    requestAnimationFrame(animate);
  });

}

function strokeOrderFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the strokes and corresponding results
  var inputStrokes = CanvasData.strokes;
  var results = Results.strokeOrderResults;
  var numResults = results.length;
  
  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var inputStroke = inputStrokes[cycle];
      var result = results[cycle];

      // paint the feedback stroke
      var color;
      if (result === 0) { color = Colors.blue; }
      else if (result < 0) { color = Colors.purple; }
      else if (result > 0) { color = Colors.orange; }
      else if (result === null) { color = Colors.gray; }
      paintStrokes(context, [inputStroke], color, Opaqueness.heavy, 10);
    }

    // animate the next step
    requestAnimationFrame(animate);
  });

}

function strokeDirectionFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the strokes and corresponding results
  var inputStrokes = CanvasData.strokes;
  var results = Results.strokeDirectionResults;
  var numResults = results.length;

  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var inputStroke = inputStrokes[cycle];
      var result = results[cycle];

      // get the starting point
      var point = inputStroke.points[0];

      // paint the feedback stroke and starting point
      var color;
      if (result === true) { color = Colors.blue; }
      else if (result === false) { color = Colors.red; }
      else if (result === null) { color = Colors.gray; }

      paintStrokes(context, [inputStroke], color, Opaqueness.light, 10);

      context.fillStyle = "rgba(" + color + "," + Opaqueness.full + ")";
      context.fillRect(point.x - 10, point.y - 10, 20, 20);
    }

    // animate the next step
    requestAnimationFrame(animate);
  });

}

function strokeSpeedFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the current image index
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;

  // get the strokes and corresponding results
  var inputStrokes = [];
  var modelStrokes = [];
  var tempData = [CanvasData.strokes, modelsData[theIndex].strokes];
  for (var i = 0; i < tempData.length; ++i) {
    var tempStrokes = tempData[i];
    var strokes = [];
    // var offset = tempData[i][0].points[0].time;
    for (var j = 0; j < tempStrokes.length; ++j) {
      var tempPoints = tempStrokes[j].points;
      var points = [];
      var offset = tempPoints[0].time;
      for (var k = 0; k < tempPoints.length; ++k) {
        var tempPoint = tempPoints[k];
        var x = tempPoint.x;
        var y = tempPoint.y;
        var time = tempPoint.time - offset;
        var point = {x: x, y: y, time: time};
        points.push(point);
      }
      var stroke = {points: points};
      strokes.push(stroke);
    }
    if (i === 0) { inputStrokes = strokes; }
    else { modelStrokes = strokes; }
  }

  // get the results
  var matches = Results.strokeMatchResults;

  // get the match and points for the initial index index
  var index = 0;
  var match = matches[index];
  var inputPoints = inputStrokes[index].points;
  var modelPoints = (match >= 0) ? modelStrokes[match].points : null;

  // get the initial time limit, start time, and initial counters for the initial index 
  var inputTimeLimit = inputPoints[inputPoints.length - 1].time;
  var modelTimeLimit = (match >= 0) ? modelPoints[modelPoints.length - 1].time : 0;
  var timeLimit = Math.max(inputTimeLimit, modelTimeLimit);
  var start = performance.now();
  var inputCounter = 1;
  var modelCounter = 1;

  requestAnimationFrame(function animate(time){
    // get the elapsed duration
    var duration = Math.abs(time - start);
    
    // duration exceeds current time limit => initial variables for next stroke
    if (duration > timeLimit) {

      // increment to the next index
      ++index;

      // index exceeds number of input strokes => unlock interface,  reset to previous canvas, and quit animation
      if (index >= inputStrokes.length) {
        // unlock interface and restore original canvas state
        lockInterface(false);
        context.putImageData(Anim.originalState, 0, 0);
        return;
      }

      // get the next match and points
      match = matches[index];
      inputPoints = inputStrokes[index].points;
      modelPoints = (match >= 0) ? modelStrokes[match].points : null;

      // get the next time limits, start time, and initial counters
      inputTimeLimit = inputPoints[inputPoints.length - 1].time;
      modelTimeLimit = (match >= 0) ? modelPoints[modelPoints.length - 1].time : 0;
      timeLimit = Math.max(inputTimeLimit, modelTimeLimit);
      start = performance.now();
      inputCounter = 1;
      modelCounter = 1;

      // get the new duration
      duration = Math.abs(time - start);
    }

    // there are model points => draw the model points' path in real-time
    if (modelPoints !== null) {
      while (true) {
        // counter exceeds number of points => stop
        if (modelCounter >= modelPoints.length - 1) { break; }

        // get the current model point
        var modelPoint = modelPoints[modelCounter];
        
        // point's time is under duration time => draw the path
        if (modelPoint.time < duration) {
          // increment the counter
          ++modelCounter;

          // set the stroke properties and draw the path
          context.lineWidth = 10;
          context.strokeStyle = "rgba(" + Colors.blue + "," + Opaqueness.light + ")";
          context.beginPath();
          context.moveTo(modelPoints[modelCounter - 1].x, modelPoints[modelCounter - 1].y);
          context.lineTo(modelPoints[modelCounter].x, modelPoints[modelCounter].y);
          context.stroke();
        }

        // point's time is above duration time => skip the path
        else {
          break;
        }

      }
    }

    while (true) {
      // counter exceeds number of points => stop
      if (inputCounter >= inputPoints.length - 1) { break; }

      // get the current point
      var inputPoint = inputPoints[inputCounter];

      // point's time is under duration time => draw the path
      if (inputPoint.time < duration) {
        // increment the counter
        ++inputCounter;

        var color = match >= 0 ? Colors.black : Colors.gray;

        // set the stroke properties and draw the path
        context.lineWidth = 5;
        context.strokeStyle = "rgba(" + color + "," + Opaqueness.full + ")";
        context.beginPath();
        context.moveTo(inputPoints[inputCounter - 1].x, inputPoints[inputCounter - 1].y);
        context.lineTo(inputPoints[inputCounter].x, inputPoints[inputCounter].y);
        context.stroke();
      }

      // point's time is above duration time => skip the path
      else {
        break;
      }
    }

    requestAnimationFrame(animate);
  });

}

function strokeLengthFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the current image index
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;

  // get the strokes and corresponding results
  var inputStrokes = CanvasData.strokes;
  var modelStrokes = modelsData[theIndex].strokes;
  var results = Results.strokeLengthResults;
  var matches = Results.strokeMatchResults;
  var numResults = results.length;
  
  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var result = results[cycle];
      var inputStroke = inputStrokes[cycle];
      var modelStroke = (result !== null) ? modelStrokes[matches[cycle]] : null;

      // there is a result => paint the input and model stroke
      if (result !== null) {

        //
        var inputDistance = SketchRecTools.calculatePathLength( { strokes: [inputStroke] } );
        var modelDistance = SketchRecTools.calculatePathLength( { strokes: [modelStroke] } );
        var inputPoints = inputStroke.points;
        var modelPoints = modelStroke.points;

        //
        if (inputDistance > modelDistance) {
          //
          paintStrokes(context, [modelStroke], Colors.blue, Opaqueness.full, 5);
          
          //
          var distance = 0.0;
          var endpoint = -1;
          for (var i = 0; i < inputPoints.length - 1; ++i) {

            var p0 = inputPoints[i];
            var p1 = inputPoints[i + 1];
            distance += SketchRecTools.calculateDistance(p0.x, p0.y, p1.x, p1.y);

            if (distance >= modelDistance) {
              endpoint = i;
              break;
            }
          }

          for (var i = 0; i < endpoint; ++i) {
            var x0 = inputPoints[i].x;
            var y0 = inputPoints[i].y;
            var x1 = inputPoints[i + 1].x;
            var y1 = inputPoints[i + 1].y;
        
            drawLineSegment(context, x0, y0, x1, y1, Colors.black, Opaqueness.full, 5);
          }
          for (var i = endpoint; i < inputPoints.length - 1; ++i) {
            var x0 = inputPoints[i].x;
            var y0 = inputPoints[i].y;
            var x1 = inputPoints[i + 1].x;
            var y1 = inputPoints[i + 1].y;
        
            drawLineSegment(context, x0, y0, x1, y1, Colors.red, Opaqueness.full, 5);
          }

        }

        else {
          //
          paintStrokes(context, [inputStroke], Colors.black, Opaqueness.full, 5);

          //
          var distance = 0.0;
          var endpoint = -1;
          for (var i = 0; i < modelPoints.length - 1; ++i) {

            var p0 = modelPoints[i];
            var p1 = modelPoints[i + 1];
            distance += SketchRecTools.calculateDistance(p0.x, p0.y, p1.x, p1.y);

            if (distance >= inputDistance) {
              endpoint = i;
              break;
            }
          }

          for (var i = 0; i < endpoint; ++i) {
            var x0 = modelPoints[i].x;
            var y0 = modelPoints[i].y;
            var x1 = modelPoints[i + 1].x;
            var y1 = modelPoints[i + 1].y;
        
            drawLineSegment(context, x0, y0, x1, y1, Colors.blue, Opaqueness.full, 5);
          }
          for (var i = endpoint; i < modelPoints.length - 1; ++i) {
            var x0 = modelPoints[i].x;
            var y0 = modelPoints[i].y;
            var x1 = modelPoints[i + 1].x;
            var y1 = modelPoints[i + 1].y;
        
            drawLineSegment(context, x0, y0, x1, y1, Colors.green, Opaqueness.full, 5);
          }

        }
      }

      // there is no result => pain the input stroke only
      else {
        paintStrokes(context, [inputStroke], Colors.gray, Opaqueness.half, 5);
      }
      
    }

    // animate the next step
    requestAnimationFrame(animate);
  });

}

function strokeClosenessFeedbackButton(canvas, context) {
  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the current image index
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;

  //
  var inputStrokes = CanvasData.strokes;
  var modelStrokes = modelsData[theIndex].strokes;
  inputStrokes = SketchRecTools.resampleStrokesByCount(inputStrokes, 50);
  modelStrokes = SketchRecTools.resampleStrokesByCount(modelStrokes, 50);

  // 
  var results = Results.strokeClosenessResults;
  var matches = Results.strokeMatchResults;
  var numResults = results.length;
  
  // get the starting temporal values
  var start = performance.now();
  var cycleTime = 1500;
  var timeLimit = cycleTime * numResults;
  var cycle = -1;

  // define the animation
  requestAnimationFrame(function animate(time){

    // get the total duration; quit if duration exceeds time limit
    var duration = Math.abs(time - start);
    if (duration > timeLimit) {
      // unlock interface and restore original canvas state
      lockInterface(false);
      context.putImageData(Anim.originalState, 0, 0);

      return;
    }

    // get the current cycle
    var currentCycle = Math.floor(duration / cycleTime);

    // duration shifts to next cycle => display next feedback stroke
    if (cycle < currentCycle) {

      // get the current cycle and corresponding stroke and result
      cycle = currentCycle;
      var result = results[cycle];
      var inputStroke = inputStrokes[cycle];
      var modelStroke = (result !== null) ? modelStrokes[matches[cycle]] : null;

      // there is a result => paint the input and model stroke
      if (result !== null) {

        //
        var inputPoints = inputStroke.points;
        var modelPoints = modelStroke.points;
        var size = Math.min(inputPoints.length, modelPoints.length);

        //
        paintStrokes(context, [modelStroke], Colors.blue, Opaqueness.full, 5);

        // iterate through the input points
        for (var i = 0; i < size - 1; ++i) {
          var ip = inputPoints[i];
        
          // iterate through the model points
          var minError = Number.MAX_SAFE_INTEGER;
          for (var j = 0; j < size; ++j) {
            // get the current model point
            var mp = modelPoints[j];
        
            // calculate the error between the input and model point
            var error = SketchRecTools.calculateDistance(ip.x, ip.y, mp.x, mp.y);
        
            // check for min case
            if (error < minError) { minError = error; }
          }
        
          //
          var color = Colors.red;
          if (minError < 15) { color = Colors.black; }

          var x0 = inputPoints[i].x;
          var y0 = inputPoints[i].y;
          var x1 = inputPoints[i + 1].x;
          var y1 = inputPoints[i + 1].y;
          drawLineSegment(context, x0, y0, x1, y1, color, Opaqueness.full, 5);
          
        }

      }

      // there is no result => pain the input stroke only
      else {
        paintStrokes(context, [inputStroke], Colors.gray, Opaqueness.full, 5);
      }

    }

    // animate the next step
    requestAnimationFrame(animate);
  });
}

function symbolSpeedFeedbackButton(canvas, context) {

  // lock interface so that buttons are disabled
  lockInterface(true);

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  context.putImageData(canvasState, 0, 0);

  // get the current image index
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;

  // get the strokes and corresponding results
  var inputStrokes = [];
  var modelStrokes = [];
  var tempData = [CanvasData.strokes, modelsData[theIndex].strokes];
  for (var i = 0; i < tempData.length; ++i) {
    var offset = tempData[i][0].points[0].time;
    var tempStrokes = tempData[i];
    var strokes = [];
    for (var j = 0; j < tempStrokes.length; ++j) {
      var tempPoints = tempStrokes[j].points;
      var points = [];
      for (var k = 0; k < tempPoints.length; ++k) {
        var tempPoint = tempPoints[k];
        var x = tempPoint.x;
        var y = tempPoint.y;
        var time = tempPoint.time - offset;
        var point = {x: x, y: y, time: time};
        points.push(point);
      }
      var stroke = {points: points};
      strokes.push(stroke);
    }
    if (i === 0) { inputStrokes = strokes; }
    else { modelStrokes = strokes; }
  }

  //
  var inputIndex = 0;
  var modelIndex = 0;

  

  //
  var inputPoints = inputStrokes[inputIndex].points;
  var modelPoints = modelStrokes[modelIndex].points;

  //
  var start = performance.now();
  var inputCounter = 1;
  var modelCounter = 1;

  //
  var inputFlag = true;
  var modelFlag = true;
  
  requestAnimationFrame(function animate(time){
    // get the elapsed duration
    var duration = Math.abs(time - start);

    // input counter exceeds number of input points => move to next input stroke
    if (inputCounter >= inputPoints.length) {
      
      // increment to next input index
      ++inputIndex;

      // index exceeds number of input strokes
      if (inputIndex >= inputStrokes.length) {

        if (modelIndex >= modelStrokes.length) {
          // unlock interface and restore original canvas state
          lockInterface(false);
          context.putImageData(Anim.originalState, 0, 0);
          return;
        }

        else {
          inputFlag = false;
        }
      }
      
      else {
        // get the next set of input points, and reset input counter
        inputPoints = inputStrokes[inputIndex].points;
        inputCounter = 1;
      }

    }

    //
    if (modelCounter >= modelPoints.length) {
      
      //
      ++modelIndex;

      // index exceeds number of input strokes
      if (modelIndex >= modelStrokes.length) {

        if (inputIndex >= inputStrokes.length) {
          // unlock interface and restore original canvas state
          lockInterface(false);
          context.putImageData(Anim.originalState, 0, 0);
          return;
        }

        else {
          modelFlag = false;
        }
      }
      
      else {
        // get the next set of input points, and reset input counter
        modelPoints = modelStrokes[modelIndex].points;
        modelCounter = 1;
      }

    }

    if (inputFlag) {
      // get the input point and its time
      var inputPoint = inputPoints[inputCounter];
      var inputTime = inputPoint.time;

      // input time under duration => draw
      if (inputTime < duration) {

        // set the stroke properties and draw the path
        context.lineWidth = 5;
        context.strokeStyle = "rgba(" + Colors.black + "," + Opaqueness.full + ")";
        context.beginPath();
        context.moveTo(inputPoints[inputCounter - 1].x, inputPoints[inputCounter - 1].y);
        context.lineTo(inputPoints[inputCounter].x, inputPoints[inputCounter].y);
        context.stroke();

        
        // increment to next input counter
        ++inputCounter;
      }
    
    }

    if (modelFlag) {
      //
      var modelPoint = modelPoints[modelCounter];
      var modelTime = modelPoint.time;

      //
      if (modelTime < duration) {

        // set the stroke properties and draw the path
        context.lineWidth = 10;
        context.strokeStyle = "rgba(" + Colors.blue + "," + Opaqueness.light + ")";
        context.beginPath();
        context.moveTo(modelPoints[modelCounter - 1].x, modelPoints[modelCounter - 1].y);
        context.lineTo(modelPoints[modelCounter].x, modelPoints[modelCounter].y);
        context.stroke();

        //
        ++modelCounter;
      }
    
    }

    // animate again
    requestAnimationFrame(animate);
  });

}

// #endregion

// #region Assessing Event Handlers

function assessButton() {

  // save the original state and revert to empty canvas
  Anim.originalState = context.getImageData(0, 0, canvas.width, canvas.height);
  var canvasState = canvasStates[0];
  if (canvasState !== undefined) {
    context.putImageData(canvasState, 0, 0);
  }

  // enable feedback button
  var feedbackButton = document.getElementById("feedbackButton");
  feedbackButton.disabled = false;

  // get the input and model sketch's strokes
  var originalInputStrokes = CanvasData.strokes;
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;
  var originalModelStrokes = modelsData[theIndex].strokes;

  // no drawn strokes ==> quit function
  if (originalInputStrokes.length === 0) { return; }

  // display the current input and model stroke
  paintStrokes(context, originalModelStrokes, Colors.blue, Opaqueness.light, 10);
  paintStrokes(context, originalInputStrokes, Colors.black, Opaqueness.full, 5);

  // evenly resample strokes of original and input
  // FUTURE WORK: why 50?
  var inputStrokes = SketchRecTools.resampleStrokesByCount(originalInputStrokes, 50);
  var modelStrokes = SketchRecTools.resampleStrokesByCount(originalModelStrokes, 50);

  // stroke match
  var matches = SketchAssessor.strokeMatch(inputStrokes, modelStrokes);

  // stroke valid
  var strokeValidResults = SketchAssessor.strokeValid(matches);

  // stroke exist
  var strokeExistResults = SketchAssessor.strokeExist(matches, modelStrokes);

  // stroke order
  var strokeOrderResults = SketchAssessor.strokeOrder(matches);

  // stroke direction
  var strokeDirectionResults = SketchAssessor.strokeDirection(matches, inputStrokes, modelStrokes);

  // stroke edits (i.e., undo and clear counts)
  var strokeEditResults = SketchAssessor.strokeEdit(CanvasData.undos, CanvasData.clears);

  // stroke speed
  var strokeSpeedResults = SketchAssessor.strokeSpeed(matches, originalInputStrokes, originalModelStrokes);

  // stroke length
  var strokeLengthResults = SketchAssessor.strokeLength(matches, originalInputStrokes, originalModelStrokes, canvas.width);

  // stroke closeness 
  var strokeClosenessResults = SketchAssessor.strokeCloseness(matches, inputStrokes, modelStrokes);

  // symbol speed
  var symbolSpeedResults = SketchAssessor.symbolSpeed(matches, originalInputStrokes, originalModelStrokes);

  // calculate the stars
  var stars = calculateStars(inputStrokes, modelStrokes, matches, strokeValidResults, strokeExistResults, strokeOrderResults, strokeDirectionResults, strokeEditResults, strokeSpeedResults, strokeLengthResults, strokeClosenessResults, symbolSpeedResults);

  //
  Results.stars = stars;
  Results.strokeMatchResults = matches;
  Results.strokeValidResults = strokeValidResults;
  Results.strokeExistResults = strokeExistResults;
  Results.strokeOrderResults = strokeOrderResults;
  Results.strokeDirectionResults = strokeDirectionResults;
  Results.strokeEditResults = strokeEditResults;
  Results.strokeSpeedResults = strokeSpeedResults;
  Results.strokeLengthResults = strokeLengthResults;
  Results.strokeClosenessResults = strokeClosenessResults;
  Results.symbolSpeedResults = symbolSpeedResults;

  var feedbackButton = document.getElementById("feedbackButton");
  if (feedbackButton.value === "Details") {
    outputSummary(Results);
  }
  else if (feedbackButton.value === "Summary") {
    outputDetailed(Results);
  }

  // quiz mode
  if (interactionMode === InteractionEnum.quiz) {

    // disable assess, undo, and clear button
    document.getElementById("assessButton").disabled = true;
    document.getElementById("clearButton").disabled = true;
    document.getElementById("undoButton").disabled = true;

    // disable canvas
    removeCanvasListeners(canvas);

    // disable the next button if there are no more next images
    if (imageIndex < imagesData.length) {
      document.getElementById("nextButton").disabled = false;
    }

    // create and add assessment to list
    var symbol = modelsData[theIndex].shapes[0].interpretation;
    var assessment = createAssessment(chapter, symbol, stars);
    Quiz.assessments.push(assessment);

  }

}

//
function createAssessment(chapter, symbol, stars) {
  
  var assessment = {};

  assessment.chapter = chapter;
  assessment.symbol = symbol;
  assessment.stars = JSON.parse(JSON.stringify(stars));

  return assessment;
}

// relocate
function paintStrokes(context, strokes, color, opaqueness, size) {

  for (var i = 0; i < strokes.length; ++i) {
    var points = strokes[i].points;

    for (var j = 0; j < points.length - 1; ++j) {
      var x0 = points[j].x;
      var y0 = points[j].y;
      var x1 = points[j+1].x;
      var y1 = points[j+1].y;
  
      drawLineSegment(context, x0, y0, x1, y1, color, opaqueness, size);
    }
  }
}

function feedbackButton() {
  // get feedback button
  var feedbackButton = document.getElementById("feedbackButton");

  var value = feedbackButton.value;
  if (value === "Details") { feedbackButton.value = "Summary"; }
  else if (value === "Summary") { feedbackButton.value = "Details"; }

  if (feedbackButton.value === "Details") {
    outputSummary(Results);
  }
  else if (feedbackButton.value === "Summary") {
    outputDetailed(Results);
  }
}

function outputSummary(theResults) {
  
  //
  var stars = theResults.stars;

  //
  var structureTable  = "<table class='structuretable symboltable'>";
  var techniqueTable  = "<table class='techniquetable symboltable'>";
  var precisionTable = "<table class='precisiontable symboltable'>";
  var table_ = "</table>";
  var tr     = "<tr>";
  var tr_    = "</tr>";
  var th     = "<th>";
  var th_    = "</th>"; 
  var td     = "<td>";
  var td_    = "</td>";
  var br     = "<br>";

  var output = "";
  
  // structure category table
  output += "<span class='largetext'>" + "<strong>Structure</strong>" + "</span>";
  output += structureTable;

  output += tr;
  output += th + "" + th_;
  output += th + "Rating" + th_;
  output += th + "Metric" + th_;
  output += tr_;

  output += tr;
  output += td + "<input type='submit' id='strokeMatchFeedbackButton' value='▶' onclick='strokeMatchFeedbackButton(canvas, context);'>" + td_;
  output += td + getTextStars(stars["strokeMatch"], 3) + td_;
  output += td + "Stroke Match" + td_;
  output += tr_;

  output += tr;
  output += td + "<input type='submit' id='strokeValidFeedbackButton' value='▶' onclick='strokeValidFeedbackButton(canvas, context);'>" + td_;
  output += td + getTextStars(stars["strokeValid"], 3) + td_;
  output += td + "Stroke Valid" + td_;
  output += tr_;

  output += tr;
  output += td + "<input type='submit' id='strokeExistFeedbackButton' value='▶' onclick='strokeExistFeedbackButton(canvas, context);'>" + td_;
  output += td + getTextStars(stars["strokeExist"], 3) + td_;
  output += td + "Stroke Exist" + td_;
  output += tr_;

  output += table_;
  output += br;

  // form category table
  output += "<span class='largetext'>" + "<strong>Technique</strong>" + "</span>";
  output += techniqueTable;

  output += tr;
  output += th + "" + th_;
  output += th + "Rating" + th_;
  output += th + "Metric" + th_;
  output += tr_;

  output += "<tr>";
  output += "<td>" + "<input type='submit' id='strokeOrderFeedbackButton' value='▶' onclick='strokeOrderFeedbackButton(canvas, context);'>" + "</th>";
  output += "<td>" + getTextStars(stars["strokeOrder"], 3) + "</th>";
  output += "<td>" + "Stroke Order" + "</th>";
  output += "</tr>";

  output += "<tr>";
  output += "<td>" + "<input type='submit' id='strokeDirectionFeedbackButton' value='▶' onclick='strokeDirectionFeedbackButton(canvas, context);'>" + "</th>";
  output += "<td>" + getTextStars(stars["strokeDirection"], 3) + "</th>";
  output += "<td>" + "Stroke Direction" + "</th>";
  output += "</tr>";

  output += table_;
  output += br;

  // precision category table
  output += "<span class='largetext'>" + "<strong>Precision</strong>" + "</span>";
  output += precisionTable;

  output += tr;
  output += th + "" + th_;
  output += th + "Rating" + th_;
  output += th + "Metric" + th_;
  output += tr_;

  output += "<tr>";
  output += "<td>" + "" + "</th>";
  output += "<td>" + getTextStars(stars["strokeEdit"], 3) + "</th>";
  output += "<td>" + "Stroke Edit" + "</th>";
  output += "</tr>";

  output += "<tr>";
  output += "<td>" + "<input type='submit' id='strokeSpeedFeedbackButton' value='▶' onclick='strokeSpeedFeedbackButton(canvas, context);'>" + "</th>";
  output += "<td>" + getTextStars(stars["strokeSpeed"], 3) + "</th>";
  output += "<td>" + "Stroke Speed" + "</th>";
  output += "</tr>";

  output += "<tr>";
  output += "<td>" + "<input type='submit' id='strokeLengthFeedbackButton' value='▶' onclick='strokeLengthFeedbackButton(canvas, context);'>" + "</th>";
  output += "<td>" + getTextStars(stars["strokeLength"], 3) + "</th>";
  output += "<td>" + "Stroke Length" + "</th>";
  output += "</tr>";

  output += "<tr>";
  output += "<td>" + "<input type='submit' id='strokeClosenessFeedbackButton' value='▶' onclick='strokeClosenessFeedbackButton(canvas, context);'" + "</th>";
  output += "<td>" + getTextStars(stars["strokeCloseness"], 3) + "</th>";
  output += "<td>" + "Stroke Closeness" + "</th>";
  output += "</tr>";

  output += "<tr>";
  output += "<td>" + "<input type='submit' id='symbolSpeedFeedbackButton' value='▶' onclick='symbolSpeedFeedbackButton(canvas, context);'>" + "</th>";
  output += "<td>" + getTextStars(stars["symbolSpeed"], 3) + "</th>";
  output += "<td>" + "Symbol Speed" + "</th>";
  output += "</tr>";

  output += table_;

  // display the output text
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = output;
}

function outputDetailed(theResults) {
  
  //
  var stars = theResults.stars;
  var matches = theResults.strokeMatchResults;
  
  // #region Output Variables
  // output flags
  var showMatches           = true;
  var showStrokeValid       = true;
  var showStrokeExist       = true;
  var showStrokeOrder       = true;
  var showStrokeDirection   = true;
  var showStrokeEdit        = true;
  var showStrokeSpeed       = true;
  var showStrokeLength      = true;
  var showStrokeCloseness   = true;
  var showSymbolSpeed       = true;

  // output text
  var outputText = "";
  // #endregion

  // #region Stroke Match Feedback
  outputText += "<hr>";
  
  if (showMatches) {
    var count = stars["strokeMatch"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<span><strong>STROKE MATCH FEEDBACK</strong></span>";
    
    outputText += "<ul>";
    for (var i = 0; i < theResults.strokeMatchResults.length; ++i) {
      
      var match = matches[i];
      var result = match >= 0;

      if (result) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> matches to Model Stroke " + match + "</li>";
      }
      else {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> no matches</li>";
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Valid Feedback
  if (showStrokeValid) {
    var count = stars["strokeValid"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE VALID FEEDBACK</strong>";
    outputText += "<ul>";
    for (var i = 0; i < theResults.strokeValidResults.length; ++i) {
      var result = theResults.strokeValidResults[i];
      if (result) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> valid</li>";
      }
      else {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> invalid</li>";
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Exist Feedback
  if (showStrokeExist) {
    var count = stars["strokeExist"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE EXIST FEEDBACK</strong>";
    outputText += "<ul>"
    for (var i = 0; i < theResults.strokeExistResults.length; ++i) {
      var result = theResults.strokeExistResults[i];

      if (result !== null) {
        outputText += "<li><strong>Model Stroke " + i + ":</strong> matches to Input Stroke " + result + "</li>";
      }
      else {
        outputText += "<li><strong>Model Stroke " + i + ":</strong> does not exist</li>";
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Order Feedback
  if (showStrokeOrder) {
    var count = stars["strokeOrder"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE ORDER FEEDBACK</strong>";
    outputText += "<ul>"
    for (var i = 0; i < theResults.strokeOrderResults.length; ++i) {
      var result = theResults.strokeOrderResults[i];
      if (result === null) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> N/A</li>";
      }
      else if (result === 0) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> correct</li>";
      }
      else if (result > 0) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> early by " + result + " stroke(s)</li>";
      }
      else if (result < 0) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> late by " + Math.abs(result) + " stroke(s)</li>";
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Direction Feedback
  if (showStrokeDirection) {
    var count = stars["strokeDirection"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE DIRECTION FEEDBACK</strong>";
    outputText += "<ul>";
    for (var i = 0; i < theResults.strokeDirectionResults.length; ++i) {
      var result = theResults.strokeDirectionResults[i];
      if (result === null) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> N/A</li>";
      }
      else if (result) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> correct direction</li>";
      }
      else if (!result) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> incorrect direction</li>";
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Edit Feedback
  if (showStrokeEdit) {
    var count = stars["strokeEdit"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE EDIT FEEDBACK</strong>";
    outputText += "<ul>";
    var result = theResults.strokeEditResults;
    outputText += "<li><strong># of undos:</strong> " + result.undos + "</li>";
    outputText += "<li><strong># of clears:</strong> " + result.clears + "</li>";
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Speed Feedback
  if (showStrokeSpeed) {
    var count = stars["strokeSpeed"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE SPEED FEEDBACK</strong>";
    outputText += "<ul>";
    for (var i = 0; i < theResults.strokeSpeedResults.length; ++i) {
      var result = theResults.strokeSpeedResults[i];
      if (result === null) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> N/A</li>";
      }
      else {
        var display = result.toFixed(2);

        if (display < 1.0) {
          display = (1 / display).toFixed(2);
          outputText += "<li><strong>Input Stroke:</strong> " + Math.abs(display) + " times slower</li>";
        }
        else {
          outputText += "<li><strong>Input stroke:</strong> " + Math.abs(display) + " times faster</li>";
        }
    
      }

    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Length Feedback
  if (showStrokeLength) {
    var count = stars["strokeLength"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE LENGTH FEEDBACK</strong>";
    outputText += "<ul>";
    for (var i = 0; i < theResults.strokeLengthResults.length; ++i) {
      var result = theResults.strokeLengthResults[i];
      if (result === null) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> N/A</li>";
      }
      else {
        var display = result.toFixed(2);

        outputText += "<li><strong>Input Stroke " + i + ":</strong> " + Math.abs(display) + "</li>";
        
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Stroke Closeness Feedback
  if (showStrokeCloseness) {
    var count = stars["strokeCloseness"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>STROKE CLOSENESS FEEDBACK</strong>";
    outputText += "<ul>";
    for (var i = 0; i < theResults.strokeClosenessResults.length; ++i) {
      var result = theResults.strokeClosenessResults[i];
      if (result === null) {
        outputText += "<li><strong>Input Stroke " + i + ":</strong> N/A</li>";
      }
      else {
        var display = result.toFixed(2);

        outputText += "<li><strong>Input Stroke " + i + ":</strong> " + result.toFixed(2) + "</li>";
      }
    }
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // #region Symbol Speed Feedback
  if (showSymbolSpeed) {
    var count = stars["symbolSpeed"];
    outputText += "<span style='font-size: 40px'>" + getTextStars(count, 3) + "</span><br>";
    outputText += "<strong>SYMBOL SPEED FEEDBACK</strong>";
    outputText += "<ul>";

    var result = theResults.symbolSpeedResults;
    var display = result.toFixed(2);

    if (display >= 1.0) {
      outputText += "<li><strong>Input Symbol:</strong> " + display + " times faster</li>";
    }
    else {
      display = (1 / display).toFixed(2);
      outputText += "<li><strong>Input Symbol:</strong> " + display + " times slower</li>";
    }
    
    outputText += "</ul>";
    outputText += "<hr>";
  }
  // #endregion

  // display the output text
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = outputText;
}

function calculateStars(inputStrokes, modelStrokes, matches, strokeValidResults, strokeExistResults, strokeOrderResults, strokeDirectionResults, strokeEditResults, strokeSpeedResults, strokeLengthResults, strokeClosenessResults, symbolSpeedResults) {
  var stars = {};
  
  // #region Stroke Match Stars
  let strokeMatchStars = 0; {
    // get the number of valid matches and model strokes
    var numMatches = 0;
    for (var i = 0; i < matches.length; ++i) { if (matches[i] >= 0) { ++numMatches; } }
    var numModelStrokes = modelStrokes.length;

    //
    if (numMatches === 0) {
      strokeMatchStars = 0;
    }
    else if (numMatches === numModelStrokes) {
      strokeMatchStars = 3;
    }
    else if (0 < numMatches && numMatches < numModelStrokes / 2.0) {
      strokeMatchStars = 1;
    }
    else if (numModelStrokes / 2.0 <= numMatches && numMatches < numModelStrokes) {
      strokeMatchStars = 2;
    }
  }
  stars["strokeMatch"] = strokeMatchStars;
  // #endregion

  // #region Stroke Valid Stars
  let strokeValidStars = 0; {
    // get the number of valid and all results
    var numResults = strokeValidResults.length;
    var numValid = 0;
    for (var i = 0; i < numResults; ++i) {
      var result = strokeValidResults[i];
      if (result) { ++numValid; }
    }
    
    // calculate the stroke valid stars
    var ratio = numValid / numResults;
    if (ratio === 0.0) {
      strokeValidStars = 0;
    }
    else if (ratio === 1.0) {
      strokeValidStars = 3;
    }
    else if (0 < ratio && ratio < 0.5) {
      strokeValidStars = 1;
    }
    else if (0.5 <= ratio && ratio < 1.0) {
      strokeValidStars = 2;
    }
  }
  stars["strokeValid"] = strokeValidStars;
  // #endregion

  // #region Stroke Exist Stars
  let strokeExistStars = 0; {
    var numResults = strokeExistResults.length;
    var exists = 0;
    for (var i = 0; i < numResults; ++i) { 
      var result = strokeExistResults[i];
      if (result !== null) { ++exists; }
    }

    var ratio = exists / numResults;
    if (ratio === 1) {
      strokeExistStars = 3;
    }
    else if (ratio === 0) {
      strokeExistStars = 0;
    }
    else if (0 < ratio && ratio < 0.5) {
      strokeExistStars = 1;
    }
    else if (0.5 <= ratio && ratio < 1.0) {
      strokeExistStars = 2;
    }
  }
  stars["strokeExist"] = strokeExistStars;
  // #endregion

  // #region Stroke Order Stars
  let strokeOrderStars = 0; {
    var corrects = 0;
    var diff = 0;
    var numResults = strokeOrderResults.length;
    for (var i = 0; i < numResults; ++i) {
      var result = strokeOrderResults[i];
      if (result === 0) { ++corrects; }
      else {
        if (Math.abs(result) > diff); { diff = Math.abs(result) ;}
      }
    }

    if (corrects === numResults) {
      strokeOrderStars = 3;
    }
    else if (corrects === 0) {
      strokeOrderStars = 0;
    }
    else if ( diff <= 1 ) {
      strokeOrderStars = 2;
    }
    else if (diff > 1) {
      strokeOrderStars = 1;
    }
  }
  stars["strokeOrder"] = strokeOrderStars;
  // #endregion

  // #region Stroke Direction Stars
  let strokeDirectionStars = 0; {
    var correct = 0;
    var total = 0;
    for (var i = 0; i < strokeDirectionResults.length; ++i) {
      var result = strokeDirectionResults[i];
      if (result != null) {
        if (result) { ++correct; }
        ++total;
      }
    }
    var ratio = correct / total;

    if (ratio === 1) {
      strokeDirectionStars = 3;
    }
    else if (ratio === 0) {
      strokeDirectionStars = 0;
    }
    else if (0 < ratio && ratio < 0.5) {
      strokeDirectionStars = 1;
    }
    else if (0.5 <= ratio && ratio < 1.0) {
      strokeDirectionStars = 2;
    }
  }
  stars["strokeDirection"] = strokeDirectionStars;
  // #endregion

  // #region Stroke Edits Stars
  let strokeEditStars = 0; {
    var undos = strokeEditResults.undos;
    var clears = strokeEditResults.clears;

    if (undos === 0 && clears === 0) {
      strokeEditStars = 3;
    }
    else if (clears > 0) {
      strokeEditStars = 0;
    }
    else if (undos === 1) {
      strokeEditStars = 2;
    }
    else if (undos === 2) {
      strokeEditStars = 1;
    }
    else if (undos > 2) {
      strokeEditStars = 0;
    }
  }
  stars["strokeEdit"] = strokeEditStars;
  // #endregion

  // #region Stroke Speed Stars
  let strokeSpeedStars = 0; { 
    var tier0 = 0;
    var tier1 = 0;
    var tier2 = 0;
    var tier3 = 0;
    var numResults = strokeSpeedResults.length;
    for (var i = 0; i < numResults; ++i) {
      var result = strokeSpeedResults[i];
      if (0.75 <= result) { ++tier3; }
      else if (0.50 <= result && result < 0.75) { ++tier2; }
      else if (0.25 <= result && result < 0.50) { ++tier1; }
      else if (result < 0.0) { ++tier0; }
    }

    if (tier3 === numResults) {
      strokeSpeedStars = 3;
    }
    else if (tier0 === 0 && tier1 === 0) { // implies tier2 > 0
      strokeSpeedStars = 2;
    }
    else if (tier0 === 0) { // implies tier1 > 0
      strokeSpeedStars = 1;
    }
    else { // implies tier0 > 0
      strokeSpeedStars = 0;
    }
   
  }
  stars["strokeSpeed"] = strokeSpeedStars;
  // #endregion

  // #region Stroke Length Stars
  let strokeLengthStars = 0; {
    var tier0 = 0;
    var tier1 = 0;
    var tier2 = 0;
    var tier3 = 0;

    //
    var numResults = strokeLengthResults.length; 
    for (var i = 0; i < numResults; ++i) {
      var result = Math.abs(strokeLengthResults[i]);

      if (0.00 <= result && result <= 0.07) { ++tier3; }
      else if (0.07 < result && result <= 0.10) { ++tier2; }
      else if (0.10 < result && result <= 0.13) { ++tier1; }
      else if (0.13 < result) { ++tier0; }
    }

    if (tier3 === numResults) { strokeLengthStars = 3; }
    else if (tier0 === 0 && tier1 === 0) { strokeLengthStars = 2; }
    else if (tier0 === 0) { strokeLengthStars = 1; }
    else { strokeLengthStars = 0; }
  }
  stars["strokeLength"] = strokeLengthStars;
  // #endregion

  // #region Stroke Closeness Stars
  let strokeClosenessStars = 0; {
    var close = 0;
    
    var numResults = 0;
    for (var i = 0; i < strokeClosenessResults.length; ++i) {
      // get the current result
      var result = strokeClosenessResults[i];

      // skip null results
      if (result === null) { continue; }

      // increment the number of valid results 
      ++numResults;

      // result is close => increment number of close
      if (result >= 0.90) { ++close; }
    }

    // calculate the ratio
    var ratio = close / numResults;

    if (ratio === 1.0) { strokeClosenessStars = 3; }
    else if (ratio >= 0.5) { strokeClosenessStars = 2; }
    else if (ratio > 0.0) { strokeClosenessStars = 1; }
    else { strokeClosenessStars = 0; }
  }
  stars["strokeCloseness"] = strokeClosenessStars;
  // #endregion
  
  // #region Symbol Speed Stars
  let symbolSpeedStars = 0; {
    var result = symbolSpeedResults;

    if (0.75 <= result) { symbolSpeedStars = 3; }
    else if (0.50 <= result && result < 0.75) { symbolSpeedStars = 2; }
    else if (0.25 <= result && result < 0.50) { symbolSpeedStars = 1; }
    else { symbolSpeedStars = 0; }
  }
  stars["symbolSpeed"] = symbolSpeedStars;
  // #endregion

  return stars;
}

function getTextStars(count, max) {
  //
  count = Math.round(count);

  //
  var text = "";
  for (var i = 0; i < count; ++i) { text += "★"; }
  for (var i = 0; i < max - count; ++i) { text += "☆" }
  return text;
}
// #endregion

// #region Transition Event Handlers

function backButton(canvas, context) {
  // clear canvas
  clearAction(canvas, context);

  // reset the undos and clears count
  CanvasData.clears = 0;
  CanvasData.undos = 0;

  // disable the feedback button
  var feedbackButton = document.getElementById("feedbackButton");
  feedbackButton.disabled = true;

  // clear feedback
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = "";
  
  // increment the next image index
  --imageIndex;

  // load the back canvas image
  loadCanvasImage(canvas, context, imagesData[imageIndex].path, true);

  // enable the next button
  document.getElementById("nextButton").disabled = false;

  // disable the back button if there are no more back images
  if (imageIndex <= 0) {
    document.getElementById("backButton").disabled = true;
  }
}

function nextButton(canvas, context) {

  // enable canvas
  addCanvasListeners(canvas);

  // enable assess, undo, and clear button
  document.getElementById("assessButton").disabled = false;
  document.getElementById("clearButton").disabled = false;
  document.getElementById("undoButton").disabled = false;

  // #region Quiz Interaction Mode
  if (interactionMode === InteractionEnum.quiz) {

    // disable next button
    document.getElementById("nextButton").disabled = true;

    // reached the last image => display final results
    if (imageIndex >= imagesData.length - 1) {

      // hide the workbook area and display the scores area
      var workbookArea = document.getElementById("workbookarea");
      workbookArea.style.display = "none";
      var scoresArea = document.getElementById("scoresarea");
      scoresArea.style.display = "inline";

      // sort in ascending order and output assessments
      var assessments = Quiz.assessments;
      assessments.sort(function(a, b) {
        if (a.symbol < b.symbol) { return -1; }
        if (a.symbol > b.symbol) { return  1; }
        return 0;  
      });
      outputAssessments(assessments);

      return;
    }
  }
  // #endregion

  // #region General Interaction Mode
  // clear canvas
  clearAction(canvas, context);

  // reset the undos and clears count
  CanvasData.clears = 0;
  CanvasData.undos = 0;

  // disable the feedback button
  var feedbackButton = document.getElementById("feedbackButton");
  feedbackButton.disabled = true;

  // clear feedback
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = "";
  
  // increment the next image index
  ++imageIndex;

  // load the next canvas image
  var theIndex = interactionMode === InteractionEnum.quiz ? Quiz.imageIndices[imageIndex] : imageIndex;
  loadCanvasImage(canvas, context, imagesData[theIndex].path, true);

  // enable the back button
  document.getElementById("backButton").disabled = false;

  // disable the next button if there are no more next images
  if (imageIndex >= imagesData.length - 1) {
    document.getElementById("nextButton").disabled = true;
  }
  // #endregion
}

function displayScore(scoreDisplay) {
  //
  document.getElementById("assessmentoverallscorearea").style.display = "none";
  document.getElementById("assessmentindividualscoresarea").style.display = "none";
  document.getElementById("assessmentmetricscoresarea").style.display = "none";
  document.getElementById("assessmentdetailedscoresarea").style.display = "none";

  //
  if (scoreDisplay === "chapter") { document.getElementById("assessmentoverallscorearea").style.display = "inline"; }
  else if (scoreDisplay === "individual") { document.getElementById("assessmentindividualscoresarea").style.display = "inline"; }
  else if (scoreDisplay === "metric") { document.getElementById("assessmentmetricscoresarea").style.display = "inline"; }
  else if (scoreDisplay === "detailed") { document.getElementById("assessmentdetailedscoresarea").style.display = "inline"; } 
}

function outputAssessments(assessments) {

  // reset scores 
  setScoresState(false);

  // output the assessment title
  outputAssessmentTitle(assessments);

  // output the assessment overall score
  outputAssessmentOverallScore(assessments);

  // output the assessment individual scores
  outputAssessmentIndividualScores(assessments);

  // output the assessment metric scores
  outputAssessmentMetricScores(assessments);

  // output the assessment detailed scores
  outputAssessmentDetailedScores(assessments);

  // update scores
  setScoresState(true);
}

function setScoresState(flag) {
  // case: flag is false => reset scores and quit
  if (!flag) {
    // reset score state values
    for (var key in ScoresState) {
      if (ScoresState.hasOwnProperty(key)) {
        ScoresState[key] = null;
      }
    }

    return;
  }

  // debug
  console.log(ScoresState);

  // store scores in hidden form
  var output = JSON.stringify(ScoresState);
  var scoresStateInput = document.getElementById("scores_state_input");
  scoresStateInput.value = output;
}

function outputAssessmentTitle(assessments) {
  // get the current chapter
  // alt: gettin chapter from 'chapter' global variable
  var chapter = assessments[0].chapter;

  // initialize the output
  var output = "";

  output += "<span class='largetext'>";
  output += "<strong>" + "CHAPTER " + chapter + " ASSESSMENT" + "</strong>";
  output += "</span>";

  var assessmentTitleArea = document.getElementById("assessmenttitlearea");
  assessmentTitleArea.innerHTML = output;
}

function outputAssessmentOverallScore(assessments) {

  // #region Score Calculation Helper Variables

  // create metric to total stars mapping
  var metricTotalStars = {};
  for (var i = 0; i < metricNames.length; ++i) { 
    var metricName = metricNames[i];
    metricTotalStars[metricName] = 0;
  }

  // count the number of stars per metric
  for (var i = 0; i < assessments.length; ++i) {
    // get the current assessment and its stars
    var assessment = assessments[i];
    var stars = assessment.stars;

    // iterate through the metric names
    for (var j = 0; j < metricNames.length; ++j) {
      // get the current metric name
      var metricName = metricNames[j];

      // get the metric's star count
      var numStars = stars[metricName];

      // add the metric star count to mapping
      metricTotalStars[metricName] += numStars;
    }

  }

  // create metric to total stars mapping
  var metricAverageStars = {};
  for (var i = 0; i < metricNames.length; ++i) { 
    // get metric name
    var metricName = metricNames[i];

    // get metric total and average stars
    var totalStars = metricTotalStars[metricName];
    var averageStars = totalStars / assessments.length;

    // associate the average stars to metric
    metricAverageStars[metricName] = averageStars;
  }

  // #endregion

  // #region Overall Score Calculation

  // calculate the total metric average excluding strokeExist metric
  var totalAverageMetricStars = 0;
  for (var i = 0; i < metricNames.length; ++i) {
    // get the metric name
    var metricName = metricNames[i];

    // skip strokeExist
    if (metricName === "strokeExist") { continue; }

    // get the average metric star count and add to the count
    var starCount = metricAverageStars[metricName];
    totalAverageMetricStars += starCount;
  }

  // get the average average metric stars excluding strokeExist metric
  var averageAverageMetricStars = totalAverageMetricStars / (metricNames.length - 1);
  var strokeExistAverageStars = metricAverageStars["strokeExist"];

  // calculate the chapter score
  var firstRatio = strokeExistAverageStars / 3; // 0.0 <= firstRatio <= 1.0
  var secondRatio = (strokeExistAverageStars * firstRatio) / 3; // 0.0 <= secondRatio <= 1.0
  var chapterScore = secondRatio * 10;

  // #endregion

  // #region Structure Score Calculation

  var strokeMatchAverageStars = metricAverageStars["strokeMatch"];
  var strokeValidAverageStars = metricAverageStars["strokeValid"];
  var strokeExistAverageStars = metricAverageStars["strokeExist"];

  var structreScoreMean = (strokeValidAverageStars + strokeExistAverageStars) / 2;
  var structureScore = (strokeMatchAverageStars / 3) * structreScoreMean;

  // #endregion

  // #region Technique Score Calculation

  var strokeOrderAverageStars = metricAverageStars["strokeOrder"];
  var strokeDirectionAverageStars = metricAverageStars["strokeDirection"];

  var techniqueScoreMean = (strokeOrderAverageStars + strokeDirectionAverageStars) / 2;
  var techniqueScore = (strokeMatchAverageStars / 3) * techniqueScoreMean;

  // #endregion

  // #region Technique Score Calculation

  var strokeEditAverageStars = metricAverageStars["strokeEdit"];
  var strokeSpeedAverageStars = metricAverageStars["strokeSpeed"];
  var strokeLengthAverageStars = metricAverageStars["strokeLength"];
  var strokeClosenessAverageStars = metricAverageStars["strokeCloseness"];
  var symbolSpeedAverageStars = metricAverageStars["symbolSpeed"];

  var precisionScoreMean
    = (strokeEditAverageStars + strokeSpeedAverageStars + strokeLengthAverageStars
      + strokeClosenessAverageStars + symbolSpeedAverageStars) / 5;
  var precisionScore = (strokeMatchAverageStars / 3) * precisionScoreMean;

  // #endregion

  // #region Score Display Code

  // get the current chapter
  // alt: gettin chapter from 'chapter' global variable
  var chapter = assessments[0].chapter;

  // set the HTML tags
  var overallTable  = "<table class='overalltable smalltable table2col_25_75 largetext'>";
  var categoryTable  = "<table class='categorytable smalltable table2col_25_75 largetext'>";
  var table_ = "</table>";
  var tr     = "<tr>";
  var tr_    = "</tr>";
  var th     = "<th>";
  var th_    = "</th>"; 
  var td     = "<td>";
  var td_    = "</td>";
  var br     = "<br>";
  
  //
  var output = "";

  //
  output += "<span class='largetext'>" + "<strong>Overall Score</strong>" + "</span>";

  // start table
  output += overallTable;

  // write table headers
  output += tr;
  output += th + "Category" + th_;
  output += th + "Score" + th_;
  output += tr_;

  // write table data
  output += tr;
  output += td + "Chapter" + td_;
  output += td + getTextStars(chapterScore, 10) + td_;
  output += tr_;

  // end table
  output += table_;
  output += br;

  // set the category scores title 
  output += "<span class='largetext'>" + "<strong>Category Scores</strong>" + "</span>";

  // start table
  output += categoryTable;

  // write table headers
  output += tr;
  output += th + "Category" + th_;
  output += th + "Score" + th_;
  output += tr_;

  output += tr;
  output += td + "Structure" + td_;
  output += td + getTextStars(structureScore, 3) + td_;
  output += tr_;

  output += tr;
  output += td + "Technique" + td_;
  output += td + getTextStars(techniqueScore, 3) + td_;
  output += tr_;

  output += tr;
  output += td + "Precision" + td_;
  output += td + getTextStars(precisionScore, 3) + td_;
  output += tr_;
  
  
  // end table
  output += table_;

  // display output onto area
  var assessmentOverallScoresArea = document.getElementById("assessmentoverallscorearea");
  assessmentOverallScoresArea.innerHTML = output;

  // save scores state
  ScoresState["ch" + chapter] = chapterScore;

  // #endregion

}

function outputAssessmentIndividualScores(assessments) {

  // #region Score Calculation Code
  // initialize list of scores
  var scores = (new Array(assessments.length)).fill(0);

  // calculate the individual scores
  for (var i = 0; i < assessments.length; ++i) {
    // get the current assessment and its corresponding stars
    var assessment = assessments[i];
    var stars = assessment.stars;

    // count the number of stars except for stroke exist
    var totalStars = 0;
    for (var j = 0; j < metricNames.length; ++j) {
      // get the current metric name
      var metricName = metricNames[j];

      // skip stroke exist metric
      if (metricName === "strokeExist") { continue; }

      // get the metric's star count and add to count
      var starCount = stars[metricName];
      totalStars += starCount;
    }

    // calculate the average star count of all metrics exclusing stroke exist 
    var averageStars = totalStars / (metricNames.length - 1);

    // get the stroke exist metric stars
    var strokeExistStars = stars["strokeExist"];

    // calculate the score and add to list
    var score = ((strokeExistStars / 3 ) * averageStars / 3) * 10;
    scores[i] = score;
  }

  // #endregion

  // #region Score Display Code

  // set the HTML tags
  var table  = "<table class='individualtable smalltable table2col_25_75 largetext'>";
  var table_ = "</table>";
  var tr     = "<tr>";
  var tr_    = "</tr>";
  var th     = "<th>";
  var th_    = "</th>"; 
  var td     = "<td>";
  var td_    = "</td>";
  
  //
  var output = "";

  //
  output += "<span class='largetext'>" + "<strong>Individual Scores</strong>" + "</span>";

  // start table
  output += table;

  // write table headers
  output += tr;
  output += th + "Symbol" + th_;
  output += th + "Score" + th_;
  output += tr_;

  // write table data
  for (var i = 0; i < assessments.length; ++i) {
    var symbol = assessments[i].symbol;
    var score = scores[i];

    output += tr;
    output += td + "<span class='chinesefont'>" + idsToSymbolsData[symbol] + "</span>" + td_;
    output += td + getTextStars(score, 10) + td_;
    output += tr_;
  }
  
  // end table
  output += table_;

  //
  var assessmentIndividualScoresArea = document.getElementById("assessmentindividualscoresarea");
  assessmentIndividualScoresArea.innerHTML = output;

  // #endregion

}

function outputAssessmentMetricScores(assessments) {

  // metricNames

  // iterate through the assessments
  var starCounts = new Array(metricNames.length);
  starCounts.fill(0);
  for (var i = 0; i < assessments.length; ++i) {
    // get the current assessment and its stars
    var assessment = assessments[i];
    var stars = assessment.stars;

    // iterate through the assessment types
    for (var j = 0; j < metricNames.length; ++j) {
      // get the current assessment type
      var assessmentType = metricNames[j];
      
      // get the number of stars for the assessment's assessment type (i.e., metric) 
      var numStars = stars[assessmentType];

      // add the number of stars to the corresponding count
      starCounts[j] += numStars;
    }
  }

  // average the star counts
  var temp = starCounts.map(x => Math.round((x / assessments.length)));
  starCounts = temp;

  //
  var metricStars = {};
  for (var i = 0; i < metricNames.length; ++i) {
    var metricName = metricNames[i];
    var starCount = starCounts[i];
    metricStars[metricName] = starCount;
  }

  // --------------------------------------------------

  // set the HTML tags
  var structureTable  = "<table class='structuretable smalltable table2col_50_50 largetext'>";
  var techniqueTable  = "<table class='techniquetable smalltable table2col_50_50 largetext'>";
  var precisionTable  = "<table class='precisiontable smalltable table2col_50_50 largetext'>";
  var table_ = "</table>";
  var tr     = "<tr>";
  var tr_    = "</tr>";
  var th     = "<th>";
  var th_    = "</th>"; 
  var td     = "<td>";
  var td_    = "</td>";
  var br     = "<br>";
  
  //
  var output = "";

  //
  var assessmentType, starCount;

  //
  let structureOutput = "<span class='largetext'>" + "<strong>Structure Scores</strong>" + "</span>";
  {
    // start table
    structureOutput += structureTable;

    // write table headers
    structureOutput += tr;
    structureOutput += th + "Metric" + th_;
    structureOutput += th + "Score" + th_;
    structureOutput += tr_;

    assessmentType = "strokeMatch";
    starCount = metricStars[assessmentType];
    structureOutput += tr;
    structureOutput += td + assessmentType + td_;
    structureOutput += td + getTextStars(starCount, 3) + td_;
    structureOutput += tr_;

    assessmentType = "strokeValid";
    starCount = metricStars[assessmentType];
    structureOutput += tr;
    structureOutput += td + assessmentType + td_;
    structureOutput += td + getTextStars(starCount, 3) + td_;
    structureOutput += tr_;

    assessmentType = "strokeExist";
    starCount = metricStars[assessmentType];
    structureOutput += tr;
    structureOutput += td + assessmentType + td_;
    structureOutput += td + getTextStars(starCount, 3) + td_;
    structureOutput += tr_;

    // end table
    structureOutput += table_;
  }
  output += structureOutput;
  output += br;

  let techniqueOutput = "<span class='largetext'>" + "<strong>Technique Scores</strong>" + "</span>";
  {
    // start table
    techniqueOutput += techniqueTable;

    // write table headers
    techniqueOutput += tr;
    techniqueOutput += th + "Metric" + th_;
    techniqueOutput += th + "Score" + th_;
    techniqueOutput += tr_;

    assessmentType = "strokeOrder";
    starCount = metricStars[assessmentType];
    techniqueOutput += tr;
    techniqueOutput += td + assessmentType + td_;
    techniqueOutput += td + getTextStars(starCount, 3) + td_;
    techniqueOutput += tr_;

    assessmentType = "strokeDirection";
    starCount = metricStars[assessmentType];
    techniqueOutput += tr;
    techniqueOutput += td + assessmentType + td_;
    techniqueOutput += td + getTextStars(starCount, 3) + td_;
    techniqueOutput += tr_;

    // end table
    techniqueOutput += table_;
  }
  output += techniqueOutput;
  output += br;

  let precisionOutput = "<span class='largetext'>" + "<strong>Precision Scores</strong>" + "</span>";
  {
    // start table
    precisionOutput += precisionTable;

    // write table headers
    precisionOutput += tr;
    precisionOutput += th + "Metric" + th_;
    precisionOutput += th + "Score" + th_;
    precisionOutput += tr_;

    assessmentType = "strokeEdit";
    starCount = metricStars[assessmentType];
    precisionOutput += tr;
    precisionOutput += td + assessmentType + td_;
    precisionOutput += td + getTextStars(starCount, 3) + td_;
    precisionOutput += tr_;

    assessmentType = "strokeSpeed";
    starCount = metricStars[assessmentType];
    precisionOutput += tr;
    precisionOutput += td + assessmentType + td_;
    precisionOutput += td + getTextStars(starCount, 3) + td_;
    precisionOutput += tr_;

    assessmentType = "strokeLength";
    starCount = metricStars[assessmentType];
    precisionOutput += tr;
    precisionOutput += td + assessmentType + td_;
    precisionOutput += td + getTextStars(starCount, 3) + td_;
    precisionOutput += tr_;

    assessmentType = "strokeCloseness";
    starCount = metricStars[assessmentType];
    precisionOutput += tr;
    precisionOutput += td + assessmentType + td_;
    precisionOutput += td + getTextStars(starCount, 3) + td_;
    precisionOutput += tr_;

    assessmentType = "symbolSpeed";
    starCount = metricStars[assessmentType];
    precisionOutput += tr;
    precisionOutput += td + assessmentType + td_;
    precisionOutput += td + getTextStars(starCount, 3) + td_;
    precisionOutput += tr_;

    // end table
    precisionOutput += table_;
  }
  output += precisionOutput;
  output += br;

  //
  var assessmentMetricScoresArea = document.getElementById("assessmentmetricscoresarea");
  assessmentMetricScoresArea.innerHTML = output;
}

function outputAssessmentDetailedScores(assessments) {
  // set the HTML tags
  var table  = "<table class='detailedtable'>";
  var table_ = "</table>";
  var tr     = "<tr>";
  var tr_    = "</tr>";
  var th     = "<th>";
  var th_    = "</th>"; 
  var td     = "<td>";
  var td_    = "</td>";
  
  //
  var output = "";

  //
  output += "<span class='largetext'>" + "<strong>Detailed Scores</strong>" + "</span>";

  // start table
  output += table;
  
  output += tr;
  output += th + "Metric" + th_;
  for (var i = 0; i < assessments.length; ++i) {
    var assessment = assessments[i];
    var symbol = assessment.symbol;
    output += th + "<span class='chinesefont'>" + idsToSymbolsData[symbol] + "</span>" + th_;
  }
  output += tr_;

  //
  for (var i = 0; i < metricNames.length; ++i) {
    // get current assessment type
    var assessmentType = metricNames[i];

    //
    output += tr;
    output += td + assessmentType + td_;

    //
    for (var j = 0; j < assessments.length; ++j) {
      // get the current assessment
      var assessment = assessments[j];
      var stars = assessment.stars;

      // get the stroke match assessment
      var strokeMatch = stars[assessmentType];

      // output the stars
      output += td + getTextStars(strokeMatch, 3) + td_;
    }

    output += tr_;
  }

  // end table
  output += table_;

  //
  var assessmentDetailedScoresArea = document.getElementById("assessmentdetailedscoresarea");
  assessmentDetailedScoresArea.innerHTML = output;
}

function goButton(canvas, context) {

  // get the selected option
  var chapterSelect = document.getElementById("chapterselect");
  var selected = chapterSelect.value;

  // ignore non-chapter selections
  if (selected === "XX") { return; }

  // set the new chapter
  chapter = selected;

  // set the files
  imagesDataFile = "data/ch" + chapter + "/data_images.json";
  modelsDataFile = "data/ch" + chapter + "/data_models_trace.json";
  templatesDataFile = "data/ch" + chapter + "/data_templates_trace.json";

  // reset the interface and clear the canvas
  reset();
  clearAction(canvas, context);



  // get and set interaction mode
  var practiceInput = document.getElementById("practiceInput");
  var quizInput = document.getElementById("quizInput");
  if (practiceInput.checked) {
    interactionMode = InteractionEnum.practice;
    document.body.style.backgroundImage = Backgrounds.practiceImage;
    document.body.style.backgroundColor = Backgrounds.practiceColor;
  }
  else if (quizInput.checked) {
    interactionMode = InteractionEnum.quiz;
    document.body.style.backgroundImage = Backgrounds.quizImage;
    document.body.style.backgroundColor = Backgrounds.quizColor;
  }

  // set interface mode
  setInteractionMode(interactionMode);
}

function lockInterface(state) {

  var elements = document.querySelectorAll("input[type=submit]");
  var chapterSelect = document.getElementById("chapterselect");

  if (state) {
    Anim.buttonStates = {};
    for (var i = 0; i < elements.length; ++i) {
      var element = elements[i];
      Anim.buttonStates[element.id] = element.disabled;
      element.disabled = true;
    }

    //
    
    chapterSelect.disabled = true;

    removeCanvasListeners(canvas);
  }
  
  else {
    for (var i = 0; i < elements.length; ++i) {
      var element = elements[i];
      element.disabled = Anim.buttonStates[element.id];
    }

    //
    chapterSelect.disabled = false;

    addCanvasListeners(canvas);
  }

}

function setInteractionMode(mode) {

  // practice interaction mode
  if (mode === InteractionEnum.practice) {

    // reveal workspace area
    var workbookArea = document.getElementById("workbookarea")
    workbookArea.style.display = "grid";
    
    // reveal all buttons
    var buttons = document.querySelectorAll("input[type=submit]");
    for (var i = 0; i < buttons.length; ++i) {
      var button = buttons[i];
      button.style.display  = "inline";
    }

    // enable the following buttons: next, clear, undo, assess
    document.getElementById("clearButton").disabled = false;
    document.getElementById("undoButton").disabled = false;
    document.getElementById("assessButton").disabled = false;
    if (imagesData.length >= 2) {
      document.getElementById("nextButton").disabled = false;
    }
    
    // enable canvas
    addCanvasListeners(canvas);

    // load next image
    loadCanvasImage(canvas, context, imagesData[imageIndex].path, true);
  }

  // quiz interaction mode
  else if (mode === InteractionEnum.quiz) {

    // hide the following buttons: back, demo, steps
    var buttonIds = ["backButton", "demoButton", "stepsButton"];
    var button;
    for (var i = 0; i < buttonIds.length; ++i) {
      var buttonId = buttonIds[i];
      button = document.getElementById(buttonId);
      button.style.display = "none";
    }

    // disable next button
    button = document.getElementById("nextButton");
    button.disabled = true;

    // hide the options area
    var optionsArea = document.getElementById("optionsarea");
    optionsArea.style.display = "none";

    // randomize imagesData indices
    var imageIndices = [];
    for (var i = 0; i < imagesData.length; ++i) { imageIndices.push(i); }
    imageIndices = imageIndices.map((a) => ({sort: Math.random(), value: a}))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
    Quiz.imageIndices = imageIndices;
    
    // reset assessments
    Quiz.assessments = [];

    // load next random image
    var theIndex = imageIndices[imageIndex];
    loadCanvasImage(canvas, context, imagesData[theIndex].path, true);
  }

  // select interaction mode
  else if (mode === InteractionEnum.select) {
    
    // hide grade area
    var scoresArea = document.getElementById("scoresarea");
    scoresArea.style.display = "none";

    // check practice input and uncheck quiz input
    document.getElementById("practiceInput").checked = true;
    document.getElementById("quizInput").checked = false;

    // reveal the options area
    var optionsArea = document.getElementById("optionsarea");
    optionsArea.style.display = "inline";

  }

}

// #endregion

// #region File I/O Functions

function loadCanvasImage(canvas, context, filePath, showTrace) {

  // create the image
  var image = new Image();
  image.src = filePath;
  image.onload = function() {
    canvas.width = image.width;
    canvas.height = image.height;

    if (showTrace) { context.drawImage(image, 0, 0); }
  };
}

function getImagesData(fileName) {

  var content;
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      content = JSON.parse(this.response);
    }
  };
  request.open("GET", fileName, false);
  request.send();

  return content;
}

/**
 * Reads the target JSON file synchronously to a JS object.
 * @param {String} fileName The target JSON file. 
 */
function readFileSync(fileName) {
  var content;
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      content = JSON.parse(this.response);
    }
  };
  request.open("GET", fileName, false);
  request.send();
  return content;
}

// #endregion

// #region Fields

// The opaqueness.
var Opaqueness = {
  full: 1.0,
  heavy: 0.7,
  half: 0.5,
  light: 0.3,
};

// The results.
var Results = {
  stars: null,
  strokeMatchResults: null,
  strokeValidResults: null,
  strokeExistResults: null,
  strokeOrderResults: null,
  strokeDirectionResults: null,
  strokeEditResults: null,
  strokeSpeedResults: null,
  strokeLengthResults: null,
  strokeClosenessResults: null,
  symbolSpeedResults: null,
}

// The quiz object.
var Quiz = {
  imageIndices: [],
  assessments: []
};

// The colors.
var Colors = {
  black: "0,0,0",
  blue: "0,0,255",
  darkGreen: "0,64,0",
  gray: "128,128,128",
  green: "0,255,0",
  lightBlue: "191,239,255",
  orange: "255,165,0",
  purple: "85,26,139",
  red: "255,0,0",
};

// set the metric names
var metricNames = [
  "strokeMatch", 
  "strokeValid", 
  "strokeExist", 
  "strokeOrder", 
  "strokeDirection", 
  "strokeEdit", 
  "strokeSpeed", 
  "strokeLength", 
  "strokeCloseness", 
  "symbolSpeed"
];

// The data structure variables for storing the data collection session.
var CanvasData = {
  points: [],
  strokes: [],
  sketches: [],
  undos: 0,
  clears: 0,
};

// The anim object.
var Anim = {
  step: null,
  vertices: null,
  startVertices: null,
  originalState: null,
  buttonStates: null,
};

// The interaction enumerations.
var InteractionEnum = {
  practice: "practiceInput",
  quiz: "quizInput",
  select: "selectInput"
};

var ScoresState = {
  ch00: null,
  ch03: null,
  ch04: null,
  ch05: null,
  ch06: null,
  ch07: null,
  ch08: null,
  ch09: null,
  ch10: null,
  ch11: null,
  ch12: null
};

// The canvas and its context.
var canvas;
var context;

// The image and study files.
var imageFiles;
var studyFile;

// The study entries and current index.
var entries;
var index;

// The mouse interaction variables.
var mouseX = 0;
var mouseY = 0;
var mouseDown;

// The touch interaction variables.
var touchX;
var touchY;

// Keep track of the old/last position when drawing a line
// We set it to -1 at the start to indicate that we don't have a good value for it yet
var lastX = -1;
var lastY = -1;

// The stroke size and color.
var strokeSize = 5;
var strokeColor = Colors.black;
var strokeOpaqueness = Opaqueness.full;

// The canvas states.
var canvasStates;

// The canvas dimensions.
var canvasWidth;
var canvasHeight;

// The current chapter.
var chapter = "03";

// The image-related variables.
var imagesData;
var imageIndex;
var imagesDataFile = "data/ch" + chapter + "/data_images.json";

// The data-related variables.
var modelsData;
var templatesData;
var idsToSymbolsData;
var modelsDataFile = "data/ch" + chapter + "/data_models_trace.json";
var templatesDataFile = "data/ch" + chapter + "/data_templates_trace.json";
var idsToSymbolsDataFile = "data/ids_to_symbols.json";

// The interface mode.
var interactionMode;

// The background images.
var Backgrounds = {
  practiceImage: "url(bg_tan.jpg)",
  practiceColor: "#F6F0E8",
  quizImage: "url(bg_grey.jpg)",
  quizColor: "#E5E5E5"
};

// #endregion

// #endregion



// #region ############### SKETCH INTERACTION CODE ###############

// ----- START SKETCH GUI CODE -----

// #region Editing Event Handlers

/**
 * Clears the draw canvas and drawing data.
 * @param {Object} canavs - The draw canvas.
 * @param {Object} context - The draw context. 
 */
function clearButton(canvas, context) {
  // clear the canvas
  clearAction(canvas, context);

  // disable the feedback button
  var feedbackButton = document.getElementById("feedbackButton");
  feedbackButton.disabled = true;

  // clear feedback
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = "";

  // increment the clears count
  ++CanvasData.clears;
}

/**
 * Undoes the most recent stroke on the draw canvas, if any.
 * @param {Object} canvas - The draw canvas.
 * @param {Object} context - The draw context.
 */
function undoButton(canvas, context) {

  // no recorded strokes => do nothing
  if (CanvasData.strokes.length === 0) {
    return;
  }

  // disable the feedback button
  var feedbackButton = document.getElementById("feedbackButton");
  feedbackButton.disabled = true;

  // clear feedback
  var outputArea = document.getElementById("outputarea");
  outputArea.innerHTML = "";

  // remove the most recent canvas state
  var canvasState = canvasStates.pop();
  context.putImageData(canvasState, 0, 0);

  // remove the last stroke and clear the canvas
  CanvasData.strokes.pop();

  // increment the undos count
  ++CanvasData.undos;
}

function clearAction(canvas, context) {
  // no recorded strokes => do nothing
  if (CanvasData.strokes.length === 0) {
    return;
  }

  // revert to initial canvas state and clear the canvas states
  var canvasState = canvasStates[0];
  if (canvasState !== undefined) { context.putImageData(canvasState, 0, 0); }
  canvasStates = [];

  // reset the draw canvas' points and strokes
  CanvasData.points = [];
  CanvasData.strokes = [];
}

// #endregion

// #region Mouse Event Handlers

/**
 * Keeps track of the mouse button being pressed, and draws a dot.
 */
function canvas_mouseDown() {
  mouseDown = true;
  updateCanvas(canvas, context, mouseX, mouseY);
  collectPoint(mouseX, mouseY);
}

/**
 * Keeps track of the mouse position, and draws a dot if the mouse button is currently ressed.
 * @param {Object} e - The mouse event.
 */
function canvas_mouseMove(e) {
  // update the mouse co-ordinates when moved
  getMousePos(e);

  // draw a dot if the mouse button is currently being pressed
  if (mouseDown) {
      updateCanvas(canvas, context, mouseX, mouseY);
      collectPoint(mouseX, mouseY);
  }
}

/**
 * Keep track of the mouse button being released.
 */
function canvas_mouseUp() {
  // mousedown flag not already down => leave function 
  if (!mouseDown) { return; }

  // collect the stroke only if the mouse was already down, and disable the mouse tracking
  if (mouseDown) { collectStroke(); }
  mouseDown = false;

  // reset lastX and lastY to -1 to indicate that they are now invalid since mouse is up
  lastX = -1;
  lastY = -1;
}

/**
 * Set the current mouse position from the current mouse event.
 * @param {Object} e - The mouse event.
 */
function getMousePos(e) {
  if (!e)
      var e = event;

  if (e.offsetX) {
      mouseX = e.offsetX;
      mouseY = e.offsetY;
  }
  else if (e.layerX) {
      mouseX = e.layerX;
      mouseY = e.layerY;
  }
}

// #endregion

// #region Touch Event Handlers

/**
 * Draw when touch start is detected.
 */
function canvas_touchStart() {
  // update the touch coordinates
  getTouchPos();

  updateCanvas(canvas, context, touchX, touchY);
  collectPoint(touchX, touchY);

  // prevent an additional mousedown event being triggered
  event.preventDefault();
}

/**
 * Draw when touch movement is detected, and prevent default scrolling.
 * @param {Object} e - The touch event.
 */
function canvas_touchMove(e) {
  // update the touch co-ordinates
  getTouchPos(e);

  // during a touchmove event, unlike a mousemove event, there is no need to check if the touch is engaged,
  // since there will always be contact with the screen by definition.
  updateCanvas(canvas, context, touchX, touchY);
  collectPoint(touchX, touchY);

  // prevent a scrolling action as a result of this touchmove triggering.
  event.preventDefault();
}

/**
 * Finish drawing when touch is completed.
 */
function canvas_touchEnd() {
  // reset lastX and lastY to -1 to indicate that they are now invalid, since touch is completed
  lastX = -1;
  lastY = -1;

  collectStroke();
}

/**
 * Get the touch position relative to the top-left of the draw canvas.
 * Note: When getting the raw values of pageX and pageY below, it takes into account the scrolling on the page
 * but not the position relative to our target div. Therefore, adjust them using "target.offsetLeft" and
 * target.offsetTop" to get the correct values in relation to the top left of the canvas.
 * @param {Object} e - The touch event.
 */
function getTouchPos(e) {
  if (!e) {var e = event; }

  if(e.touches) {
    if (e.touches.length === 1) { // Only deal with one finger
      var touch = e.touches[0]; // Get the information for finger #1
      touchX = touch.pageX - touch.target.offsetLeft;
      touchY = touch.pageY - touch.target.offsetTop;
    }
  }
}

// #endregion

// #region GUI Updaters

/**
 * Update the draw canvas with the latest point and line segment.
 * @param {Object} context - The draw context.
 * @param {Number} x - The x-coordinate.
 * @param {Number} y - The y-coordinate.
 */
function updateCanvas(canvas, context, x, y) {
  // canvas has no points => revert to initial empty canvas state 
  if (CanvasData.points.length === 0) {
    var canvasState = context.getImageData(0, 0, canvas.width, canvas.height);
    canvasStates.push(canvasState);
  }

  // lastX is not set => set lastX and lastY to the current position
  if (lastX === -1) {
    lastX = x;
    lastY = y;
  }

  // draw latest line segment
  drawLineSegment(context, lastX, lastY, x, y, strokeColor, strokeOpaqueness, strokeSize);

  // Update the last position to reference the current position
  lastX = x;
  lastY = y;
}
  
/**
 * Draw a line segment between two points onto the draw canvas.
 * @param {Object} context - The draw context.
 * @param {Number} x0 - The first x-coordinate.
 * @param {Number} y0 - The first y-coordinate.
 * @param {Number} x1 - The second x-coordinate.
 * @param {Number} y1 - The second y-coordinate.
 * @param {String} color - The stroke color.
 * @param {Number} size - The stroke size.
 */
function drawLineSegment(context, x0, y0, x1, y1, color, opaqueness, size) {
  
  // set the stroke color
  context.strokeStyle = "rgba(" + color + "," + opaqueness + ")";
  //ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

  // set the line "cap" style to round, so lines at different angles can join into each other
  //context.lineCap = "round"; (default is "butt")

  // begin the stroke path
  context.beginPath();

  // user drew dot => increment the position by one to make drawn dot visible
  if (x0 === x1 && y0 === y1) {
    x1++;
    y1++;
  }

  // move to the previous point position
  context.moveTo(x0, y0);

  // draw a line to the current point position
  context.lineTo(x1, y1);

  // set the line thickness and draw the line
  context.lineWidth = size;
  context.stroke();

  // end the stroke path
  context.closePath();
}

// #endregion

// #region Data Collectors

/**
 * Collects the current point to add to the list.
 * @param {Number} x - The current point's x-coordinate.
 * @param {Number} y - The current point's y-coordinate.
 */
function collectPoint(x, y) {

  // create the current point and add to the point collection
  var time = Date.now();                  // create the time
  var id = generateUuidv4();
  var point = {x: x, y: y, time: time, id: id};   // create the point
  CanvasData.points.push(point);      // add to point collection
}

/**
 * Collects the current stroke to the list.
 */
function collectStroke() {
  //
  var id = generateUuidv4();
  var time = CanvasData.points[0].time;
  var stroke = {id: id, time: time, points: CanvasData.points, };
  CanvasData.strokes.push(stroke);
  CanvasData.points = [];
}

/**
 * Collects the current sketch to add to the list.
 */
function collectSketch(strokes, width, height, interpretation, domain) {
  var id = generateUuidv4();

  // get the sketch's first time
  var firstTime = strokes[0].points[0].time;

  // create the sketch's shapes object
  var shape = {};
  shape.subElements = [];
  for (var i = 0; i < strokes.length; i++) {
    var stroke = strokes[i];
    shape.subElements.push(stroke.id);
  }
  shape.time = firstTime;
  shape.interpretation = interpretation;
  shape.confidence = "1.0";

  // id, time, domain, strokes, shapes
  var sketch = {};
  sketch.id = id;
  sketch.time = firstTime;
  sketch.domain = domain;
  sketch.canvasWidth = width;
  sketch.canvasHeight = height;
  sketch.strokes = strokes;
  sketch.substrokes = strokes;
  sketch.shapes = [shape];

  CanvasData.sketches.push(sketch);
}

/**
 * Generates a new UUID (v4) value.
 * @return {Number} A new UUID (v4) value.
 */
function generateUuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// #endregion

// ----- END SKETCH GUI CODE -----

// #endregion



// #region ############### SKETCH RECOGNITION CODE ###############

// #region Sketch Rec Tools

var SketchRecTools = {

  // #region Scale Methods
  scaleProportional: function(sketch, size, isVertical) {
    // get the bounding box and determine scale
    var box = this.calculateBoundingBox(sketch);
    var scale = isVertical ? size / box.height : size / box.width;

    // get the offset
    var xOffset = Number.MAX_SAFE_INTEGER;
    var yOffset = Number.MAX_SAFE_INTEGER;
    var strokes = sketch.strokes;
    for (var i = 0; i < strokes.length; i++) {
      var points = strokes[i].points;
      for (var j = 0; j < points.length; j++) {
        var point = points[j];
        if (point.x < xOffset) { xOffset = point.x; }
        if (point.y < yOffset) { yOffset = point.y; }
      }
    }

    // get the scaled sketch
    var newStrokes = [];
    for (var i = 0; i < strokes.length; i++) {
      var points = strokes[i].points;
      var newPoints = [];
      for (var j = 0; j < points.length; j++) {
        var point = points[j];
        var x = ((point.x - xOffset) * scale) + xOffset;
        var y = ((point.y - yOffset) * scale) + yOffset;
        newPoints.push({x: x, y: y, time: point.time});
      }
      var newStroke = {points: newPoints};
      newStrokes.push(newStroke);
    }
    var newSketch = {strokes: newStrokes};

    // relocate scaled sketch to center of original sketch
    var newBox = this.calculateBoundingBox(newSketch);
    var moveX = box.centerX - newBox.centerX;
    var moveY = box.centerY - newBox.centerY;
    newSketch = this.translate(newSketch, moveX, moveY);

    // transfer the metadata back
    SketchRecTools.transferMetadata(newSketch, sketch);

    return newSketch;
  },

  scaleSquare: function(sketch, size) {
    // get the bounding box
    var box = this.calculateBoundingBox(sketch);

    // get the scaled sketch
    var newStrokes = [];
    var strokes = sketch.strokes;
    for (var i = 0; i < strokes.length; i++) {
      var points = strokes[i].points;
      var newPoints = [];
      for (var j = 0; j < points.length; j++) {
        var point = points[j];
        var x = point.x * size / box.width;
        var y = point.y * size / box.height;
        newPoints.push({x: x, y: y, time: point.time});
      }
      var newStroke = {points: newPoints};
      newStrokes.push(newStroke);
    }
    var newSketch = {strokes: newStrokes};

    // relocate scaled sketch to center of original sketch
    var newBox = this.calculateBoundingBox(newSketch);
    var moveX = box.centerX - newBox.centerX;
    var moveY = box.centerY - newBox.centerY;
    newSketch = this.translate(newSketch, moveX, moveY);

    // transfer the metadata back
    SketchRecTools.transferMetadata(newSketch, sketch);

    return newSketch;
  },

  // #endregion

  // #region Resample Methods

  resampleByCount: function(sketch, n) {
    var S = this.calculatePathLength(sketch) / (n - 1);

    return this.resample(sketch, S);
  },

  resampleByDistance: function(sketch, S) {
    if (typeof S === "undefined") {
      S = this.determineResampleSpacing(sketch);
    }

    return this.resample(sketch, S);
  },

  /**
   * Resamples the sketch on an interspacing distance.
   * @param {Sketch} sketch - The target sketch.
   * @param {number} S - The interspacing distance.
   * @return {Sketch} The resampled sketch.
   */
  resample: function(sketch, S) {
    //  initialize the variables
    var D = 0.0;
    var newStrokes = [];
    var strokes = sketch.strokes;

    // iterate through the strokes
    for (var i = 0; i < strokes.length; i++) {
      // get the current stroke, and skip if no points
      var stroke = strokes[i];
      if (stroke.points.length === 0) { continue; }

      // get the raw points
      var points = [];
      for (var j = 0; j < stroke.points.length; j++) {
        // get the current stroke point and add it to the points list
        var p = stroke.points[j];
        points.push(p);
      }

      // initialize the resampled points with the first raw point
      var newPoints = [];
      newPoints.push( {x: points[0].x, y: points[0].y, time: points[0].time} );

      // get the resampled points
      for (var j = 1; j < points.length; j++) {
        // get the previous and current point
        var prevPoint = points[j - 1];
        var currPoint = points[j];

        // get the distance between the previous and current point
        var d = this.calculateDistance(prevPoint.x, prevPoint.y, currPoint.x, currPoint.y);

        // check for ready resampled points
        if (D + d >= S) { // resampled point ready

          // set the resampled point's (x, y, t)
          var qx = prevPoint.x + ((S-D)/d)*(currPoint.x-prevPoint.x);
          var qy = prevPoint.y + ((S-D)/d)*(currPoint.y-prevPoint.y);
          var qt = currPoint.time;

          // set the resampled point data
          var q = {x: qx, y: qy, time: qt};

          // insert the resampled point into the raw and resampled point list
          newPoints.push(q);
          points.splice(j, 0, q);
          D = 0.0;
        }
        else { D += d; } // resampled point ready
      }

      // reset the distance counter for the next stroke
      D = 0.0;

      // wrap the resampled points to a stroke and add it to array of resampled strokes
      newStroke = {points: newPoints};
      newStrokes.push(newStroke);
    }

    // wrap the resampled strokes into a resampled sketch and return
    var newSketch = {strokes: newStrokes};

    // // restore the sketch's canvas dimensions
    // newSketch.canvasWidth = sketch.canvasWidth;
    // newSketch.canvasHeight = sketch.canvasHeight;

    // transfer the metadata back
    SketchRecTools.transferMetadata(newSketch, sketch);

    return newSketch;
  },

  resampleStrokesByCount(strokes, n) {

    // convert each stroke into its own sketch
    var newStrokes = [];
    for (var i = 0; i < strokes.length; ++i) {
      // get the current stroke
      var stroke = strokes[i];

      // convert the current stroke to a uni-stroke sketch
      var strokeSketch = { strokes:[stroke] };

      // resample the uni-stroke sketch
      strokeSketch = this.resampleByCount(strokeSketch, n);

      // add sketch's resampled uni-stroke into the collection
      newStrokes.push(strokeSketch.strokes[0]);
    }

    return newStrokes;
  },

  // #endregion

  // #region Translate Methods
  /**
   * Translate the sketch to a point.
   * @param {Sketch} sketch - The target sketch.
   * @param {number} x - The amount of pixels to move the sketch left or right.
   * @param {number} y - The amount of pixels to move the sketch up or down.
   * @return {Sketch} The translated sketch.
   */
  translate: function(sketch, x, y) {
    // error-check existing sketch 
    if (sketch === null || sketch === undefined || sketch.strokes === null || sketch.strokes === undefined || sketch.strokes.length === 0) {
      return null;
    }

    // get the current strokes and initialize the new strokes
    var strokes = sketch.strokes;
    var newStrokes = [];

    // iterate through each stroke
    for (var i = 0; i < strokes.length; i++) {
      // get the current points and initialize the new points
      var points = strokes[i].points;
      var newPoints = [];

      // iterate through each point
      for (var j = 0; j < points.length; j++) {
        // get the current point
        var point = points[j];

        // get the translated point
        var qx = point.x + x;
        var qy = point.y + y;
        var qtime = point.time;
        var q = {x: qx, y: qy, time: qtime};

        // add the new point
        newPoints.push(q);
      }

      // add the new stroke
      newStrokes.push({points: newPoints});
    }

    // // create the new sketch and its canvas width and height
    var newSketch = {strokes: newStrokes};

    // transfer the metadata back
    SketchRecTools.transferMetadata(newSketch, sketch);

    return newSketch;
  },

  translateToCenter: function(sketch) {
    var newSketch = this.cloneSketch(sketch);

    var box = this.calculateBoundingBox(sketch);
    var boxX = box.centerX;
    var boxY = box.centerY;
    var canvasX = sketch.canvasWidth / 2;
    var canvasY = sketch.canvasHeight / 2;
    var deltaX = canvasX - boxX;
    var deltaY = canvasY - boxY;
    newSketch = this.translate(newSketch, deltaX, deltaY);

    // transfer the metadata back
    this.transferMetadata(newSketch, sketch);

    return newSketch;
  },

  translateToCentroid: function(sketch) {
    var newSketch = this.cloneSketch(sketch);

    var box = this.calculateBoundingBox(sketch);
    var boxX = box.centroidX;
    var boxY = box.centroidY;
    var canvasX = sketch.canvasWidth / 2;
    var canvasY = sketch.canvasHeight / 2;
    var deltaX = canvasX - boxX;
    var deltaY = canvasY - boxY;
    newSketch = this.translate(newSketch, deltaX, deltaY);

    // transfer the metadata back
    this.transferMetadata(newSketch, sketch);

    return newSketch;
  },
  // #endregion

  // #region Helper Methods

  /**
   * Calculates the bounding box.
   * @param {Sketch} sketch - The target sketch.
   * @return {Box} The target sketch's bounding box.
   */
  calculateBoundingBox: function(sketch) {
    // bounding box is null if there is not sketch or sketch strokes
    if (sketch === null || sketch === undefined || sketch.strokes === null || sketch.strokes === undefined || sketch.strokes.length === 0) {
      return null;
    }

    // get the sketch's strokes and first point
    var strokes = sketch.strokes;
    var point0 = strokes[0].points[0];

    // initially set the min and max coordinates to the first point
    var minX = point0.x;
    var minY = point0.y;
    var maxX = point0.x;
    var maxY = point0.y;

    // initialize the coordinate sums and count
    var sumX = 0;
    var sumY = 0;
    var count = 0;

    // iterate through each stroke
    for (var i = 0; i < strokes.length; i++) {
      // get the current stroke points
      var points = strokes[i].points;
      
      // iterate through each stroke point
      for (var j = 0; j < points.length; j++) {
        // get the current point
        var point = points[j];
        
        // check the point for min and max coordinate conditions
        if (point.x < minX) { minX = point.x; }
        else if (point.x > maxX) { maxX = point.x; }
        if (point.y < minY) { minY = point.y; }
        else if (point.y > maxY) { maxY = point.y; }

        // add to the coordinate sums and count
        sumX += point.x;
        sumY += point.y;
        ++count;
      }
    }

    // calculate the center coordinates
    var centerX = minX + ((maxX - minX) / 2);
    var centerY = minY + ((maxY - minY) / 2);

    // calculate the centroid coordinates
    var centroidX = sumX / count;
    var centroidY = sumY / count;

    // calculate the corner, center, and centroid points 
    var topLeft = {x: minX, y: minY};
    var topRight = {x: maxX, y: minY};
    var bottomLeft = {x: minX, y: maxY};
    var bottomRight = {x: maxX, y: maxY};
    var center = {x: centerX, y: centerY};
    var centroid = {x: centroidX, y: centroidY};

    // calcuate the dimensions
    var width = maxX - minX;
    var height = maxY - minY;

    // create and return the bounding box
    var box = {topLeft: topLeft,
      topRight: topRight,
      bottomLeft: bottomLeft,
      bottomRight: bottomRight,
      center: center,
      centroid: centroid,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      centerX: centerX,
      centerY: centerY,
      centroidX: centroidX,
      centroidY: centroidY,
      height: height,
      width: width};
    return box;
  },

  determineResampleSpacing(sketch) {
    var box = this.calculateBoundingBox(sketch);
    var diagonal = this.calculateDistance(box.minX, box.minY, box.maxX, box.maxY);
    S = diagonal / 40.0;

    return S;
  },

  calculateDistance: function(x0, y0, x1, y1) {
    //
    return Math.sqrt( (x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0)  );
  },

  calculatePathLength: function(sketch) {
    // 
    var distances = 0.0;

    var strokes = sketch.strokes;
    for (var i = 0; i < strokes.length; i++) {
      var points = strokes[i].points;
      for (var j = 0; j < points.length - 1; j++) {

        var p0 = points[j];
        var p1 = points[j + 1];
        distances += this.calculateDistance(p0.x, p0.y, p1.x, p1.y);
      }
    }

    return distances;
  },

  getPointCloud: function(sketch) {
    // initialize the list of points
    var pointCloud = [];

    // iterate through the strokes
    var strokes = sketch.strokes;
    for (var i = 0; i < strokes.length; ++i) {
      // iterate through the points
      var points = strokes[i].points;
      for (var j = 0; j < points.length; ++j) {
        // add the current point
        var point = points[j];
        pointCloud.push(point);
      }
    }

    return pointCloud;
  },

  /**
   * Generates a new UUID (v4) value.
   * @return {Number} A new UUID (v4) value.
   */
  generateUuidv4: function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  cloneSketch: function(sketch) {
    var clone = JSON.parse(JSON.stringify(sketch));
    return clone;
  },

  transferMetadata: function(sketch, original) {
    // add the sketch metadata
    sketch.id = this.generateUuidv4();
    sketch.time = original.strokes[0].points[0].time; 
    sketch.domain = original.domain;
    sketch.shapes = original.shapes;
    sketch.canvasWidth = original.canvasWidth;
    sketch.canvasHeight = original.canvasHeight;

    // iterate through each stroke 
    for (var i = 0; i < sketch.strokes.length; ++i) {
      // get the current stroke
      var stroke = sketch.strokes[i];

      // add the stroke metadata
      stroke.id = this.generateUuidv4();
      stroke.time = sketch.strokes[i].points[0].time;

      // iterate through each point
      for (var j = 0; j < stroke.points.length; ++j) {
        var point = stroke.points[j];

        // add the point metadata
        point.id = this.generateUuidv4();
      }
    }
    
  },

  convertSketchToSpreadsheet: function(sketch) {
    // iterate through the strokes
    var lines = [];
    var strokes = sketch.strokes;
    for (var i = 0; i < strokes.length; ++i) {
      // iterate through the points
      var points = strokes[i].points;
      for (var j = 0; j < points.length; ++j) {
        // get the current point
        var point = points[j];
        var x = point.x;
        var y = point.y;
        lines.push("" + x + "\t" + y);
      }
      
      //
      lines.push("");
    }
    
    return lines;
  }

  // #endregion

};

// #endregion

// #region Template Matchers 

var Dollar = {
  /**
   * Run the template matcher on the input sketch.
   * @param {Object} input The input sketch.
   * @param {Object[]} templates The template sketches. 
   */
  run: function(input, templates) {
    // iterate through each template
    var results = [];
    for (var i = 0; i < templates.length; ++i) {
      // 1. Get the input's point cloud.
      // 2. Get the template and its label and point cloud.
      // 3. Get the smaller point cloud size beteween the input and template point clouds.
      // 4. Pop the larger point cloud until both point clouds are the same size.

      // get the input's point cloud
      var inputCloud = SketchRecTools.getPointCloud(input);

      // get the current template and its label and point cloud
      var template = templates[i];
      var templateLabel = template.shapes[0].interpretation;
      var templateCloud = SketchRecTools.getPointCloud(template);

      // get the smaller point count of the input and template point clouds
      var pointCount = Math.min(inputCloud.length, templateCloud.length);

      // pop the larger point cloud until both point clouds are the same size
      while (inputCloud.length > pointCount) { inputCloud.pop(); }
      while (templateCloud.length > pointCount) { templateCloud.pop(); }

      // calculate the greedy Hausdorff distance between the input and template both ways
      // need to divide by point count since point cloud count differs per template
      var score = this.calculateDistance(inputCloud, templateCloud) / pointCount;   // compare input from template

      // get and add the template-distance pair
      var result = {label: templateLabel, score: score};
      results.push(result);
    }

    // sort and return the template-distance pairs
    results.sort(function(a, b) { return a.score - b.score; });
    return results;
  },

  calculateDistance: function(cloud, otherCloud) {
    // set up both point clouds
    var thisCloud = cloud;
    var thatCloud = otherCloud;

    // iterate through the input point cloud
    var distance = 0;
    for (var i = 0; i < thisCloud.length; ++i) {
      // get the current input and template point
      var thisPoint = thisCloud[i];
      var thatPoint = thatCloud[i];

      // add the minimum distance
      distance += SketchRecTools.calculateDistance(
        thisPoint.x,
        thisPoint.y,
        thatPoint.x,
        thatPoint.y);
    }

    // calculate and return the score from the Hausdorff distance
    var score = distance; // / thisCloud.length;
    return score;
  }

  //end
};

var Greedy = {
  /**
   * Run the template matcher on the input sketch.
   * @param {Object} input The input sketch.
   * @param {Object[]} templates The template sketches. 
   */
  run: function(input, templates) {
    // iterate through each template
    var results = [];
    for (var i = 0; i < templates.length; ++i) {
      // 1. Get the input's point cloud.
      // 2. Get the template and its label and point cloud.
      // 3. Get the smaller point cloud size beteween the input and template point clouds.
      // 4. Pop the larger point cloud until both point clouds are the same size.

      // get the input's point cloud
      var inputCloud = SketchRecTools.getPointCloud(input);

      // get the current template and its label and point cloud
      var template = templates[i];
      var templateLabel = template.shapes[0].interpretation;
      var templateCloud = SketchRecTools.getPointCloud(template);

      // get the smaller point count of the input and template point clouds
      var pointCount = Math.min(inputCloud.length, templateCloud.length);

      // pop the larger point cloud until both point clouds are the same size
      while (inputCloud.length > pointCount) { inputCloud.pop(); }
      while (templateCloud.length > pointCount) { templateCloud.pop(); }

      // calculate the greedy Hausdorff distance between the input and template both ways
      // need to divide by point count since point cloud count differs per template
      var score = this.calculateCloudDistance(inputCloud, templateCloud) / pointCount;   // compare input from template
      var score2 = this.calculateCloudDistance(templateCloud, inputCloud) / pointCount;  // compare template from input

      // get the lowest score
      score = score < score2 ? score : score2;

      // get and add the template-distance pair
      var result = {label: templateLabel, score: score};
      results.push(result);
    }

    // sort and return the template-distance pairs
    results.sort(function(a, b) { return a.score - b.score; });
    return results;
  },

  calculateCloudDistance: function(cloud, otherCloud) {
    // set up both point clouds
    var thisCloud = [];
    var thatCloud = [];
    var pointCount = Math.min(cloud.length, otherCloud.length);
    for (var i = 0; i < pointCount; ++i) {
      thisCloud.push(cloud[i]);
      thatCloud.push(otherCloud[i]);
    }

    // iterate through the input point cloud
    var distance = 0;
    for (var i = 0; i < thisCloud.length; ++i) {
      // get the current input point
      var thisPoint = thisCloud[i];

      // set the initialize min distance and index
      var minDistance = Number.MAX_SAFE_INTEGER;
      var minIndex = -1;
      var minFound = false; // needed to prevent adding max integer to distance sum

      // iterate through the template points
      // find the minimum Euclidean distance between the input and template point  
      for (var j = 0; j < thatCloud.length; ++j) {

        // get the current template point
        var templatePoint = thatCloud[j];

        // get the input-template Euclidean distance
        var currentDistance
          = SketchRecTools.calculateDistance(
              thisPoint.x,
              thisPoint.y,
              templatePoint.x,
              templatePoint.y);
        
        // check for minimum distance
        if (currentDistance < minDistance) {
          minDistance = currentDistance;
          minIndex = j;
          minFound = true;
        }
  
      }

      // add the minimum distance
      if (minFound) { distance += minDistance; }
      thatCloud.splice(minIndex, 1);
    }

    // calculate and return the score from the Hausdorff distance
    var score = distance; // / thisCloud.length;
    return score;
  }

  //end
};

var PDollar = {
  /**
   * Run the template matcher on the input sketch.
   * @param {Object} input The input sketch.
   * @param {Object[]} templates The template sketches. 
   */
  run: function(input, templates) {
    // iterate through each template
    var results = [];
    for (var i = 0; i < templates.length; ++i) {
      // 1. Get the input's point cloud.
      // 2. Get the template and its label and point cloud.
      // 3. Get the smaller point cloud size beteween the input and template point clouds.
      // 4. Pop the larger point cloud until both point clouds are the same size.

      // get the input's point cloud
      var inputCloud = SketchRecTools.getPointCloud(input);

      // get the current template and its label and point cloud
      var template = templates[i];
      var templateLabel = template.shapes[0].interpretation;
      var templateCloud = SketchRecTools.getPointCloud(template);

      // get the smaller point count of the input and template point clouds
      var pointCount = Math.min(inputCloud.length, templateCloud.length);

      // // pop the larger point cloud until both point clouds are the same size
      // while (inputCloud.length > pointCount) { inputCloud.pop(); }
      // while (templateCloud.length > pointCount) { templateCloud.pop(); }

      // calculate the greedy Hausdorff distance between the input and template both ways
      // need to divide by point count since point cloud count differs per template
      var score = this.calculateDistance(inputCloud, templateCloud) / pointCount;   // compare input from template
      var score2 = this.calculateDistance(templateCloud, inputCloud) / pointCount;  // compare template from input

      // get the lowest score
      score = score < score2 ? score : score2;

      // get and add the template-distance pair
      var result = {label: templateLabel, score: score};
      results.push(result);
    }

    // sort and return the template-distance pairs
    results.sort(function(a, b) { return a.score - b.score; });
    return results;
  },

  calculateDistance: function(cloud, otherCloud) {
    // set up both point clouds
    // need to clone the second point cloud since it will be modified
    var thisCloud = cloud;
    var thatCloud = [];
    for (var i = 0; i < otherCloud.length; ++i) { thatCloud.push(otherCloud[i]); }

    // initialize the n value for use in the weight calculation 
    var n = thisCloud.length;

    // iterate through the input point cloud
    var distance = 0;
    for (var i = 0; i < thisCloud.length; ++i) {
      // get the current input point
      var thisPoint = thisCloud[i];

      // iterate through the template points
      // find the minimum Euclidean distance between the input and template point  
      var minDistance = Number.MAX_SAFE_INTEGER;
      var minIndex = -1;
      for (var j = 0; j < thatCloud.length; ++j) { // fix

        // get the current template point
        var templatePoint = thatCloud[j];

        // get the input-template Euclidean distance
        var currentDistance
          = SketchRecTools.calculateDistance(
              thisPoint.x,
              thisPoint.y,
              templatePoint.x,
              templatePoint.y);
        
        // check for minimum distance
        if (currentDistance < minDistance) {
          minDistance = currentDistance;
          minIndex = j;
        }
      }

      // calculate the weight
      var w = 1 - ( (j - 1) / n );

      // add the weighted minimum distance
      distance += w * minDistance;
      thatCloud.splice(minIndex, 1);
    }

    // calculate and return the score from the Hausdorff distance
    var score = distance; // / thisCloud.length;
    return score;
  }

  //end
};

// #endregion

// #endregion



// #region ############### SKETCH ASSESSMENT CODE ###############

var SketchAssessor = {

  // #region Assessment Methods

  strokeMatch: function(inputStrokes, modelStrokes) {

    // get point clouds from strokes
    var modelClouds = this.convertStrokesToPointClouds(modelStrokes);
    var inputClouds = this.convertStrokesToPointClouds(inputStrokes);

    // create array of model cloud positions
    var modelPositions = [];
    for (var i = 0; i < modelClouds.length; ++i) { modelPositions.push(i); }

    // iterate through the input clouds
    var matches = [];
    for (var i = 0; i < inputClouds.length; ++i) {

      // get the current input cloud
      var inputCloud = inputClouds[i];

      // initialize the min values
      var minError = Number.MAX_SAFE_INTEGER;
      var minIndex = -1;
      var minPosition = -1;

      // find the model stroke's position closest to current input stroke's position 
      // iterate through the model positions
      for (var j = 0; j < modelPositions.length; ++j) {

        // get the current model position
        var modelPosition = modelPositions[j];

        // get the current model cloud from its position
        var modelCloud = modelClouds[modelPosition];

        // calculate the error between the input and model clouds
        var error = Greedy.calculateCloudDistance(inputCloud, modelCloud);

        // current error less than min error => update the min values
        if (error < minError) {
          minError = error;
          minIndex = j;
          minPosition = modelPositions[j];
        }
        
      }

      // note: needed if more input strokes than model strokes?
      if (minPosition >= 0) {

        var modelCloud = modelClouds[minPosition];

        // get the input point cloud's coverage
        // FUTURE WORK: why 20?
        var coverage = this.calculateCoverage(inputCloud, modelCloud, 20);

        // note: why coverage less than 0.8
        if (coverage < 0.8) { minPosition = -1; }
      }

      // add minimum position to mapping for current model stroke index 
      matches.push(minPosition);

      // remove the index of the model position with the previous min error
      // note: only remove minIndex if minPosition is valid
      if (minPosition > 0) {
        modelPositions.splice(minIndex, 1);
      }

    }

    return matches;
  },

  strokeValid: function(matches) {

    // initialize the list of results
    var results = [];
    
    // iterate through the matches
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];
      
      // check validity of match
      var result = match >= 0;

      // add validity to list of results
      results.push(result);
    }

    return results;
  },

  strokeExist: function(matches, modelStrokes) {

    // populate the list of exist flags
    var exists = [];
    for (var i = 0; i < modelStrokes.length; ++i) {
      exists.push(null);
    }

    // iterate through the matches
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];

      // valid match => set exist flag
      if (match >= 0) {
        exists[match] = i;
      }
    }

    return exists;
  },

  strokeOrder: function(matches) {

    // get the valid matches
    var valids = [];
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];

      // add the valid match
      if (match >= 0) { valids.push(match); }
    }

    // clone and sort the valid matches
    var clones = [];
    for (var i = 0; i < valids.length; ++i) {
      // get current valid match
      var valid = valids[i];

      // add the valid match to the list of clones
      clones.push(valid);
    }
    clones.sort( function(a, b) {return a - b} );

    // create the order mapping
    var orders = [];
    for (var i = 0; i < clones.length; ++i) {
      // get the current sorted valid match
      var clone = clones[i];

      // map the match to the order
      orders[clone] = i;
    }

    //
    var results = [];
    var counter = 0;
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];

      // initialize the result
      var result;

      // add null result for invalid matches
      if (match < 0) {
        result = null;
        results.push(result);
        continue;
      }

      // get the order
      var order = orders[match];

      // calculate the result and add to list of results
      result = order - counter;
      results.push(result);

      // increment the counter
      ++counter;
    }

    // return the results
    return results;
  },

  strokeDirection: function(matches, inputStrokes, modelStrokes) {

    // iterate through the matches
    var results = [];
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];
      
      // add null result and skip to next match if match is invalid
      if (match < 0) {
        results.push(null);
        continue;
      }

      // get the current input stroke and matching model stroke
      var inputStroke = inputStrokes[i];
      var modelStroke = modelStrokes[match];

      // initialize the input, input reverse, and model stroke points
      var size = Math.min(inputStroke.points.length, modelStroke.points.length);
      var inputPoints = [];
      var inputPointsR = [];
      var modelPoints = [];

      // get the input, input reverse, and model stroke points
      for (var j = 0; j < size; ++j) {

        inputPoints.push(inputStroke.points[j]);
        inputPointsR.push(inputStroke.points[size - j - 1]);
        modelPoints.push(modelStroke.points[j]);
      }

      // calculate the 1-to-1 distances between the input and input reverse stroke points
      // to the model stroke points
      var originalError = 0.0;
      var reverseError = 0.0;
      for (var j = 0; j < size; ++j) {

        // get the current stroke point
        var inputPoint = inputPoints[j];
        var inputPointR = inputPointsR[j];
        var modelPoint = modelPoints[j];

        // calculate the local original and reverse errors
        originalError += SketchRecTools.calculateDistance(inputPoint.x, inputPoint.y, modelPoint.x, modelPoint.y);
        reverseError += SketchRecTools.calculateDistance(inputPointR.x, inputPointR.y, modelPoint.x, modelPoint.y);
      }
      
      // assess the stroke direction and add to the list of results
      var result = originalError < reverseError;
      results.push(result);
    }

    return results;
  },

  strokeEdit: function(undos, clears) {
    var result = {};
    result.undos = undos;
    result.clears = clears;
    return result;
  },

  strokeSpeed: function(matches, inputStrokes, modelStrokes) {
    // iterate through the matches
    var results = [];
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];

      // add null result and skip to next match if match is invalid
      if (match < 0) {
        results.push(null);
        continue;
      }

      // get the current input stroke points and matching model stroke points
      var modelPoints = modelStrokes[match].points;
      var inputPoints = inputStrokes[i].points;
      
      // get the times and corresponding ratio
      var modelTime = modelPoints[modelPoints.length - 1].time - modelPoints[0].time;
      var inputTime = inputPoints[inputPoints.length - 1].time - inputPoints[0].time;
      var ratio = modelTime / inputTime;

      // add the ratio to the list of results
      results.push(ratio);
    }

    return results;
  },

  strokeLength: function(matches, inputStrokes, modelStrokes, weight) {
    // iterate through the matches
    var results = [];
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];

      // add null result and skip to next match if match is invalid
      if (match < 0) {
        results.push(null);
        continue;
      }

      // get the current input stroke and matching model stroke
      var inputStroke = inputStrokes[i];
      var modelStroke = modelStrokes[match];
      
      // convert the input and model strokes into corresponding single-stroke sketches
      var inputSketch = { strokes: [inputStroke] };
      var modelSketch = { strokes: [modelStroke] };

      // calculate the lengths
      var inputLength = SketchRecTools.calculatePathLength(inputSketch);
      var modelLength = SketchRecTools.calculatePathLength(modelSketch);
      var deltaLength = inputLength - modelLength;

      // calculate the weight and add to the results
      var result = (deltaLength / modelLength) * (modelLength / weight);
      results.push(result);
    }

    return results;
  },

  strokeCloseness(matches, inputStrokes, modelStrokes) {
    // iterate through the matches
    var results = [];
    for (var i = 0; i < matches.length; ++i) {
      // get the current match
      var match = matches[i];

      // add null result and skip to next match if match is invalid
      if (match < 0) {
        results.push(null);
        continue;
      }

      // get the current input stroke points and matching model stroke points
      var modelPoints = modelStrokes[match].points;
      var inputPoints = inputStrokes[i].points;

      // set up variables for size and for within range
      var size = Math.min(inputPoints.length, modelPoints.length);
      var within = 0;

      // iterate through the input points
      for (var j = 0; j < size; ++j) {
        var ip = inputPoints[j];

        // iterate through the model points
        var minError = Number.MAX_SAFE_INTEGER;
        for (var k = 0; k < size; ++k) {
          // get the current model point
          var mp = modelPoints[k];

          // calculate the error between the input and model point
          var error = SketchRecTools.calculateDistance(ip.x, ip.y, mp.x, mp.y);

          // check for min case
          if (error < minError) {
            minError = error;
          }
        }

        // increment if error is within range
        if (minError < 15) { ++within; }
        
      }

      // add ratio to list of results
      var ratio = within / size;
      results.push(ratio);
    }

    return results;
  },

  symbolSpeed(matches, inputStrokes, modelStrokes) {

    //
    var firstInputStroke = inputStrokes[0];
    var firstModelStroke = modelStrokes[0];
    var firstInputPoint = firstInputStroke.points[0];
    var firstModelPoint = firstModelStroke.points[0];
    
    //
    var lastInputStroke = inputStrokes[inputStrokes.length - 1];
    var lastModelStroke = modelStrokes[modelStrokes.length - 1];
    var lastInputPoint = lastInputStroke.points[lastInputStroke.points.length - 1];
    var lastModelPoint = lastModelStroke.points[lastModelStroke.points.length - 1];

    //
    var totalInputTime = lastInputPoint.time - firstInputPoint.time;
    var totalModelTime = lastModelPoint.time - firstModelPoint.time;

    //
    var ratio = totalModelTime / totalInputTime;

    return ratio;
  },

  // #endregion

  // #region Helper Methods

  calculateCoverage: function(cloud, otherCloud, threshold) {

    // set up both point clouds
    var thisCloud = [];
    var thatCloud = [];
    var pointCount = Math.min(cloud.length, otherCloud.length);
    for (var i = 0; i < pointCount; ++i) {
      thisCloud.push(cloud[i]);
      thatCloud.push(otherCloud[i]);
    }
    
    //get the coverage of the first point cloud
    var thisInside = 0;
    for (var i = 0; i < thisCloud.length; ++i) {
      
      var thisPoint = thisCloud[i];
      var minDistance = Number.MAX_SAFE_INTEGER;

      for (var j = 0; j < thatCloud.length; ++j) {
        var thatPoint = thatCloud[j];
        var distance = SketchRecTools.calculateDistance(thisPoint.x, thisPoint.y, thatPoint.x, thatPoint.y);
        
        if (distance < minDistance) { minDistance = distance; }
      }
      if (minDistance < threshold) { ++thisInside; }
    }
    var thisCoverage = thisInside / pointCount;

    // get the coverage of the second point cloud
    var thatInside = 0;
    for (var i = 0; i < thatCloud.length; ++i) {
      
      var thatPoint = thatCloud[i];
      var minDistance = Number.MAX_SAFE_INTEGER;

      for (var j = 0; j < thisCloud.length; ++j) {
        var thisPoint = thisCloud[j];
        var distance = SketchRecTools.calculateDistance(thisPoint.x, thisPoint.y, thatPoint.x, thatPoint.y);
        
        if (distance < minDistance) { minDistance = distance; }
      }
      if (minDistance < threshold) { ++thatInside; }
    }
    var thatCoverage = thatInside / pointCount;

    // get the smaller of the coverages
    var coverage = Math.min(thisCoverage, thatCoverage);
    return coverage;
  },

  convertStrokesToPointClouds: function(strokes) {
    var clouds = [];
    for (var i = 0; i < strokes.length; ++i) {
      // get the current stroke
      var stroke = strokes[i];

      // get the current cloud
      var strokeSketch = {strokes: [stroke]};
      var cloud = SketchRecTools.getPointCloud( strokeSketch );

      // add input cloud to list of input clouds
      clouds.push(cloud);
    }

    return clouds;
  }

  // #endregion
  
};

// #endregion
