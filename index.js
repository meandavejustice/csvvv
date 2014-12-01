/* global filterTable*/

var fs = require('fs');
var csv = require('csv-parser');

var thead = document.querySelector('thead');
var tbody = document.querySelector('tbody');
var table = document.querySelector('table');
var title = document.querySelector('.title');

var openfile = './csv/sample.csv';
var tabindex = 0; // int to inc for setting tabindex on tds
var saved = true;

document.getElementById('files').addEventListener('change', handleFileSelect);
document.getElementById('save').addEventListener('click', writeData);
document.querySelector('.search').addEventListener('keyup', function(ev) {
  filterTable(ev.target, table)
});
keymage('ctrl-s', writeData);
keymage('ctrl-up', up);
keymage('ctrl-down', down);

var data = {
    head: [],
    body: []
};

function genHead(labels) {
  var header = document.createElement('tr');

  // empty data obj
  data = {
    head: [],
    body: []
  };

  labels.forEach(function(label) {
    var th = document.createElement('th');
    th.textContent = label + ':';
    th.scope = "col";
    header.appendChild(th);

    data.head.push(label);
  });

  // empty table
  thead.innerHTML = '';
  tbody.innerHTML = '';

  thead.appendChild(header);
}

function setUnsaved() {
  title.classList.add('unsaved');
  saved = false;
}

function addRow(object, idx) {
  var tr = document.createElement('tr');

  tr.className = 'row';

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
}

function handleFileSelect(ev) {
  openfile = ev.target.files[0].path; // get filepath
  var head = false;
  var idx = 0;

  fs.createReadStream(openfile).pipe(csv())
  .on('data', function(dat) {
    if (!head) {
      genHead(Object.keys(dat));
      head = !head;
    }

    addRow(dat, idx++);
  });
}

function writeData() {
  var nl = '\n';
  var writeStream = fs.createWriteStream(openfile);
  writeStream.write(data.head.join(',') + nl);

  Object.keys(data.body).forEach(function(key) {
    writeStream.write(data.body[key].join(',') + nl);
  });

  writeStream.end();
  saved = true;
  title.classList.remove('unsaved');
}

function down() {
  document.activeElement.parentElement.nextSibling.querySelector('td').focus();
}

function up() {
  document.activeElement.parentElement.previousSibling.querySelector('td').focus();
}

// load our dummy data
handleFileSelect({target: {files: [{path: openfile}]}});