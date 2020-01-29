/*
    Options API
*/

var optionsManager = {
    defaultOptions: {},

    save: function(options) {
        for (var key in options) {
            localStorage[key] = options[key];
        }
    },

    load: function() {
        var options = this.shallowClone(this.defaultOptions);
        for (var key in options) {
            options[key] = localStorage[key] !== undefined ? localStorage[key] : options[key];
        }
        return options;
    },

    shallowClone: function(obj) {
        var clone = {};
        for (var key in obj) {
            clone[key] = obj[key];
        }
        return clone;
    },
}