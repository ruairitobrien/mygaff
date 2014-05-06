/* global angular, StatusBar */

angular.module('mygaff', ['ionic', 'lodash', 'mygaff.constants', 'mygaff.controllers', 'mygaff.services', 'mygaff.models', 'mygaff.testData'])

    .run(function ($ionicPlatform) {
        'use strict';
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleBlackOpaque();
            }
        });
    })

    .config(function ($compileProvider) {
        'use strict';
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    })

    .config(function ($httpProvider) {
        'use strict';
        $httpProvider.defaults.timeout = 10000;
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/app.html'

            })

            .state('app.home', {
                url: '/home',
                parent: 'app',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'

            })

            .state('app.listing', {
                url: '/listing',
                parent: "app",
                templateUrl: 'templates/listing.html',
                controller: 'ListingCtrl'

            })

            .state('app.property', {
                url: '/property',
                parent: "app",
                templateUrl: 'templates/property.html',
                controller: 'PropertyCtrl'
            })

            .state('app.gallery', {
                url: '/gallery',
                parent: "app",
                templateUrl: 'templates/gallery.html',
                controller: 'GalleryCtrl'
            })

            .state('app.propertySearch', {
                url: '/property-search',
                parent: "app",
                templateUrl: 'templates/propertySearch.html',
                controller: 'PropertySearchCtrl'

            })

            .state('app.businessSearch', {
                url: '/business-search',
                parent: "app",
                templateUrl: 'templates/businessSearch.html',
                controller: 'BusinessSearchCtrl'

            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

    });

