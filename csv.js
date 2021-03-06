/*

CSV Reader - Reads a CSV text string and also converts it into a 2D array of floats/integers/strings
Version: 3.5
Example:
[[row0],[row1],[row2],...] = CSV(text);
Usage: <script type="text/javascript" src="csv.js"></script>
var table = new CSV(text);
var element = table[3][2]; // element = row 3 column 2 (string/float/int)
CSV Specification: http://en.wikipedia.org/wiki/Comma-separated_values

TODO: add support for # comment lines (CSV spec?)
TODO: Add code to convert 10.0% to .1 (this code will convert $ to regular floats)
Tested with various Microsoft CSV Files with wierd "A""" and ","""
*/

function CSV(text, params){ // type is optional - useful for returning objects or speedup if you dont want to parse the numbers out

  var type = {object : false, // if true: [{row},{row},{row},{}] else [[row],[row],[row]] without object lebels
              parse : true // if true: parseFloat() and parseInt() are used otherwise TEXT
              };

  if(params) {
    type.object = params.object ? params.object != undefined : true;
    type.parse = params.parse ? params.parse != undefined : true;
  }
    
  this.csv = [];
  var header = true;
  
  var comma = ",;";
  var quote = "\"";
  var newline = "\n\r";

  var line = [];
  var element = "";
  var quoted = false;

  // BUG/TODO: add code to convert %
  var PARSE = function(str){
    if(type.parse){
      var value = str.replace(/[$% ,]/g, '');
      if(isNaN(value) || value == ""){ // is it not a number?
        return str;
      }
      else { // its a number...
        if(value.indexOf(".") >= 0) { // TODO/BUG: check for %
           return parseFloat(value); // replace floating point
        }
        else {
           return parseInt(value); // replace integers
        }
      }
    } 
    else { 
      return str;
    }
  };
  
  for (var i = 0; i < text.length; i++){
    if(text[i] == quote){
      if(!quoted) { // first quotation mark?
        quoted = true;
        element = ""; // just to be safe clear the element
      }
      else if (comma.indexOf(text[i+1]) >= 0) { // last quotation mark with a , or ; next?
        line.push(PARSE(element));
        i = i + 1; // dont add a , to the CSV skip it
        element = "";
        quoted = false;
      }
      else if (text[i+1] === quote){
        element += text[i+1]; // add a quote
        i = i + 1; // skip one " because in the CSV Standard "" = "
      }
      else if (newline.indexOf(text[i+1]) >= 0){
        line.push(PARSE(element));
        element = "";
        quoted = false; // reset the quote becuse it was the last quote
      }
      else { // Error Case
        element += text[i];
        quoted = false; // else do nothing ... element = element;
      }
    }
    else if(comma.indexOf(text[i]) >= 0){
      if(quoted) { // is the , inside a "" block?
        element += text[i];
      }
      else {
        line.push(PARSE(element));
        element = "";
      }
    }
    else if(newline.indexOf(text[i]) >= 0){
      if(quoted){ // if its inside a "" block always add the element
        element += text[i];
      }
      else {
        line.push(PARSE(element));
        element = ""; // clear the element and prep it for the next
        if(type.object == false) {
          this.csv.push(line);
        } 
        else { // push the object into the CSV
          if (header) {
            this.titles = line;
            header = false;
          }
          else { 
            var obj = {};
            for(var j = 0; j < line.length; j++) {
              obj[this.titles[j]] = line[j];
            }
            this.csv.push(obj);
          }
        }
        line = []; // clear the line and go to the next one
        if(newline.indexOf(text[i+1]) >= 0){
          i = i + 1; // skip one element because there are two carrage returns
        }
      }
    }
    else {
      element += text[i];
    }
  }
  return this.csv;
}
