/* global angular */

angular.module('mygaff.gallery.services', [])

    .service('Gallery', function () {
        'use strict';

        this.setImages = function (images) {
            this.images = images;
        };

        this.getImages = function () {
            return this.images;
        };

        return this;
    });