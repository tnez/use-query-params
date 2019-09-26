"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var serialize_query_params_1 = require("serialize-query-params");
var QueryParamProvider_1 = require("./QueryParamProvider");
var updateUrlQuery_1 = require("./updateUrlQuery");
/**
 * Given a query param name and query parameter configuration ({ encode, decode })
 * return the decoded value and a setter for updating it.
 *
 * The setter takes two arguments (newValue, updateType) where updateType
 * is one of 'replace' | 'replaceIn' | 'push' | 'pushIn', defaulting to
 * 'replaceIn'.
 *
 * You may optionally pass in a rawQuery object, otherwise the query is derived
 * from the location available in the QueryParamContext.
 *
 * D = decoded type
 * D2 = return value from decode (typically same as D)
 */
exports.useQueryParam = function (name, paramConfig, rawQuery) {
    if (paramConfig === void 0) { paramConfig = serialize_query_params_1.StringParam; }
    var _a = React.useContext(QueryParamProvider_1.QueryParamContext), history = _a.history, location = _a.location;
    if (!rawQuery) {
        rawQuery = React.useMemo(function () {
            var pathname = {};
            // handle checking SSR (#13)
            if (typeof location === 'object') {
                // in browser
                if (typeof window !== 'undefined') {
                    pathname = serialize_query_params_1.parse(location.search);
                }
                else {
                    // not in browser
                    pathname = serialize_query_params_1.parseUrl(location.pathname).query;
                }
            }
            return pathname || {};
        }, [location.search, location.pathname]);
    }
    // read in the encoded string value
    var encodedValue = rawQuery[name];
    // decode if the encoded value has changed, otherwise
    // re-use memoized value
    var decodedValue = React.useMemo(function () {
        if (encodedValue == null) {
            return undefined;
        }
        return paramConfig.decode(encodedValue);
        // note that we use the stringified encoded value since the encoded
        // value may be an array that is recreated if a different query param
        // changes.
    }, [
        encodedValue instanceof Array
            ? serialize_query_params_1.stringify({ name: encodedValue })
            : encodedValue,
    ]);
    // create the setter, memoizing via useCallback
    var setValue = React.useCallback(function (newValue, updateType) {
        var _a;
        var newEncodedValue = paramConfig.encode(newValue);
        updateUrlQuery_1.updateUrlQuery((_a = {}, _a[name] = newEncodedValue, _a), location, history, updateType);
    }, [location]);
    return [decodedValue, setValue];
};
