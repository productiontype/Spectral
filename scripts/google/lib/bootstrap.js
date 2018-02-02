define([
    './setup'
], function(
    setup
) {
    'use strict';
    require.config(setup);

    require.config({
        paths: {
            'specimenTools': '.'
        }
    });

    return require;
});
