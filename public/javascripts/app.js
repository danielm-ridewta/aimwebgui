
var workspace = new AIMServer(serverURL);
var init = false;

// Only run get if the screen is active, every X milliseconds
//            milli * seconds * minutes
workspace.refreshTimer = 1000 * 60 * 60;


// CustomEvent polyfill, see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
(function () {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    console.log(CustomEvent);
    console.log(typeof CustomEvent);
    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();


workspace.emitEvent = function (type, detail) {
    var event = new CustomEvent(type, {
        "detail": detail
    });
    dispatchEvent(event);
};

workspace.running = true;  // Do not change

// This code was added to only process workspace.get requests when the page is visible
workspace.handleVisibilityChange = function () {
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    console.log("hidden = " + hidden + "; visibilityChange = " + visibilityChange);

    workspace.PAUSED = "PAUSED";
    workspace.RESUMED = "RESUMED";

    workspace.pause = function () {
        workspace.running = false;
        console.log("workspace.PAUSED");
        workspace.emitEvent(workspace.PAUSED, workspace.running);
    }

    workspace.resume = function () {
        workspace.running = true;
        console.log("workspace.RESUMED");
        workspace.emitEvent(workspace.RESUMED, workspace.running);
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || typeof document.hidden === "undefined") {
        console.log("This requires a browser, such as IE 10+, Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
        // Handle page visibility change
        // If the page is hidden, pause the workspace;
        // if the page is shown, resume the workspace
        document.addEventListener(visibilityChange, function () {
            if (document[hidden]) {
                workspace.pause();
            } else {
                workspace.resume();
            }
        }, false);
    }
}

workspace.getReceiverByID = function (receiverId) {
    return workspace.receivers.find(function (rx) {
        return rx.d_id === receiverId;
    });
}

workspace.getChannelsByName = function (channelName) {
    return workspace.channels.find(function (channel) {
        return channel.c_name === channelName;
    });
}

//wasnt working so i wrote around it, dont need this anymore
workspace.swap = function (receiverOneId, receiverTwoId) {
    // Get the current channel of each receiver and change the channel on each

    if (workspace.receivers.length > 0) {
        // We actually have some receivers
        var receiverOneChannelId = workspace.getChannelsByName(workspace.getReceiverByID(receiverOneId).c_name).c_id;
        var receiverTwoChannelId = workspace.getChannelsByName(workspace.getReceiverByID(receiverTwoId).c_name).c_id;

        workspace.changeChannel(receiverOneId, receiverTwoChannelId);
        workspace.changeChannel(receiverTwoId, receiverOneChannelId);
    }
}

workspace.changeChannel = async function (receiverId, channelId, isSwap) {
    // Change the channel of a specific receiver
    await workspace.connect_channel(null, null, channelId, receiverId, null, null);
    // Emit channelChanged event, after we have refreshed lists
    if (!isSwap) {
        await workspace.get();
    }
};

workspace.changePreset = function (presetId) {
    // Change to a preset
    for (var i = 0; i < presets.length; i++) {
        if (presetId == presets[i].cp_id) {
            preset = presets[i];
        }
    }
    workspace.connect_preset(null, null, presetId, null, 1, async function () {
        // Emit channelChanged event, after we have refreshed lists
        await workspace.get();
        workspace.emitEvent(workspace.CHANNELCHANGED, true);
    });
}

workspace.LOADED = "LOADED";

workspace.load = function (username, password, callback) {
    callback = (typeof callback === 'function') ? callback : function () { };

    // Setup handling of page visibility
    workspace.handleVisibilityChange();

    // Login
    workspace.login(username, password, null, async function (success) {
        if (success) {
            // Setup polling and/or listeners
            // Pull down list of recievers, channels and presets

            // TODO: refresh of get disabled for testing, do we even need a periodic refresh? 5-11-2018
            // setInterval(workspace.runGet, workspace.refreshTimer);

            await workspace.get();
            if (success) {
                workspace.emitEvent(workspace.LOADED, channels);
            }
            callback(success);
        } else {
            console.log("Error with login");
            // TODO, what else should happen here
            callback(success);
        }
    });

}

workspace.CHANNELSLISTREADY = "CHANNELSLISTREADY";
workspace.PRESETSLISTREADY = "PRESETSLISTREADY";
workspace.RECEIVERLISTREADY = "RECEIVERLISTREADY";
workspace.GETTING = "GETTING"

workspace.runGet = async function (callback) {
    callback = (typeof callback === 'function') ? callback : function () { };
    if (workspace.running) {
        await workspace.get();
        callback();
    }
}

workspace.get = async function () {
    workspace.emitEvent(workspace.GETTING, true);
    let channels;
    let presets;
    let devices;
    // Emit channelsReady with array of channels
    const getChannelsResponse = await workspace.get_channels(null, null, null, null, null, null, null, null, null);
    if (getChannelsResponse.success) {
        const channels = getChannelsResponse.channels;
        workspace.channels = channels;
        workspace.emitEvent(workspace.CHANNELSLISTREADY, channels);
    } else {
        console.log("Error with get_channels");
    }

    // Emit presetsReady with array of presets
    const getPresetsResponse = await workspace.get_presets(null, null, null, null);
    if (getPresetsResponse.success) {
        const presets = getPresetsResponse.presets;
        workspace.presets = presets;
        workspace.emitEvent(workspace.PRESETSLISTREADY, presets);
    } else {
        console.log("Error with get_presets");
    }

    // Emit receiversReady with array of receivers
    const getDevicesResponse = await workspace.get_devices(null, null, 'rx', null, null, null, null, null, null, null, null, null);
    if (getDevicesResponse.success) {
        // TODO Add channel details
        // workspace.getChannelsByName(receiver.c_name)
        const devices = getDevicesResponse.devices;
        devices.forEach(function callback(receiver, index, array) {
            receiver.channel = workspace.getChannelsByName(receiver.c_name);
        });
        workspace.receivers = devices;
        workspace.emitEvent(workspace.RECEIVERLISTREADY, devices);
    } else {
        console.log("Error with get_devices");
    }

    return { channels, presets, devices };
}

// Note, this just update the global variables.  Prior to the event being called,
// the workspace.channels, workspace.presets, workspace.recivers is updated too.

addEventListener(workspace.CHANNELSLISTREADY, function (e) {
    channels = e.detail;
    if (init) {
        updateChannels();
    } else {
        initCheck();
    }
});

addEventListener(workspace.PRESETSLISTREADY, function (e) {
    presets = e.detail;
    if (init) {
        updatePresets();
    } else {
        initCheck();
    }
});

addEventListener(workspace.RECEIVERLISTREADY, function (e) {
    receivers = e.detail;
    if (init) {
        updateMonitors();
    } else {
        initCheck();
    }
});

function initCheck() {
    if (channels && presets && receivers && !init) {
        init = true;
        initPage();
    }
}

// Login

var userId = getUrlParams().id;
if (userId === undefined) {
    userId = "d1"
}

var userPassword = getUrlParams().password;
if (userPassword === undefined) {
    userPassword = ""
}

workspace.load(userId, userPassword);

function getUrlParams(url) {
    // https://www.sitepoint.com/get-url-parameters-with-javascript/

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName.toLowerCase();
            // paramValue = paramValue.toLowerCase();

            // if parameter name already exists
            if (obj[paramName]) {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined') {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                // if array index number specified...
                else {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            }
            // if param name doesn't exist yet, set it
            else {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
}

