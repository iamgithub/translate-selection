(function() {
var Langs = {
  "Autodetect": "auto",
  "Afrikaans": "af",
  "Albanian":	"sq",
  "Arabic": "ar",
  "Azerbaijani": "az",
  "Basque": "eu",
  "Bengali": "bn",
  "Belarusian":	"be",
  "Bulgarian":	"bg",
  "Catalan": "ca",
  "Chinese Simp.": "zh-CN",
  "Chinese Trad.": "zh-TW",
  "Croatian": "hr",
  "Czech": "cs",
  "Danish": "da",
  "Dutch": "nl",
  "English": "en",
  "Esperanto": "eo",
  "Estonian": "et",
  "Filipino":	"tl",
  "Finnish": "fi",
  "French":	"fr",
  "Galician":	"gl",
  "Georgian":	"ka",
  "German": "de",
  "Greek": "el",
  "Gujarati":	"gu",
  "Haitian Creole":	"ht",
  "Hebrew": "iw",
  "Hindi": "hi",
  "Hungarian":	"hu",
  "Icelandic": "is",
  "Indonesian":	"id",
  "Irish": "ga",
  "Italian": "it",
  "Japanese":	"ja",
  "Kannada": "kn",
  "Korean":	"ko",
  "Latin": "la",
  "Latvian": "lv",
  "Lithuanian":	"lt",
  "Macedonian":	"mk",
  "Malay": "ms",
  "Maltese": "mt",
  "Norwegian": "no",
  "Persian": "fa",
  "Polish":	"pl",
  "Portuguese":	"pt",
  "Romanian":	"ro",
  "Russian": "ru",
  "Serbian": "sr",
  "Slovak":	"sk",
  "Slovenian": "sl",
  "Spanish": "es",
  "Swahili": "sw",
  "Swedish": "sv",
  "Tamil": "ta",
  "Telugu":	"te",
  "Thai":	"th",
  "Turkish": "tr",
  "Ukrainian": "uk",
  "Urdu":	"ur",
  "Vietnamese":	"vi",
  "Welsh": "cy",
  "Yiddish": "yi"
};

var HoldKeys = {
  "Shift": 16,
  "Ctrl": 17
};

/*Fill i18n strings*/
var title = document.querySelector('title');
title.textContent = chrome.i18n.getMessage('pop_title');
var trkeyl = document.querySelector('label[for="translate-key"]');
trkeyl.innerHTML = chrome.i18n.getMessage('tr_key_label');
var ttsl = document.querySelector('label[for="tts-key"]');
ttsl.innerHTML = chrome.i18n.getMessage('tts_key_label');
var resl =  document.querySelector('label[for="resize-hold-key"]');
resl.innerHTML = chrome.i18n.getMessage('resize_key_label');
var frel = document.querySelector('label[for="freeze-hold-key"]');
frel.innerHTML = chrome.i18n.getMessage('freeze_key_label');
var srcl = document.querySelector('label[for="source-language"]');
srcl.innerHTML = chrome.i18n.getMessage('src_lang_label');
var trl = document.querySelector('label[for="target-language"]');
trl.innerHTML = chrome.i18n.getMessage('tr_lang_label');
var reset = document.querySelector('#reset');
reset.textContent = chrome.i18n.getMessage('reset_button');

/*Fill in form elements options*/
/*Source language options*/
var srclanghtml = '';
for (var s in Langs) {
  srclanghtml += '<option value="' + Langs[s] + '">' + s + '</option>';
}
document.getElementById('source-language').innerHTML = srclanghtml;

/*Target language options*/
var trlanghtml = '';
for (var t in Langs) {
  trlanghtml += '<option value="' + Langs[t] + '">' + t + '</option>';
}
document.getElementById('target-language').innerHTML = trlanghtml;

/*Resize and freeze popup keys fill*/
var resizehtml = '';
var freezehtml = '';
for (var rf in HoldKeys) {
  resizehtml += '<option value="' + HoldKeys[rf] + '">' + rf + '</option>';
  freezehtml += '<option value="' + HoldKeys[rf] + '">' + rf + '</option>';
}
document.getElementById('resize-hold-key').innerHTML = resizehtml;
document.getElementById('freeze-hold-key').innerHTML = freezehtml;

/*Get and save options to Local Storage*/
var Storage = function() {};

Storage.prototype.validchar = function(c) {
  if ( c.match(/^[a-zA-Z]$/g) ) {
    return true;
  } else {
    return false;
  }
};

Storage.prototype.validopt = function(opt, optobj) {
  if (opt in optobj) {
    return true;
  } else {
    return false;
  }
};

Storage.prototype.save = function() {
  var errors = [];
  /*Validate function for characters*/
  var validchar = function(c) {
    if ( c.toString().match(/^[a-zA-Z]$/g) ) {
      return true;
    } else {
      return false;
    }
  };
  /*Validate function for selected options*/
  var validopt = function(opt, optobj) {
    if (opt in optobj) {
      return true;
    } else {
      return false;
    }
  };
  /*Validate non-diffrend options*/
  var validdiff = function(obj) {
    /*Corection Ctrl/Shift - prevent select same selection and same keys*/
    if (obj['freeze-hold-key'][1] === obj['resize-hold-key'][1]) {
      errors.push(chrome.i18n.getMessage('freeze_res_same_key_err'));
    } else if (obj['translate-key'][1] === obj['tts-key'][1]) {
      errors.push(chrome.i18n.getMessage('srclkey_trlkey_same_err'));
    }
  };
  /*save keys (keyCodes) and language options*/
  var saveopts = {
    options: {}
  };
  /*validate and save text inputs*/
  var inputs = Array.prototype.slice.call(document.querySelectorAll('input'));
  var self = this;
  inputs.forEach(function(e) {
    if (validchar(e.value)) {
      saveopts.options[e.id] = [e.value.toUpperCase(), e.value.toUpperCase().charCodeAt()];
    } else {
      errors.push(chrome.i18n.getMessage('invalid_key_er') + e.value);
    }
  });
  /*validate and save select inputs*/
  var selects = Array.prototype.slice.call(document.querySelectorAll('select'));
  var optobject; //Langs or HoldKeys
  selects.forEach(function(o) {
    if (o.id === 'source-language' || o.id === 'target-language') {
      optobject = Langs;
    } else if (o.id === 'resize-hold-key' || o.id === 'freeze-hold-key') {
      optobject = HoldKeys;
    }
    var selindex = o.selectedIndex;
    var selopt = o.options[selindex];
    if (validopt(selopt.textContent, optobject)) {
      saveopts.options[o.id] = [selopt.textContent, parseInt(selopt.value, 10) || selopt.value];
    } else {
      errors.push(chrome.i18n.getMessage('invalid_option_err') + selopt.textContent);
    }
  });
  validdiff(saveopts.options);
  if(errors.length === 0) {
    chrome.storage.local.set(saveopts, function() {
      msg.style.color = 'green';
      msg.textContent = chrome.i18n.getMessage('options_saved');
    });
  } else {
    msg.style.color = 'red';
    msg.textContent = errors.join(' ');
  }
};

Storage.prototype.load = function() {
  chrome.storage.local.get('options', function(o) {
    var msg = document.getElementById('msg');
    if (Object.keys(o).length === 0) {
      msg.style.color = 'red';
      msg.textContent = chrome.i18n.getMessage('first_browse_err');
      return false;
    }
    var options = o.options;
    /*load opts to text inputs*/
    var inputs = Array.prototype.slice.call(document.querySelectorAll('input'));
    inputs.forEach(function(e,i,a) {
      e.value = options[e.id][0];
    });
    /*Find child sel and setelements*/
    var selects = Array.prototype.slice.call(document.querySelectorAll('select'));
    selects.forEach(function(e,i,a) {
      var selector = '[value="' + options[e.id][1] + '"]';
      var option = e.querySelectorAll(selector)[0];
      option.selected = true;
    }); 
    msg.style.color = 'green';
    msg.textContent = chrome.i18n.getMessage('options_loaded');
  });
};

Storage.prototype.reseting = function(e) {
  var msg = document.getElementById('msg');
  chrome.storage.local.clear();
  msg.style.color = 'green';
  msg.textContent = chrome.i18n.getMessage('options_reseted');
}

/*Main program...*/
var storage = new Storage();
storage.load(); /*Load default or saved options*/
document.querySelector('form').onchange = storage.save;
document.getElementById('reset').onmousedown = storage.reseting;
}) ();
