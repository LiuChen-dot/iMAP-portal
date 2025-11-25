"use strict";

/// Copyright (C) 2023-2024 by SRI International.  All rights reserved.
function FetchJSON(url, hdr, body) {
    var args = {
        method: "GET"
    };
    if (body) {
        args.method = "POST";
        args.body = body;
    }
    if (hdr) {
        args.headers = hdr;
    };
    //console.log(url, args);

    return fetch(url, args)
        .then(function (response) {
            if (!response.ok) {
                const message = url + " " + response.status;
                console.log(message);
                return null;
            }
            return response.json();
        })
        .catch(function (err) {
            console.log('err', err, url);
            return null;
        });
}

function FetchFile(url) {
    return fetch(url)
        .then(function (response) {
            if (!response.ok) {
                const message = url + " " + response.status;
                console.log(message);
                return null;
            }
            return response.text();
        })
        .catch(function (err) {
            console.log('err', err, url);
            return null;
        });
}

//请求流数据
async function FetchCSV(url, delim) {
    var response = await fetch(url);
    if (!response.ok) {
        const message = url + " " + response.status;

        return null;
        //throw new Error(message);
    }
    var csv = await response.text();
    //console.log(csv.length, url);
    if (!csv)
        return null;

    return ParseCSV(csv, delim);
}


//处理流数据
function ParseCSV(csv, delim) {
    if (!delim)
        delim = ',';

    //unescape embedded \n \t \r
    /*
    csv = csv.split('"');
    for(var r = 1; r < csv.length; r+= 2) {
	csv[r] = csv[r].replace(/\n/g, ' ');
	csv[r] = csv[r].replace(/\t/g, ' ');
    }
    csv = csv.join(" ");
    */

    csv = csv.replace(/\r/g, '');
    csv = csv.split('\n');
    var csv_ = [];
    for (var r = 0; r < csv.length; r++) {
        if (csv[r][0] != '#')
            csv_.push(csv[r]);
    }
    csv = csv_;

    for (var r = 0; r < csv.length; r++)
        csv[r] = csv[r].split(delim);

    return csv;
}

function SaveJSON(obj, filename, pretty) {
    var json = pretty ? JSON.stringify(obj, 2, 2) : JSON.stringify(obj);

    var blob = new Blob([json], {
        type: 'application/octet-stream'
    });

    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
}

function SaveFile(obj, filename) {

    var blob = new Blob([obj], {
        type: 'application/octet-stream'
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
}

function SaveCSV(csv, csvfile, delim) {
    if (!delim)
        delim = ',';
    for (var r in csv)
        csv[r] = csv[r].join(delim);
    csv = csv.join("\n");
    SaveFile(csv, csvfile);
}

function StopEvent(evt) {
    if (!evt.cancelable) {
        return false;
    }

    if (evt.preventDefault != undefined)
        evt.preventDefault();

    if (evt.stopPropagation != undefined)
        evt.stopPropagation();

    return false;
}

function name2key(name) {
    //var key = name.replace(/ |\/|'|`|-|_|\.|\&|\(|\)/g, '').toLowerCase();
    var key = name.replace(/[\W_]+/g, "").toLowerCase();

    return key;
}

function DT(t0) {
    return parseInt(performance.now() - t0);
}

function HIDE(dom) {
    dom.classList.add("hide");
}

function SHOW(dom) {
    dom.classList.remove("hide");
}

function HIDDEN(dom) {
    dom.classList.add("hidden");
}

function VISIBLE(dom) {
    dom.classList.remove("hidden");
}

function DevicePixelRatio(ctx) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    var ratio = devicePixelRatio / backingStoreRatio;

    return ratio;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function OnLazyScroll(evt) {
    let scroller = evt.target;
    let table = null;
    let tables = scroller.querySelectorAll("table");
    for (let t of tables) {
        if (!t.classList.contains("hide")) {
            table = t;
            break;
        }
    }

    if (!table || !table.nhidden) {
        return;
    }

    if (scroller.scrollHeight - scroller.scrollTop < window.innerHeight) {
        if (document.body.classList.contains("touch"))
            LazyScroll(table, 50);
        else
            LazyScroll(table, 200);
    }
}

function LazyScroll(table, newrows, rowSpan) {
    let odd = 0
    if (!rowSpan)
        rowSpan = 1;

    table.classList.add('hide');

    if (!table.nvisible)
        table.nvisible = 0;
    if (!table.nhidden)
        table.nhidden = 0;

    var maxrows = table.nvisible + newrows;
    table.nvisible = 0;
    table.nhidden = 0;
    for (var r = 1; r < table.rows.length; r++) {
        var tr = table.rows[r];
        tr.classList.add('hide');
        if (tr.ignore || tr.hide)
            continue;

        if (table.nvisible >= maxrows) {
            table.nhidden++;
        } else {
            tr.classList.remove('hide');
            table.nvisible++;
            if (odd & rowSpan) {
                tr.classList.add('odd');
                tr.classList.remove('even');
            } else {
                tr.classList.remove('odd');
                tr.classList.add('even');
            }
            odd++;
        }
    }

    table.classList.remove('hide');

    //console.log('lazy', 'dr', newrows, 'mr', maxrows, 'v', table.nvisible, 'h', table.nhidden, 'r', table.rows.length);
}

//opens a url with default browser key modifier operations.
//ie. on Mac a Command-click opens a url in another tab but remaining on current tab

//点击模块触发事件
function OpenLink(evt, url, name) {
    let doc = parent != window.self ? parent.document : document;
    let a = doc.createElement("a");
    a.addEventListener("click", function (event) {
        sessionStorage.setItem('SearchValue',name)
        window.open(`/Search`)
    });
    let fakeEvt = new MouseEvent("click")
    a.dispatchEvent(fakeEvt);

}

//@license textAngular
//Author : Austin Anderson
//License : 2013 MIT
//Version 1.5.16
// turn html into pure text that shows visiblity
function stripHtmlToText(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    var res = tmp.textContent || tmp.innerText || '';
    res.replace('\u200B', ''); // zero width space
    res = res.trim();
    return res;
}