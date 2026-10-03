// =====================================================
//  CALC//01 — Mathematical Workstation  (v2)
//  Web Programming Lab 7
//  script.js
// =====================================================

// ─────────────────────────────────────────────────────
//  STATE — the calculator "memory"
// ─────────────────────────────────────────────────────

var currentInput   = '';   // what the user is currently typing
var expression     = '';   // the full expression string shown above the result
var justComputed   = false; // true right after pressing =, so next digit starts fresh

// ─────────────────────────────────────────────────────
//  ELEMENT REFERENCES
// ─────────────────────────────────────────────────────

// Keypad display
var displayExpression = document.getElementById('displayExpression');
var displayResult     = document.getElementById('displayResult');

// Form mode elements
var formInput1    = document.getElementById('num1');
var formInput2    = document.getElementById('num2');
var formSelect    = document.getElementById('operationSelect');
var formResultVal = document.getElementById('formResultValue');
var formResultEq  = document.getElementById('formResultEquation');

// History list
var historyList  = document.getElementById('historyList');
var historyEmpty = document.getElementById('historyEmpty');

// ─────────────────────────────────────────────────────
//  KEYPAD FUNCTIONS
// ─────────────────────────────────────────────────────

// inputKey() — called when any number, operator, or decimal is pressed
function inputKey(key) {

  var operators = ['+', '−', '×', '÷'];

  // After pressing = and getting a result, if the user presses a number
  // start fresh; if they press an operator continue from the result
  if (justComputed) {
    if (operators.indexOf(key) !== -1) {
      // Continue chaining: keep current display result as the start of new expression
      expression   = displayResult.textContent + ' ' + key + ' ';
      currentInput = '';
      justComputed = false;
      updateDisplay(expression, displayResult.textContent);
      return;
    } else {
      // New number: clear everything and start fresh
      clearCalc();
    }
  }

  // Handle percentage key
  if (key === '%') {
    if (currentInput !== '') {
      var pct = parseFloat(currentInput) / 100;
      currentInput = String(pct);
      expression = expression.replace(/[\d.]+$/, currentInput);
      updateDisplay(expression, currentInput);
    }
    return;
  }

  // Handle operator keys
  if (operators.indexOf(key) !== -1) {
    if (currentInput === '' && expression === '') return; // nothing to operate on

    // If expression already ends with an operator, replace it
    if (currentInput === '') {
      expression = expression.replace(/[+−×÷]\s*$/, key + ' ');
    } else {
      expression += currentInput + ' ' + key + ' ';
      currentInput = '';
    }
    updateDisplay(expression, expression.trim() || '0');
    return;
  }

  // Handle decimal point — only one allowed per number
  if (key === '.') {
    if (currentInput.indexOf('.') !== -1) return; // already has a dot
    if (currentInput === '') currentInput = '0';
    currentInput += '.';
    updateDisplay(expression + currentInput, currentInput || '0');
    return;
  }

  // Handle digit keys (0–9)
  currentInput += key;

  // Prevent unreasonably long inputs
  if (currentInput.length > 15) {
    currentInput = currentInput.slice(0, 15);
    return;
  }

  updateDisplay(expression + currentInput, currentInput || '0');
}

// ─────────────────────────────────────────────────────
//  updateDisplay() — refreshes what the user sees
// ─────────────────────────────────────────────────────
function updateDisplay(exprText, resultText) {
  displayExpression.textContent = exprText || '\u00A0'; // \u00A0 = non-breaking space
  displayResult.textContent     = resultText || '0';
  displayResult.classList.remove('is-error');
}

// ─────────────────────────────────────────────────────
//  clearCalc() — AC button, resets everything
// ─────────────────────────────────────────────────────
function clearCalc() {
  currentInput = '';
  expression   = '';
  justComputed = false;
  updateDisplay('', '0');
}

// ─────────────────────────────────────────────────────
//  deleteLast() — DEL button, removes last character
// ─────────────────────────────────────────────────────
function deleteLast() {
  if (justComputed) {
    clearCalc();
    return;
  }

  if (currentInput.length > 0) {
    // Remove the last character from the current number being typed
    currentInput = currentInput.slice(0, -1);
    var shown = currentInput || '0';
    updateDisplay(expression + currentInput, shown);
  } else if (expression.length > 0) {
    // Remove the trailing operator from the expression
    expression = expression.replace(/\s*[+−×÷]\s*$/, '').trimEnd();
    // Pull the last number back into currentInput so it can be edited
    var parts = expression.split(/\s+/);
    currentInput = parts[parts.length - 1] || '';
    expression   = parts.slice(0, parts.length - 1).join(' ');
    if (expression.length > 0) expression += ' ';
    updateDisplay(expression + currentInput, currentInput || '0');
  }
}

// ─────────────────────────────────────────────────────
//  computeResult() — = button
//  Evaluates the full expression built up so far
// ─────────────────────────────────────────────────────
function computeResult() {

  // Nothing to compute
  if (expression === '' && currentInput === '') return;

  // Build the complete expression string
  var fullExpr = expression + currentInput;
  fullExpr = fullExpr.trim();

  if (fullExpr === '') return;

  // Convert our display symbols to JS operators
  var jsExpr = fullExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  // Check for division by zero before evaluating
  if (/\/\s*0(\s|$)/.test(jsExpr)) {
    displayResult.textContent = 'Cannot divide by zero';
    displayResult.classList.add('is-error');
    displayExpression.textContent = fullExpr + ' =';
    justComputed = true;
    return;
  }

  // Evaluate the expression safely
  var answer;
  try {
    // eslint-disable-next-line no-eval
    answer = eval(jsExpr); // safe here — input is tightly controlled digits + operators
  } catch (e) {
    displayResult.textContent = 'Invalid expression';
    displayResult.classList.add('is-error');
    justComputed = true;
    return;
  }

  // Guard against NaN / Infinity
  if (!isFinite(answer) || isNaN(answer)) {
    displayResult.textContent = 'Cannot divide by zero';
    displayResult.classList.add('is-error');
    displayExpression.textContent = fullExpr + ' =';
    justComputed = true;
    return;
  }

  // Round to avoid floating-point noise
  var rounded = parseFloat(answer.toFixed(10));

  // Update display
  displayExpression.textContent = fullExpr + ' =';
  displayResult.classList.remove('is-error');
  displayResult.textContent = rounded;

  // Add to calculation history
  addToHistory(fullExpr + ' = ' + rounded);

  // Mark that a computation just finished
  justComputed = true;
  currentInput = String(rounded);
  expression   = '';
}

// ─────────────────────────────────────────────────────
//  FORM MODE FUNCTIONS
//  These functions read from the HTML form elements
//  directly — satisfying the lab requirement of
//  "using form elements and JavaScript"
// ─────────────────────────────────────────────────────

// Symbols map for display
var opSymbols = {
  add:      '+',
  subtract: '−',
  multiply: '×',
  divide:   '÷'
};

// formCalculate() — reads the form inputs and performs arithmetic
function formCalculate() {

  // Step 1: Get values from the form input fields
  var rawA = formInput1.value.trim();
  var rawB = formInput2.value.trim();
  var op   = formSelect.value;

  // Step 2: Validate — both fields must be filled in
  if (rawA === '' || rawB === '') {
    showFormError('Please enter both numbers.');
    return;
  }

  // Step 3: Convert string values to numbers
  var num1 = parseFloat(rawA);
  var num2 = parseFloat(rawB);

  // Step 4: Check for non-numeric entries
  if (isNaN(num1) || isNaN(num2)) {
    showFormError('Please enter valid numbers.');
    return;
  }

  // Step 5: Perform the selected arithmetic operation
  var answer;

  if (op === 'add') {
    // Perform addition
    answer = num1 + num2;

  } else if (op === 'subtract') {
    // Perform subtraction
    answer = num1 - num2;

  } else if (op === 'multiply') {
    // Perform multiplication
    answer = num1 * num2;

  } else if (op === 'divide') {
    // Handle division by zero
    if (num2 === 0) {
      showFormError('Cannot divide by zero.');
      return;
    }
    // Perform division
    answer = num1 / num2;
  }

  // Step 6: Round to avoid floating-point display issues
  var rounded = parseFloat(answer.toFixed(10));

  // Step 7: Build the equation string (e.g. "24 + 12 = 36")
  var sym = opSymbols[op];
  var equation = num1 + ' ' + sym + ' ' + num2 + ' = ' + rounded;

  // Step 8: Display the result and equation on the page
  formResultVal.classList.remove('is-error', 'animate-in');
  void formResultVal.offsetWidth; // force reflow so animation replays
  formResultVal.textContent = rounded;
  formResultVal.classList.add('animate-in');

  formResultEq.textContent = equation;

  // Step 9: Add to history
  addToHistory(equation);
}

// showFormError() — shows a styled error in the form result area
function showFormError(message) {
  formResultVal.classList.remove('animate-in');
  void formResultVal.offsetWidth;
  formResultVal.textContent = message;
  formResultVal.classList.add('is-error', 'animate-in');
  formResultEq.textContent = '';
}

// ─────────────────────────────────────────────────────
//  HISTORY FUNCTIONS
// ─────────────────────────────────────────────────────

// addToHistory() — inserts a new entry at the top of the list
function addToHistory(equationText) {
  // Hide the "no calculations yet" message
  historyEmpty.style.display = 'none';

  // Split equation into expression and answer parts
  var parts  = equationText.split(' = ');
  var expr   = parts[0] || equationText;
  var answer = parts[1] !== undefined ? parts[1] : '';

  // Build the list item
  var li = document.createElement('li');
  li.classList.add('history-item');

  var exprSpan = document.createElement('span');
  exprSpan.classList.add('history-expr');
  exprSpan.textContent = expr + ' =';

  var ansSpan = document.createElement('span');
  ansSpan.classList.add('history-answer');
  ansSpan.textContent = answer;

  li.appendChild(exprSpan);
  li.appendChild(ansSpan);

  // Insert at the top so newest is first
  historyList.insertBefore(li, historyList.firstChild);
}

// clearHistory() — removes all history entries
function clearHistory() {
  // Remove all list items except the empty message
  var items = historyList.querySelectorAll('.history-item');
  items.forEach(function(item) {
    historyList.removeChild(item);
  });

  // Show the empty state message again
  historyEmpty.style.display = '';
}

// ─────────────────────────────────────────────────────
//  KEYBOARD SUPPORT
//  Maps physical keyboard keys to calculator buttons
// ─────────────────────────────────────────────────────
document.addEventListener('keydown', function(event) {

  // Ignore keyboard if the user is typing inside a form input
  var tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'SELECT') return;

  var key = event.key;

  // Digits
  if (key >= '0' && key <= '9') {
    inputKey(key);

  // Operators
  } else if (key === '+') {
    inputKey('+');
  } else if (key === '-') {
    inputKey('−');
  } else if (key === '*') {
    inputKey('×');
  } else if (key === '/') {
    event.preventDefault(); // prevent browser quick-find
    inputKey('÷');

  // Decimal
  } else if (key === '.') {
    inputKey('.');

  // Equals / Enter
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    computeResult();

  // Escape = AC
  } else if (key === 'Escape') {
    clearCalc();

  // Backspace = DEL
  } else if (key === 'Backspace') {
    deleteLast();
  }

  // Briefly highlight the matching on-screen key for visual feedback
  highlightKey(key);
});

// highlightKey() — briefly flashes the corresponding on-screen key
function highlightKey(key) {
  var map = {
    '0': 'key0', '1': 'key1', '2': 'key2', '3': 'key3',
    '4': 'key4', '5': 'key5', '6': 'key6', '7': 'key7',
    '8': 'key8', '9': 'key9',
    '+': 'keyAdd', '-': 'keySub', '*': 'keyMul', '/': 'keyDiv',
    '.': 'keyDot', 'Enter': 'keyEquals', '=': 'keyEquals',
    'Escape': 'keyAC', 'Backspace': 'keyDEL'
  };

  var id = map[key];
  if (!id) return;

  var el = document.getElementById(id);
  if (!el) return;

  el.style.filter = 'brightness(1.4)';
  setTimeout(function() { el.style.filter = ''; }, 120);
}
