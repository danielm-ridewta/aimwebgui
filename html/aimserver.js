var aimURL = "/api/?";

var lastResp = null;  // for client side debug
var lastReqURL = null // for client side debug
var lastReq = null;   // for client side debug

https://github.com/abdmob/x2js
var x2jsObj = new X2JS();


var server = new Object();

// Initial properties
server.defaultVersion = 4;
server.loginSuccess = 0;
server.token = "";
server.lastTimestamp = null;
server.last_api_response = null;

server.requestFactory = function (method, version, token, params, api_response_callback) {
    version = (version == null) ? server.defaultVersion : version;
    token = (token == null) ? server.token : token;
    params = (params == null) ? new Object() : params;

    var req = new XMLHttpRequest;
    lastReq = req;
    req.overrideMimeType("text/xml");

    // FOR DEBUG
    req.addEventListener("load", function(){document.getElementById("output").value = this.responseText;});

    // Handle results
    if (typeof api_response_callback === 'function') {
        req.addEventListener("load", function() {
            lastResp = this;
            var xmlDoc = this.responseXML;
            var api_response = x2jsObj.xml2json(lastResp.responseXML).api_response
            api_response.success = parseInt(api_response.success);
            api_response.version = parseInt(api_response.version);
            api_response.timestamp = Date.parse(api_response.timestamp);
            server.last_api_response = api_response;
            server.lastTimestamp = api_response.timestamp;
            api_response_callback(api_response);
        });
    }

    // Common parameters
    var _params = {
        'method': method,
        'v': version.toString(),
    };

    // All but login need a token
    if (method != "login") {
        _params.token = token;
    }

    // Remove nulls
    for (var propName in params) { 
        if (params[propName] === null ||params[propName] === undefined) {
            delete params[propName];
        }
    }

    // https://github.com/stretchr/arg.js
    var url = Arg.url(aimURL, Object.assign({}, _params, params));

    lastReqURL = url;
    req.open("GET", url);
    return req;
}

server.login = function (username, password, version = 4, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};
    var params = {};

    var req = this.requestFactory("login", version, token, params, function(api_response){
        server.loginSuccess = api_response.success;
        server.token = "";

        if (api_response.success == 1) {
            server.token = api_response.token;
            callback(api_response.success, api_response.version, api_response.timestamp, null, api_response.token);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }    
    });

    req.send();
}

server.logout = function (token, version, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {};

    var req = this.requestFactory("logout", version, token, params, function(api_response) {
        if (api_response.success == 1) {
            server.loginSuccess = 0;
            server.token = "";
            callback(api_response.success, api_response.version, api_response.timestamp, null);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    });

    req.send();
}

server.get_devices = function (token, version, page, results_per_page, device_type, filter_d_name, filter_d_description, filter_d_location, sort, sort_dir, status, show_all, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'device_type': device_type,
        'filter_d_name': filter_d_name,
        'filter_d_description': filter_d_description,
        'filter_d_location': filter_d_location,
        'sort': sort,
        'sort_dir': sort_dir,
        'status': status,
        'show_all': show_all,
        'page': page,
        'results_per_page': results_per_page
    };

    var req = this.requestFactory("get_devices", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.page), parseInt(api_response.results_per_page), parseInt(api_response.total_devices), parseInt(api_response.count_devices), api_response.devices.device);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    })
    req.send();
}

server.get_channels = function(token, version, page, results_per_page, device_id, filter_c_name, filter_c_description, filter_c_location, filter_favourites, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'page': page,
        'results_per_page': results_per_page,
        'device_id': device_id,
        'filter_c_name': filter_c_name,
        'filter_c_description': filter_c_description,
        'filter_c_location': filter_c_location,
        'filter_favourites': filter_favourites
    }

    var req = this.requestFactory("get_channels", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.page), parseInt(api_response.results_per_page), parseInt(api_response.count_channels), api_response.channels.channel);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    })
    req.send();
}

server.get_presets = function(token, version, page, results_per_page, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'page': page,
        'results_per_page': results_per_page,
    }

    var req = this.requestFactory("get_presets", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.page), parseInt(api_response.results_per_page), parseInt(api_response.total_presets), parseInt(api_response.count_presets), api_response.connection_presets.connection_preset);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    });

    req.send();
}

server.connect_channel = function(token, version, c_id, rx_id, view_only, exclusive, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'c_id': c_id,
        'rx_id': rx_id,
        'view_only': view_only,
        'exclusive': exclusive
    }

    var req = this.requestFactory("connect_channel", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    });

    req.send();
}

server.connect_preset = function(token, version, id, view_only, exclusive, force, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'id': id,
        'view_only': view_only,
        'exclusive': exclusive,
        'force': force
    }

    var req = this.requestFactory("connect_preset", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    });

    req.send();
}

server.disconnect_channel = function(token, version, rx_id, force, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'rx_id': rx_id,
        'force': force
    }

    var req = this.requestFactory("disconnect_channel", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    });

    req.send();
}

server.connect_preset = function(token, version, id, force, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};

    var params = {
        'id': id,
        'force': force
    }

    var req = this.requestFactory("disconnect_preset", version, token, params, function(api_response) {
        if(api_response.success == 1) {
            callback(api_response.success, api_response.version, api_response.timestamp, null);
        } else {
            callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
        }
    });

    req.send();
}