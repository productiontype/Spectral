define([], function() {
    'use strict';

    /**
     * doc: a DOM document
     * factories: an array of arrays:
     *          [
     *              [
     *                  '.css-class-for-widget-container',
     *                  WidgetConstructor,
     *                  optional further WidgetConstructor_arguments
     *                  , ...
     *              ]
     *          ]
     *      A WidgetConstructor will be called essentially like this:
     *
     *      new WidgetConstructor(domContainer,
     *                            pubsub,
     *                            ..., further WidgetConstructor_arguments);
     */
    function initDocumentWidgets(doc, factories, pubsub) {
        var i, l, className, containersForClass, Constructor
         , j, ll, container
         , containers = []
         , args, instance
         ;
        for(i=0,l=factories.length;i<l;i++) {
            className = factories[i][0];
            containersForClass = doc.getElementsByClassName(className);
            if(!containersForClass.length)
                continue;
            Constructor = factories[i][1];
            for(j=0,ll=containersForClass.length;j<ll;j++) {
                container = containersForClass[j];
                containers.push(container);
                args = [container, pubsub];
                Array.prototype.push.apply(args, factories[i].slice(2));
                // this way we can call the Constructor with a
                // dynamic arguments list, i.e. by circumventing the `new`
                // keyword via Object.create.
                instance = Object.create(Constructor.prototype);
                Constructor.apply(instance, args);
            }
        }
        return containers;
    }

    return initDocumentWidgets;
});
