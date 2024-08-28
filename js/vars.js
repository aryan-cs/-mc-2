// canvas
var canvas;
const SCALE = 1.6;
const VARIABLE_SCALING = false;
const WIDTH = 1200, HEIGHT = 600;

function limit (value, min, max) { return Math.min(Math.max(value, min), max); }

window.addEventListener("resize", function (ignored) {

  if (VARIABLE_SCALING) { resizeCanvas(Math.floor(limit(window.innerWidth / SCALE, 1000, 1200)), Math.floor(limit(window.innerWidth / SCALE, 580, 610))); }

}, true);

// site
var title = "metropolis-hastings visualization";
var version = "version 1.0.1";

window.onload = function () { document.getElementById("title").innerHTML = title + "  <span style=\"font-size: 30px;\"> " + version + "<\span>"; }

function createCornerButton (buttonText, func) {

  var button = document.createElement("button");
  button.className = "action_button";
  button.id = buttonText.toLowerCase().split(' ').join('_');
  button.textContent = buttonText;

  document.getElementById("main").appendChild(button);

  document.getElementById(button.id).addEventListener("click", func);

  return button;

}

function inputButtonClicked () {

  var input = document.getElementById("inputField").value;
  var message = document.getElementById("result");

  // start here...

}

function cornerButtonClicked () {

  // start here...

}

// colors
const BACKGROUND_COLOR = getComputedStyle(document.querySelector(":root")).getPropertyValue("--background-color");
const ACCENT_1 = getComputedStyle(document.querySelector(":root")).getPropertyValue("--accent-1");
const ACCENT_2 = getComputedStyle(document.querySelector(":root")).getPropertyValue("--accent-2");

// other vars
// start here...