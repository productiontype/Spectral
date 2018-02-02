define([
], function(
) {
    'use strict';

    /**
     * FilesDrop provides a drop zone and on-click-upload interface for
     * files.
     *
     * The `handleFiles` argument is a function with the argument: aFileList
     * where FileList is a https://developer.mozilla.org/en-US/docs/Web/API/FileList
     *
     * If `handleFiles.needsPubSub` is truish, the function is called with
     * the arguments: pubsub, aFileList
     *
     * The function `loadFontsFromFileInput` of the `loadFonts` is made as
     * a `handleFiles` function for this case, also with needsPubSub = true.
     */
    function FilesDrop(container, pubSub, handleFiles) {
        this._container = container;
        this._pubSub = pubSub;
        this._makeFileInput(
            handleFiles.needsPubSub
                    ? handleFiles.bind(null, this._pubSub)
                    : handleFiles
            , container);
    }

    var _p = FilesDrop.prototype;

    _p._makeFileInput = function (handleFiles, element) {
        var hiddenFileInput = element.ownerDocument.createElement('input');
        hiddenFileInput.setAttribute('type', 'file');
        hiddenFileInput.setAttribute('multiple', 'multiple');
        hiddenFileInput.style.display = 'none'; // can be hidden, no problem

        // for the file dialogue
        function fileInputChange(e) {
            /*jshint validthis:true, unused:vars*/
            handleFiles(this.files);
        }
        function forwardClick(e) {
            /*jshint unused:vars*/
            // forward the click => opens the file dialogue
            hiddenFileInput.click();
        }

        // for drag and drop
        function noAction(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        }

        hiddenFileInput.addEventListener('change', fileInputChange);
        element.addEventListener('click', forwardClick);
        element.addEventListener('dragenter', noAction);
        element.addEventListener('dragover', noAction);
        element.addEventListener('drop', drop);
    };

    return FilesDrop;
});
