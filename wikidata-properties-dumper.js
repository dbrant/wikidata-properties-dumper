#!/usr/bin/env node
'use strict';

var _ref = process.argv.slice(2);
var language = _ref[0];
language || (language = 'en');
var total = _ref[1];
total || (total = 2800);
var limit = 50;
var Q = require('q');
var qreq = require('qreq');
var fs = require('fs');

var dumpProperties = function () {
    var requests;
    requests = buildBatchRequests();
    return Q.all(requests).fail(function (err) {
        console.log("Error in buildBatchRequests: " + err);
    }).spread(parseWikidataResponses).fail(function (err) {
        console.log("Error in parseWikidataResponses: " + err);
    }).then(writeOutputs).fail(function (err) {
        console.log("Error in writeOutputs: " + err);
    });
};

var parseWikidataResponses = function () {
    var args, result, pVal;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
    result = [];
    args.forEach(function (resp) {
        var enProp, entity, id, _ref1, _ref2, _ref3, _results;
        if (resp.body.warning != null) {
            console.log("Warning: " + resp.body.warning);
        }
        if (resp.body.entities != null) {
            _ref1 = resp.body.entities;
            _results = [];
            for (id in _ref1) {
                pVal = parseInt(id.replace(/P/g, ''));
                entity = _ref1[id];
                if (id[0] === '-') {
                    result[pVal] = entity.id;
                    console.log(">>> missing: " + entity.id);
                } else {
                    if ((entity.labels != null) && (((_ref2 = entity.labels) != null ? _ref2[language] : void 0) != null)) {
                        //_results.push(result[entity.labels[language].value.replace(/ |-|–|\//g, '_').replace(/\(|\)|,|&|:|\.|,|'|"/g, '')] = id.replace(/P/g, ''));
                        //_results.push(result[entity.labels[language].value] = id.replace(/P/g, ''));
                        result[pVal] = entity.labels[language].value;
                    } else {
                        enProp = (_ref3 = entity.labels) != null ? _ref3.en.value : void 0;
                        if (enProp != null) {
                            result[pVal] = enProp;
                        } else {
                            result[pVal] = entity.id;
                        }
                    }
                }
            }
            _results.push(result);
            return _results;
        }
    });
    return [result];
};

var buildBatchRequests = function () {
    var from, requests, to, _results;
    requests = [];
    from = 1;
    to = Math.ceil(total / limit);
    (function () {
        _results = [];
        for (var _i = from; from <= to ? _i <= to : _i >= to; from <= to ? _i++ : _i--) {
            _results.push(_i);
        }
        return _results;
    }).apply(this).forEach(function (n) {
            var ids, _ref1, _results;
            ids = (function () {
                _results = [];
                for (var _i = _ref1 = n * limit - (limit - 1), _ref2 = n * limit; _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--) {
                    _results.push(_i);
                }
                return _results;
            }).apply(this).map(function (el) {
                    return 'P' + el;
                });
            return requests.push(wikidataGetEntities(ids));
        });
    return requests;
};

var wikidataGetEntities = function (ids, props, format) {
    var languages, pipedIds, pipedLanguages, pipedProps, query;
    if (props == null) {
        props = ['labels'];
    }
    if (format == null) {
        format = 'json';
    }
    languages = ['en'];
    if (language !== 'en') {
        languages.push(language);
    }
    pipedIds = ids.join('|');
    pipedLanguages = languages.join('|');
    pipedProps = props.join('|');
    query = "https://www.wikidata.org/w/api.php?action=wbgetentities&languages=" + pipedLanguages + "&format=" + format + "&props=" + pipedProps + "&ids=" + pipedIds;
    //console.log("Query: " + query);
    return qreq.get(query);
};

var writeOutputs = function (outputs) {
    var result = outputs[0];
    writeProps(result);
};

var writeProps = function (result) {
    var json;
    json = JSON.stringify({
        properties: result
    }, null, 4);

    writeJava(result);
    return fs.writeFileSync("./outputs/properties.json", json);
};

var writeJava = function (result) {
    var text, i;
    text = "package foo;\n\n";
    text += "public final class Properties {\n";
    for (i = 0; i < result.length; i++) {
        if (result[i] === undefined || result[i] === null) {
            continue;
        }
        text += "    public static final int ";
        text += result[i].toUpperCase().replace(/ |-|–|\//g, '_').replace(/\(|\)|,|&|:|\.|,|'|"/g, '').replace(/\+/g, 'PLUS');
        text += " = ";
        text += i;
        text += ";\n"
    }
    text += "}";
    fs.writeFileSync("./outputs/Properties.java", text);

    text = "package foo;\n\n";
    text += "public final class PropertyNames {\n";
    text += "    public static final String[] NAMES = {\n";
    for (i = 0; i < result.length; i++) {
        text += '        "';
        if (result[i] !== undefined && result[i] !== null) {
            text += result[i].replace(/"/g, '\\"');
        }
        text += '"';
        if (i < result.length - 1) {
            text += ","
        }
        text += "\n"
    }
    text += "    };\n}";
    fs.writeFileSync("./outputs/PropertyNames.java", text);
};

dumpProperties();