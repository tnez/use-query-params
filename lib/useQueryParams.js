"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var serialize_query_params_1 = require("serialize-query-params");
var useQueryParam_1 = require("./useQueryParam");
var updateUrlQuery_1 = require("./updateUrlQuery");
var QueryParamProvider_1 = require("./QueryParamProvider");
/**
 * Given a query parameter configuration (mapping query param name to { encode, decode }),
 * return an object with the decoded values and a setter for updating them.
 */
exports.useQueryParams = function (paramConfigMap) {
    var _a = React.useContext(QueryParamProvider_1.QueryParamContext), history = _a.history, location = _a.location;
    // read in the raw query
    var rawQuery = React.useMemo(function () {
        var pathname = {};
        if (typeof location === 'object' && typeof window !== undefined) {
            pathname = serialize_query_params_1.parse(location.search);
        }
        else if (typeof location === 'object') {
            pathname = serialize_query_params_1.parseUrl(location.pathname);
        }
        return pathname;
    }, []);
    // parse each parameter via useQueryParam
    // we reuse the logic to not recreate objects
    var paramNames = Object.keys(paramConfigMap);
    var paramValues = paramNames.map(function (paramName) {
        return useQueryParam_1.useQueryParam(paramName, paramConfigMap[paramName], rawQuery)[0];
    });
    // we use a memo here to prevent recreating the containing decodedValues object
    // which would break === comparisons even if no values changed.
    var decodedValues = React.useMemo(function () {
        // iterate over the decoded values and build an object
        var decodedValues = {};
        for (var i = 0; i < paramNames.length; ++i) {
            decodedValues[paramNames[i]] = paramValues[i];
        }
        return decodedValues;
    }, paramValues);
    // create a setter for updating multiple query params at once
    var setQuery = React.useCallback(function (changes, updateType) {
        // encode as strings for the URL
        var encodedChanges = serialize_query_params_1.encodeQueryParams(paramConfigMap, changes);
        // update the URL
        updateUrlQuery_1.default(encodedChanges, location, history, updateType);
    }, [location]);
    // no longer Partial
    return [decodedValues, setQuery];
};
exports.default = exports.useQueryParams;
