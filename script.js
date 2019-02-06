var lsys = (function Lsys(){
    var state = {};

    var init = function(initParams) {
        state.drawingParams = {
            turningAngle: 20,
            x: 0,
            y: 0,
            facingAngle: 270,
            lineWidth: 1,
            lineWidthIncrement: 1,
            fillColor: 'green',
            lineLength: 6,
            lineLengthScaleFactor: 1.4,
            '+': 1,
            '-': -1,
            turningAngleIncrement: 5,
            strokeColor: 'green',
        };

        state.axiom = initParams.axiom;
        state.rules = initParams.rules;
        state.drawingParamsStack = [];
        state.canvas = document.getElementById('lsys-canvas');
        state.ctx = state.canvas.getContext('2d');
        state.ctx.translate(400, 700);
    };

    var rewriteAxiom = function() {
        var ruleKeys = Object.keys(state.rules);
        for(var i = 0; i < ruleKeys.length; i += 1) {
            state.axiom = state.axiom.replace(new RegExp(ruleKeys[i], 'g'), state.rules[ruleKeys[i]]);
        }
    };

    var turn = function(options) {
        if(options.direction) {
            state.drawingParams.facingAngle = (
                state.drawingParams.facingAngle + (state.drawingParams[options.direction] * state.drawingParams.turningAngle)
            ) % 360;
        } else if(options.angle) {
            state.drawingParams.facingAngle = (state.drawingParams.facingAngle + options.angle) % 360;
        }
    };

    var forward = function(options) {
        var nextX = state.drawingParams.x + ( state.drawingParams.lineLength * Math.cos((Math.PI / 180) * state.drawingParams.facingAngle) );
        var nextY = state.drawingParams.y + ( state.drawingParams.lineLength * Math.sin((Math.PI / 180) * state.drawingParams.facingAngle) );
        if(options.line) {
            console.log(state.drawingParams.x, state.drawingParams.y, nextX, nextY);
            state.ctx.beginPath();
            state.ctx.moveTo(state.drawingParams.x, state.drawingParams.y);
            state.ctx.lineTo(nextX, nextY);
            state.ctx.strokeStyle = state.drawingParams.strokeColor;
            state.ctx.stroke();
        }
        state.drawingParams.x = nextX;
        state.drawingParams.y = nextY;
    };

    var pushDrawingParams = function() {
        var drawingParamsKeys = Object.keys(state.drawingParams);
        var copyObj = {};
        for( var i = 0; i < drawingParamsKeys.length; i += 1) {
            copyObj[drawingParamsKeys[i]] = state.drawingParams[drawingParamsKeys[i]];
        }
        state.drawingParamsStack.push(copyObj);
    };

    var popDrawingParams = function() {
        state.drawingParams = state.drawingParamsStack.pop();
    };

    var incrementLineWidth = function() {
        state.drawingParams.lineWidth += state.drawingParams.lineWidthIncrement;
    };

    var decrementLineWidth = function() {
        state.drawingParams.lineWidth -= state.drawingParams.lineWidthIncrement;
    };

    var drawDot = function() {
        state.ctx.fillRect(state.drawingParams.x, state.drawingParams.y, state.drawingParams.lineWidth, state.drawingParams.lineWidth);
    };

    var startPolygon = function() {
        state.ctx.beginPath();
    };

    var endPolygon = function() {
        state.ctx.closePath();
        state.ctx.fill();
    };

    var multiplyLineLength = function() {
        state.drawingParams.lineLength *= state.drawingParams.lineLengthScaleFactor;
    };

    var divideLineLength = function() {
        state.drawingParams.lineLength /= state.drawingParams.lineLengthScaleFactor;
    };

    var swapDirections = function() {
        var t = state.drawingParams['+'];
        state.drawingParams['+'] = state.drawingParams['-'];
        state.drawingParams['-'] = t;
    };

    var decrementTurningAngle = function() {
        state.drawingParams.turningAngle -= state.drawingParams.turningAngleIncrement;
    };

    var incrementTurningAngle = function() {
        state.drawingParams.turningAngle += state.drawingParams.turningAngleIncrement;
    };

    var applyDrawingStateToCanvas = function() {
        // state.ctx.moveTo(state.drawingParams.x, state.drawingParams.y);
        state.ctx.lineWidth = state.drawingParams.lineWidth;
        state.ctx.fillStyle = state.drawingParams.fillColor;
    };

    var drawAxiom = function() {
        for( var i = 0; i < state.axiom.length; i += 1) {
            applyDrawingStateToCanvas();
            switch(state.axiom[i]) {
                case 'F': forward({ line: true });
                    break;
                case 'f': forward({ line: false });
                    break;
                case '+': turn({ direction: '+' });
                    break;
                case '-': turn({ direction: '-' });
                    break;
                case '|': turn({ angle: 180 });
                    break;
                case '[': pushDrawingParams();
                    break;
                case ']': popDrawingParams();
                    break;
                case '#': incrementLineWidth();
                    break;
                case '!': decrementLineWidth();
                    break;
                case '@': drawDot();
                    break;
                case '{': startPolygon();
                    break;
                case '}': endPolygon();
                    break;
                case '>': multiplyLineLength();
                    break;
                case '<': divideLineLength();
                    break;
                case '&': swapDirections();
                    break;
                case '(': decrementTurningAngle();
                    break;
                case ')': incrementTurningAngle();
                    break;
            }
        }
    };

    return {
        init: init,
        drawAxiom: drawAxiom,
        rewriteAxiom: rewriteAxiom,
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    lsys.init({
        axiom: 'X',
        rules: {
            F: 'FF',
            X: 'F[+X]F[-X]+X',
        },
    });

    var n = 6;
    for( var i = 0; i < n; i +=1 ) {
        lsys.rewriteAxiom();
    }
    lsys.drawAxiom();
});
