const screen = document.querySelector(".screen");
const buttons = document.querySelector(".buttons");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let justCalculated = false;
let waitingForOperand = false;
let hasError = false;

function updateScreen() {
  if (hasError) {
    screen.textContent = "Error";
  } else if (pendingOperator !== null && storedValue !== null) {
    const expression = waitingForOperand
      ? `${storedValue} ${pendingOperator}`
      : `${storedValue} ${pendingOperator} ${currentValue}`;
    screen.textContent = expression;
  } else {
    screen.textContent = currentValue;
  }

  screen.scrollLeft = screen.scrollWidth;
}

function resetCalculator() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  justCalculated = false;
  waitingForOperand = false;
  hasError = false;
  updateScreen();
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    hasError = true;
    return "0";
  }

  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(10)));
}

function calculate(firstValue, secondValue, operator) {
  switch (operator) {
    case "+":
      return firstValue + secondValue;
    case "−":
      return firstValue - secondValue;
    case "×":
      return firstValue * secondValue;
    case "÷":
      return secondValue === 0 ? NaN : firstValue / secondValue;
    default:
      return secondValue;
  }
}

function buttonClick(value) {
  if (hasError && value !== "C") {
    return;
  }

  if (/^\d$/.test(value)) {
    handleNumber(value);
  } else {
    handleSymbol(value);
  }
  updateScreen();
}

function handleSymbol(symbol) {
  switch (symbol) {
    case "C":
      resetCalculator();
      break;
    case "=":
      if (pendingOperator !== null && storedValue !== null) {
        const result = calculate(
          storedValue,
          Number(currentValue),
          pendingOperator,
        );
        currentValue = formatResult(result);
        storedValue = null;
        pendingOperator = null;
        justCalculated = true;
        waitingForOperand = false;
      }
      break;
    case "←":
      currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
      break;
    case "+":
    case "−":
    case "×":
    case "÷":
      handleMath(symbol);
      break;
  }
}

function handleMath(symbol) {
  if (waitingForOperand) {
    pendingOperator = symbol;
    return;
  }

  const value = Number(currentValue);

  if (pendingOperator !== null && storedValue !== null) {
    const result = calculate(storedValue, value, pendingOperator);
    currentValue = formatResult(result);
    storedValue = hasError ? null : Number(currentValue);
  } else {
    storedValue = value;
  }

  pendingOperator = symbol;
  waitingForOperand = true;
  justCalculated = false;
}

function handleNumber(numberString) {
  if (waitingForOperand || justCalculated) {
    currentValue = numberString;
    waitingForOperand = false;
    justCalculated = false;
  } else if (currentValue === "0") {
    currentValue = numberString;
  } else {
    currentValue += numberString;
  }
}

function init() {
  buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (button) {
      buttonClick(button.textContent.trim());
    }
  });

  document.addEventListener("keydown", function (event) {
    const keyMap = {
      Enter: "=",
      Backspace: "←",
      Escape: "C",
      "*": "×",
      "/": "÷",
      "-": "−",
    };
    const value = keyMap[event.key] || event.key;
    if (
      /^\d$/.test(value) ||
      ["+", "−", "×", "÷", "=", "←", "C"].includes(value)
    ) {
      event.preventDefault();
      buttonClick(value);
    }
  });
}

init();
