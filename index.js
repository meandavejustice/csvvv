var csv = require('csv-parser');
var fs = require('fs');

var openfile = './csv/sample.csv';
var thead = document.querySelector('thead');
var tbody = document.querySelector('tbody');
var saved = true;
var saveIndicator = document.querySelector('.save-ind');
var tabindex = 0; // int to inc for setting tabindex on tds

document.getElementById('files').addEventListener('change', handleFileSelect);
document.getElementById('save').addEventListener('click', writeData);

var data = {
    head: [],
    body: []
};

function genHead(labels) {
  var header = document.createElement('tr');

  labels.forEach(function(label) {
    var th = document.createElement('th');
    th.textContent = label + ':';
    th.scope = "col";
    header.appendChild(th);

    data.head.push(label);
  });

  // empty table
  thead.innerHTML = tbody.innerHTML = '';

  thead.appendChild(header);
}

function setUnsaved() {
  saveIndicator.textContent = '*';
  saved = false;
}

function addRow(object, idx) {
  var tr = document.createElement('tr');

  Object.keys(object).forEach(function(key, inneridx) {
    var td = document.createElement('td');
    td.textContent = object[key];
    td.setAttribute("tabindex", tabindex++);
    td.setAttribute("contentEditable", true);

    td.setAttribute("data-matrix", idx +'-' + inneridx);

    // store initial cell body content
    if (!data.body[idx]) {
      data.body[idx] = [object[key]];
    } else {
      data.body[idx][inneridx] = object[key];
    }

    td.addEventListener('input', onInput);

    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}

function onInput(ev) {
  if (saved) setUnsaved();

  var matrix = ev.target.getAttribute('data-matrix').split('-');
  data.body[matrix[0]][matrix[1]] = ev.target.textContent;

  // console.log('CHANGE:',
  //             ev.target.textContent,
  //             ev.target.getAttribute('data-matrix'));
}

function handleFileSelect(ev) {
  openfile = ev.target.files[0].path; // get filepath
  var head = false;
  var idx = 0;

  fs.createReadStream(openfile).pipe(csv())
  .on('data', function(data) {
    if (!head) {
      genHead(Object.keys(data));
      head = !head;
    }

    addRow(data, idx++);
  });
}

function writeData() {
  var nl = '\n';
  var writeStream = fs.createWriteStream(openfile)
  writeStream.write(data.head.join(',') + nl);

  Object.keys(data.body).forEach(function(key) {
    writeStream.write(data.body[key].join(',') + nl);
  });
  saved = true;
  saveIndicator.textContent = '';
}

// load our dummy data
handleFileSelect({target: {files: [{path: openfile}]}});