//#region DOM
const containerEl = document.querySelector(".container");
const colorPickerInputEl = document.querySelector(".color-picker > input[type='color']");
const gridSizeSliderEl = document.getElementById("gridSizeSlider");
const gridSizeEl = document.getElementById("gridSize");
const modeSelectors = document.querySelectorAll("button[data-mode]");
const clearButton = document.getElementById("clearButton");
//#endregion

class ColorSelector {
  _pickedColor = "#000000";
  _mode = "picked";

  pickColor = (color) => {
    const regex = /^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/;
    if (regex.test(color)) {
      this._pickedColor = color;
    }
  };

  getColor = (color) => {
    if (this._mode === "picked") {
      return this._pickedColor;
    } else if (this._mode === "random") {
      return `${this._getRandomColor()}`;
    } else if (this._mode === "erase") {
      return "#FFFFFF";
    } else if (this._mode === "darker") {
      return this._darker(this._hexToRgb(color));
    } else if (this._mode === "brighter") {
      return this._brighter(this._hexToRgb(color));
    }
  };

  mode = (value) => {
    this._mode = value;
  };

  _getRandomColor() {
    let result = "#";
    for (let i = 0; i < 3; i++) {
      result += Math.floor(Math.random() * 255)
        .toString(16)
        .padStart(2, "0");
    }
    return result;
  }

  _darker(rgbArray) {
    const color = [...rgbArray];
    for (let i = 0; i < color.length; i++) {
      color[i] -= 20;
      if (color[i] < 0) color[i] = 0;
    }
    let result = "#" + color.map((value) => value.toString(16).padStart(2, "0")).join("");
    return result;
  }

  _brighter(rgbArray) {
    const color = [...rgbArray];
    for (let i = 0; i < color.length; i++) {
      color[i] += 20;
      if (color[i] > 255) color[i] = 255;
    }
    let result = "#" + color.map((value) => value.toString(16).padStart(2, "0")).join("");
    return result;
  }

  _hexToRgb(hex) {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex.replace(/(.)/g, "$1$1");
    }
    const validHexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (!validHexRegex.test(hex)) {
      return [0, 0, 0];
    }
    const arr = hex.match(/[A-Fa-f0-9]{2}/g).map((value) => parseInt(value, 16));
    return arr;
  }
}

//#region Variables
const colorSelector = new ColorSelector();
let lastElement = null;
let gridSize = 16;
//#endregion

//#region Util
function initGrid() {
  containerEl.innerHTML = "";
  createGrid(gridSize);
}

function createGrid(num) {
  for (let i = 0; i < num * num; i++) {
    const div = document.createElement("div");
    div.style.width = 100 / num + "%";
    div.style.height = 100 / num + "%";
    div.style.userSelect = "none";
    containerEl.insertAdjacentElement("afterbegin", div);
  }
}

function initModeSelectors() {
  return (element) =>
    element.addEventListener("click", (event) => {
      if (!element.classList.contains("active")) {
        element.classList.add("active");
        colorSelector.mode(element.getAttribute("data-mode"));
        deactiveModeSelectorsButThis(element);
      }
    });
}

function deactiveModeSelectorsButThis(element) {
  modeSelectors.forEach((el) => {
    if (element !== el) {
      el.classList.remove("active");
    }
  });
}

function rgbToHex(color) {
  if (color) {
    color = color.replace("rgb(", "");
    color = color.replace(")", "");
    const splitted = color.split(",");
    const r = (+splitted[0].trim()).toString(16).padStart(2, "0");
    const g = (+splitted[1].trim()).toString(16).padStart(2, "0");
    const b = (+splitted[2].trim()).toString(16).padStart(2, "0");
    color = "#" + r + g + b;
  } else {
    color = "#FFFFFF";
  }
  return color;
}
//#endregion

//#region Event handlers
function mouseMoveHandler(event) {
  if (event.buttons === 1) {
    const element = event.target;
    if (element === lastElement) return;
    let color = rgbToHex(element.style.backgroundColor);
    const newColor = colorSelector.getColor(color);
    element.style.backgroundColor = newColor;
    lastElement = element;
  }
}

function colorChangeHandler(event) {
  colorSelector.pickColor(event.target.value);
}
//#endregion

//#region Event subscription
containerEl.addEventListener("mousemove", mouseMoveHandler);
containerEl.addEventListener("mousedown", mouseMoveHandler);
containerEl.addEventListener("mouseup", () => {
  lastElement = null;
});

colorPickerInputEl.addEventListener("change", colorChangeHandler);

gridSizeSliderEl.addEventListener("input", (event) => (gridSizeEl.textContent = event.target.value + " x " + event.target.value));
gridSizeSliderEl.addEventListener("change", (event) => {
  gridSize = event.target.value;
  initGrid();
});

clearButton.addEventListener("click", initGrid);
//#endregion

//#region Init app
modeSelectors.forEach(initModeSelectors());
initGrid();
//#endregion
