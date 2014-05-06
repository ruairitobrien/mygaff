/* global angular */

angular.module('mygaff.services', [])

    .factory('PropertyService', ['$http', 'Property', 'Listings', 'SERVER', function ($http, Property, Listings, SERVER) {
        'use strict';

        var formatPrice = function (price) {
            var formattedPrice = price.toString();
            formattedPrice = formattedPrice.replace('€', '');
            formattedPrice = formattedPrice.replace(',', '');

            var unit = formattedPrice.split('.')[0];
            var cents = (formattedPrice.split('.')[1] || '') + '00';
            unit = unit.split('').reverse().join('')
                .replace(/(\d{3}(?!$))/g, '$1,')
                .split('').reverse().join('');
            return '€' + unit;

        };

        var prependRootUrlToThumbnailUrl = function (property) {
            property.thumbnail = SERVER.resourceRootUrl + property.thumbnail;
            return property;
        };

        var updatePropertyValues = function (property) {
            prependRootUrlToThumbnailUrl(property);
            property.price = formatPrice(property.price);
            return property;
        };

        var fetchProperties = function (next) {            
            $http.get(SERVER.rootUrl + '/mapi/?bedsFrom=1&bedsTo=6&listingType=Sales&location=1&priceFrom=50000&priceTo=300000&start=0&state=1').
                success(function (data, status, headers, config) {
                    if (data && data.properties) {
                        Listings.setPropertyList(Property.apiResponseTransformer(data.properties).map(updatePropertyValues).filter(Boolean));
                        next();
                    } else {
                        next(new Error('Not data found'));
                    }
                }).
                error(function (data, status, headers, config) {
                    var err = new Error('Error fetching properties');
                    next(err);
                });
        };

        var fetchBusinesses = function (next) {
            $http.get(SERVER.rootUrl + '/mapi/?bedsFrom=1&bedsTo=6&listingType=Sales&location=1&priceFrom=50000&priceTo=300000&start=0&state=1').
                success(function (data, status, headers, config) {
                    if (data && data.properties) {
                        Listings.setBusinessList(Property.apiResponseTransformer(data.properties).map(updatePropertyValues).filter(Boolean));
                        next();
                    } else {
                        next(new Error('Not data found'));
                    }
                }).
                error(function (data, status, headers, config) {
                    var err = new Error('Error fetching properties');
                    next(err);
                });
        };

        return {
            fetchProperties: fetchProperties,
            fetchBusinesses: fetchBusinesses
        };

    }])
    .service('Listings', function () {
        'use strict';
        this.setCurrentListingType = function (listing) {
            this.currentListing = listing;
        };
        this.setCurrentProperty = function (property) {
            this.currentProperty = property;
        };
        this.setPropertyList = function (properties) {
            this.properties = properties;
        };
        this.setBusinessList = function (businesses) {
            this.businesses = businesses;
        };

        return this;
    })

    .factory('SearchService', ['LOCATIONS', '_', function (LOCATIONS, _) {
        "use strict";

        var sortedCounties = LOCATIONS.counties.sort(function compare(a, b) {
            var countyA = a.Location.toUpperCase();
            var countyB = b.Location.toUpperCase();
            return (countyA < countyB) ? -1 : (countyA > countyB) ? 1 : 0;
        });

        var getCounties = function(){
            return sortedCounties;
        };
        var getCountyAreas = function (county) {
            return _.filter(LOCATIONS.areas, { 'Parent': county.id });
        };

        return {
            getCounties: getCounties,
            getCountyAreas: getCountyAreas
        };

    }])

;

