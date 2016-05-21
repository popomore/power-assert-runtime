'use strict';

var extend = require('xtend');
var ContextTraversal = require('power-assert-context-traversal');
var StringWriter = require('./string-writer');
var defaultOptions = require('./default-options');
var reduce = require('array-reduce');

/**
 * options.reducers [array]
 * options.renderers [array]
 * options.outputOffset [number]
 * options.lineSeparator [string]
 */
module.exports = function createFormatter (options) {
    var formatterConfig = extend(defaultOptions(), options);
    var reducers = formatterConfig.reducers || [];
    var rendererConfigs = formatterConfig.renderers;
    var len = rendererConfigs.length;

    return function (powerAssertContext) {
        var context = reduce(reducers, function (prevContext, reducer) {
            return reducer(prevContext);
        }, powerAssertContext);
        var traversal = new ContextTraversal(context);
        var writer = new StringWriter(formatterConfig);
        for (var i = 0; i < len; i += 1) {
            var RendererClass;
            var renderer;
            var config = rendererConfigs[i];
            if (typeof config === 'object') {
                RendererClass = config.ctor;
                renderer = new RendererClass(config.options);
            } else if (typeof config === 'function') {
                RendererClass = config;
                renderer = new RendererClass();
            }
            renderer.register(traversal);
            renderer.setDestination(writer);
        }
        traversal.traverse();
        writer.write('');
        return writer.toString();
    };
};
