#!/usr/bin/env node
/**
 * Load Module Dependencies
 */
var fs = require('fs');

var keypress         = require('keypress');
var argv             = require('minimist')(process.argv.slice(2));
var clear            = require('clear');
var marked           = require('marked');
var TerminalRenderer = require('marked-terminal');
var padStdio         = require('pad-stdio');
var charm            = require('charm')(process.stdout);

if(!argv.slides) {
  console.log(' ');
  console.log('Usage:');
  console.log(' ');
  console.log('\ttermslide --slides=slide1.md slide2.md');
  console.log(' ');

  return;
}

marked.setOptions({
  renderer: new TerminalRenderer()
});

keypress(process.stdin);

var slides = [argv.slides].concat(argv._);
var buffer = [];
var currentSlide = 0;
var totalSlides;
var separator = /---/g;
var xLeft = 5;
var yTop = 2;

try{
  slides.forEach(function(slide) {
    var slideContent = fs.readFileSync(slide).toString().trim();
    var sections = slideContent.split(separator);

    buffer = buffer.concat(sections);
  });
} catch (ex) {
  return console.error(ex.message);
}

totalSlides = buffer.length;

clear();

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if(key) {
    if ((key.ctrl && key.name === 'c') || key.name === 'q') {
      process.stdin.pause();

    } else if(key.name === 'right') {
      if((currentSlide + 1) === totalSlides) {
        return;

      } else {
        clear();
        currentSlide += 1;

        return showSlide(currentSlide);

      }

    } else if(key.name === 'left') {
      if(currentSlide === 0) {
        return;

      } else {
        clear();
        currentSlide -= 1;

        return showSlide(currentSlide);
      }

    }
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

showSlide(currentSlide);

function showSlide(which) {
  var content = buffer[which];

  padStdio.stdout('              ');

  charm
    .reset()
    .position(1, yTop)
    .write(marked(content), xLeft)
    .position(xLeft, process.stdout.rows - 1);
}
