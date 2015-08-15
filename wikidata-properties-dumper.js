#!/usr/bin/env node
'use strict';

var _ref = process.argv.slice(2);
var language = _ref[0];
var total = _ref[1];
var offset = _ref[2];
total || (total = 3000);
var limit = 50;
offset || (offset = 0);
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
    var args, missing, missingLang, result;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
    result = {};
    missing = [];
    missingLang = [];
    args.forEach(function (resp) {
        var enProp, entity, id, _ref1, _ref2, _ref3, _results;
        if (resp.body.warning != null) {
            console.log("Warning: " + resp.body.warning);
        }
        if (resp.body.entities != null) {
            _ref1 = resp.body.entities;
            _results = [];
            for (id in _ref1) {
                entity = _ref1[id];
                if (id[0] === '-') {
                    _results.push(missing.push(entity.id));
                } else {
                    if ((entity.labels != null) && (((_ref2 = entity.labels) != null ? _ref2[language] : void 0) != null)) {
                        _results.push(result[entity.labels[language].value.replace(/ |-|\//g, '_').replace(/\(|\)|,|\.|,|'|"/g, '')] = id.replace(/P/g, ''));
                    } else {
                        enProp = (_ref3 = entity.labels) != null ? _ref3.en.value : void 0;
                        if (enProp != null) {
                            missingLang.push([entity.id, enProp]);
                            _results.push(result[id] = enProp);
                        } else {
                            _results.push(missing.push(entity.id));
                        }
                    }
                }
            }
            return _results;
        }
    });
    return [result, missing, missingLang];
};

var buildBatchRequests = function () {
    var from, requests, to, _results;
    requests = [];
    from = 1 + offset;
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
    var missing, missingLang, result;
    result = outputs[0];
    missing = outputs[1];
    missingLang = outputs[2];
    writeProps(result, missing);
    return writeMissingLangProp(missingLang);
};

var writeProps = function (result, missing) {
    var json;
    json = JSON.stringify({
        properties: result,
        missing: missing
    }, null, 4);
    if (offset > 0) {
        return fs.writeFileSync("./properties-" + language + "-" + from + "-" + to + ".json", json);
    } else {
        return fs.writeFileSync("./outputs/properties-" + language + ".json", json);
    }
};

var writeMissingLangProp = function (missingLang) {
    var jsonLang;
    jsonLang = JSON.stringify({
        language: language,
        missing: missingLang
    }, null, 4);
    fs.writeFileSync("./outputs/missingLangProp-" + language + ".json", jsonLang);
};

dumpProperties();