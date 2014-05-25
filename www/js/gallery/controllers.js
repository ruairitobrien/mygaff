/* global angular */

angular.module('mygaff.gallery.controllers', ['ui.bootstrap'])

    .controller('GalleryCtrl', function ($scope, Gallery) {
        'use strict';

        $scope.images = Gallery.getImages();
    });