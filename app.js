const CFonts = require('cfonts');
const chalk = require('chalk');
const centerAlign = require('center-align');
const signale = require("signale");
require('./nfcReader'); 

// Display "TCNHS" in 3D text
CFonts.say('TCNHS', {
  font: '3d',     
  align: 'center',   
  colors: ['blue', '#f61cb9', '#1c92f6'], 
  background: 'transparent',  
  letterSpacing: 1, 
  lineHeight: 1,    
  space: false,
  maxLength: '0'     
});

const names = 'Ricky Rodrigo, Henry Haranay. 2024';
const centeredNames = centerAlign(names, process.stdout.columns);
console.log(chalk.black(centeredNames));

const text = 'NFC - RFID System';
const centeredText = centerAlign(text, process.stdout.columns);
const borderLength = centeredText.length; // Adjust for padding
const border = centerAlign('*'.repeat(borderLength - 60), process.stdout.columns);
console.log(chalk.black(centeredText));
console.log('\n' + chalk.black(border));

const rfidStartedText = 'RFID Scanner System Started';

signale.log('\n');
signale.success(rfidStartedText);