// Template Changer v.2.0 - 2.3.09
;(function () {

  function ajax(startURL) {
    this.url = startURL;
    this.query = '';
    this.persistentQuery = '';
    this.content = '';
    this.POST = 0;
    this.GET = 1;
    this.requestType = this.GET;
    this.callbackFunction = function() {
      return true;
    }
    this.fallbackFunction = function() {
      if (window.console) console.error(this.error);
    }
    this.mime = 'text/html';
    this.error = '';
    this.newXMLRequestThread = function() {
      var xmlhttp = false;
      var i = this;
      if (!xmlhttp && (typeof XMLHttpRequest != 'undefined')) {
        xmlhttp = new XMLHttpRequest();
        if (xmlhttp.overrideMimeType)
          xmlhttp.overrideMimeType(i.mime);
      }
      return xmlhttp;
    }
    this.serverRequest = function(urlToGet) {
      var i = this;
      var j = i.newXMLRequestThread();
      var h = 'application/x-www-form-urlencoded';
      if (j) {
        if (i.requestType == i.POST) {
          j.open("post", urlToGet, true);
          j.setRequestHeader('Content-Type', h);
          j.setRequestHeader('Content-length', i.query.length);
          j.setRequestHeader('Connnection', 'close');
        } else {
          if (i.query.length)
            urlToGet += '?' + i.query;
          i.query = null;
          j.open("get", urlToGet, true);
        }
        j.onreadystatechange = function() {
          if (j.readyState == 4) {
            if (j.status == 200) {
              i.content = j.responseText;
              i.callbackFunction();
            } else {
              i.error = 'Server returned an error - the page may have been relocated or removed.';
              logFailed(i.yahooId, i.error);
              i.fallbackFunction();
            }
          }
        }
        j.send(i.query);
      } else {
        i.error = 'Unable to create HTTP request thread.';
        i.fallbackFunction();
      }
    }
    this.addQuery = function(name, value, persistent) {
      var a = persistent ? this.persistentQuery : this.query;
      if (a.length) a += '&';
      a += name + (value ? '=' + encodeURIComponent(value) : '');
      persistent ? this.persistentQuery = a : this.query = a;
    }
    this.init = function() {
      if (this.persistentQuery.length) {
        if (this.query.length) this.query += '&';
        this.query += this.persistentQuery;
      }
      this.serverRequest(this.url);
      this.query = '';
    }
  }

  function updateCounter() {
    with(document.getElementById('counter').getElementsByTagName('SPAN')[0])
    innerHTML = parseInt(innerHTML) + 1;
    currentID++;
    if (currentID < ids.length)
      changer(ids[currentID]);
  }

  function logFailed(failedID, errorMessage) {
    with(document.getElementById('logContainer').style) {
      if (display == 'none') {
        display = 'block';
        document.getElementById('container').style.top = '-270px';
      }
    }
    with(document.getElementById('log')) {
      var a = document.createElement('div');
      a.appendChild(document.createTextNode(failedID + (typeof errorMessage !== 'undefined' ? ': ' + errorMessage : '')));
      getElementsByTagName('B')[0].appendChild(a);
    }
    setTimeout(updateCounter, 5000);
  }
  var rxEditHref = new RegExp(/href="?([^"]*?)[" ][^>]*?Edit Properties/);
  var rxFormLoc = new RegExp(/action=http:\/\/[^\/]*?yahoo.(com|net)[^ "]*?\/([^\/]*?\/[^\/]*?)[ "\n]/);
  var rxQueryName = new RegExp(/Template.*?<input.*?name="?(.*?)[" \/]/);
  var rxVerificationCode = new RegExp(/FORM_TOP value=(.*?)>/);

  function changer(id) {
    var req = new ajax(id.toLowerCase() + '.html?dired=1');
    req.yahooId = id;
    req.callbackFunction = function() {
      var formLoc = this.content.match(rxFormLoc);
      if (formLoc) formLoc = formLoc[2];
      var queryName = this.content.match(rxQueryName);
      if (queryName) queryName = queryName[1];
      var verificationCode = this.content.match(rxVerificationCode);
      if (verificationCode) verificationCode = verificationCode[1];
      if (formLoc) {
        req.url = formLoc;
        req.addQuery(queryName, document.getElementById('templateName').value, false);
        req.addQuery('FORM_TOP', verificationCode, false);
        req.addQuery('FORM_BOT', verificationCode, false);
        req.requestType = req.POST;
        req.callbackFunction = function() {
          updateCounter();
          delete req;
        }
        req.init();
      } else {
        delete req;
        logFailed(id);
      }
    }
    req.init();
  }
  var ids, currentID, queuedRequests = 10;

  function startChanger() {
    if (document.getElementById('templateName').value) {
      ids = document.getElementById('pageToChange').value.split(/[\s,]+/);
      while (ids[ids.length - 1] == '') ids.pop();
      with(document.getElementById('counter')) {
        while (firstChild) removeChild(firstChild);
        var a = document.createElement('span');
        a.appendChild(document.createTextNode('0'));
        appendChild(a);
        appendChild(document.createTextNode(' of ' + ids.length));
      }
      for (currentID = 0, j = (ids.length < queuedRequests ? ids.length : queuedRequests); currentID < j; currentID++)
        changer(ids[currentID]);
      currentID--;
    } else alert('Please enter the new template name.');
    return false;
  }

  function fadeIn(id, delay) {
    with(document.getElementById(id).style)
    if (parseInt(opacity) < 1) {
      opacity = parseFloat(opacity) + .05;
      setTimeout("fadeIn('" + id + "', " + delay + ");", delay);
    }
  }

  function activate() {
    with(document.getElementsByTagName('BODY')[0]) {
      if (!document.getElementById('changer')) {
        with(style) {
          height = '100%';
          margin = '0';
          backgroundColor = '#ffffff';
        }
        var centered = document.createElement('DIV');
        with(centered.style) {
          height = width = '1px';
          position = 'absolute';
          top = left = '50%';
          fontSize = '14px';
          fontFamily = 'Trebuchet MS';
        }
        var a = document.createElement('DIV');
        a.id = 'logContainer';
        with(a.style) {
          position = 'absolute';
          width = '500px';
          height = '180px';
          left = '-250px';
          top = '60px';
          paddingTop = '35px';
          backgroundColor = '#000';
          color = '#FFF';
          border = '4px solid #000';
          display = 'none';
        }
        var b = document.createElement('DIV');
        b.id = 'log';
        b.appendChild(document.createTextNode('Failed at:'));
        b.appendChild(document.createElement('BR'));
        b.appendChild(document.createElement('B'));
        with(b.style) {
          margin = '10px';
          height = '160px';
          overflow = 'auto';
        }
        a.appendChild(b);
        centered.appendChild(a);
        var a = document.createElement('DIV');
        a.id = 'container';
        with(a.style) {
          position = 'absolute';
          width = '500px';
          height = '370px';
          left = '-250px';
          top = '-180px';
          backgroundColor = '#FFFFFF';
          border = '4px solid #000000';
        }
        b = document.getElementById('pageToChange');
        with(b.style) {
          width = '488px';
          height = '330px';
          backgroundColor = 'transparent';
          border = '0';
          marginTop = marginLeft = marginBottom = '4px';
          display = 'block';
          borderBottom = '3px solid #000';
        }
        a.appendChild(b);
        var b = document.createElement('IMG');
        b.src = 'https://raw.githubusercontent.com/twhitacre/template-changer/master/assets/template-monster.png';
        with(b.style) {
          width = '275px';
          height = '300px';
          position = 'absolute';
          top = '25px';
          left = '-300px';
        }
        a.appendChild(b);
        b = document.createElement('INPUT');
        b.type = 'submit';
        b.value = 'begin';
        with(b.style) {
          float = 'left';
          width = '50px';
          margin = '0 0 0 4px';
          border = '0';
          backgroundColor = '#000';
          fontFamily = 'Trebuchet MS';
          fontSize = '14px';
          height = '20px';
          color = '#fff';
        }
        b.onclick = function() {
          startChanger();
          fadeIn('counter', 30);
        }
        a.appendChild(b);
        b = document.createElement('INPUT');
        b.id = 'templateName';
        b.value = 'Put Your Template Name Here ( No Spaces )';
        with(b.style) {
          width = '434px';
          height = '16px';
          padding = '2px';
          border = '0';
          marginLeft = '4px';
          backgroundColor = 'transparent';
          fontFamily = 'Trebuchet MS';
          fontSize = '14px';
          opacity = '.5';
        }
        a.appendChild(b);
        b = document.createElement('DIV');
        b.id = 'counter';
        with(b.style) {
          position = 'absolute';
          backgroundColor = '#000';
          height = '50px';
          color = "#FFF";
          paddingLeft = paddingRight = '4em';
          left = '-220px';
          top = '315px';
          opacity = '0';
          lineHeight = '49px';
          whiteSpace = 'nowrap';
        }
        a.appendChild(b);
        centered.appendChild(a);
        appendChild(centered);
      }
    }
  }

  // Kick it off
  activate();


}());