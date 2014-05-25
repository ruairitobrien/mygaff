/* global angular, StatusBar */

angular.module('mygaff', [
    'ionic', 'lodash',
    'mygaff.constants',
    'mygaff.property.controllers', 'mygaff.property.services', 'mygaff.property.models',
    'mygaff.business.controllers', 'mygaff.business.services', 'mygaff.business.models',
    'mygaff.gallery.controllers', 'mygaff.gallery.services',
    'mygaff.testData'
])

    .run(function ($ionicPlatform) {
        'use strict';
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleBlackOpaque();
            }

            $("img").error(function(){
                $(this).hide();
            });

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
                templateUrl: 'templates/home.html'
            })

            .state('app.property-listing', {
                url: '/property-listing',
                parent: "app",
                templateUrl: 'templates/propertyListing.html',
                controller: 'PropertyListingCtrl'

            })

            .state('app.business-listing', {
                url: '/business-listing',
                parent: "app",
                templateUrl: 'templates/businessListing.html',
                controller: 'BusinessListingCtrl'

            })

            .state('app.property', {
                url: '/property',
                parent: "app",
                templateUrl: 'templates/property.html',
                controller: 'PropertyCtrl'
            })

            .state('app.business', {
                url: '/business',
                parent: "app",
                templateUrl: 'templates/business.html',
                controller: 'BusinessCtrl'
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

    })

    .factory('SearchDataService', function ($http, _, LOCATIONS, BEDROOMS, PRICES, PROPERTY_LISTING_TYPES, BUSINESS_CATEGORIES) {
        "use strict";

        var sortedCounties = LOCATIONS.counties.sort(function compare(a, b) {
            var countyA = a.Location.toUpperCase();
            var countyB = b.Location.toUpperCase();
            return (countyA < countyB) ? -1 : (countyA > countyB) ? 1 : 0;
        });

        var getCounties = function () {
            return sortedCounties;
        };

        var getBedrooms = function () {
            return BEDROOMS;
        };

        var getPrices = function () {
            return PRICES;
        };

        var getPropertyListingTypes = function () {
            return PROPERTY_LISTING_TYPES;
        };

        var getBusinessCategories = function () {
            return BUSINESS_CATEGORIES;
        };

        var getCountyAreas = function (county) {
            return _.filter(LOCATIONS.areas, { 'Parent': county.id });
        };

        return {
            getCounties: getCounties,
            getCountyAreas: getCountyAreas,
            getBedrooms: getBedrooms,
            getPrices: getPrices,
            getPropertyListingTypes: getPropertyListingTypes,
            getBusinessCategories: getBusinessCategories
        };

    })
    .directive('hideOnErr', function() {
        'use strict';
        // Helper directive to hide images that 404
        return {
            link: function(scope, element) {
                element.bind('error', function() {
                    element.hide();
                });
            }
        };
    });

