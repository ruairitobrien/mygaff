/* global angular */

angular.module('mygaff.property.services', [])

    .factory('PropertyListingService', function ($http, _, Property, PropertyListings, SERVER) {
        'use strict';

        /**
         * Parameters used to search for latest property listings
         *
         * @type {{state: number, location: number, bedsFrom: number, bedsTo: number, priceFrom: number, priceTo: number, listingType: string, start: number}}
         */
        var defaultPropertyParams = {
            state: 1,
            location: 1,
            bedsFrom: 3,
            bedsTo: 4,
            priceFrom: 50000,
            priceTo: 300000,
            listingType: 'Sales',
            start: 0
        };

        /**
         * Current parameters for searching. These are dynamic and used to allow paging.
         * Some default values are in place originally to keep jshint happy but should never really be used.
         */
        var activeSearchParams;


        /**
         * Self explanatory really. Will handle most number formats including ones that are already formatted.
         * The output is for euros only
         *
         * @param price
         * @returns {string}
         */
        var formatPrice = function (price) {
            try {
                var formattedPrice = price.toString();
                formattedPrice = formattedPrice.replace('€', '');
                formattedPrice = formattedPrice.replace(',', '');

                var unit = formattedPrice.split('.')[0];
                var cents = (formattedPrice.split('.')[1] || '') + '00';
                unit = unit.split('').reverse().join('')
                    .replace(/(\d{3}(?!$))/g, '$1,')
                    .split('').reverse().join('');
                return '€' + unit;
            } catch (err) {
                console.log(err);
            }
            return price;
        };

        /**
         * Prepend the site URL to images as the app is not in the mygaff site domain.
         *
         * @param property
         * @returns {*}
         */
        var prependRootUrlToImageUrl = function (property) {
            if(property.thumbnail.slice(0, SERVER.resourceRootUrl.length) === SERVER.resourceRootUrl) {
                property.thumbnail = SERVER.resourceRootUrl + property.thumbnail;
            }
            if(property.images) {
                _.forEach(property.images, function (image, index) {
                    if(image.slice(0, SERVER.resourceRootUrl.length) === SERVER.resourceRootUrl) {
                        property.images[index] = SERVER.resourceRootUrl + image;
                    }
                });
            }
            return property;
        };


        /**
         * Fixes property image URLs and formats prices.
         *
         * @param property
         * @returns {*}
         */
        var updatePropertyValues = function (property) {
            try {
                property.price = formatPrice(property.price);
            } catch (err) {
                console.log(err);
            }
            return property;
        };


        var fetchLatestListings = function (next) {
            if (activeSearchParams) {
                activeSearchParams.start = 0;
                searchListings(activeSearchParams, next);
            } else {
                searchListings(defaultPropertyParams, next);
            }
        };

        var nextListingsPage = function (next) {
            try {
                if(activeSearchParams) {
                    var originalList = PropertyListings.getCurrentList();

                    searchListings(activeSearchParams, function (err) {
                        if(err) {
                            return next(err);
                        }
                        PropertyListings.setCurrentList(_.union(originalList, PropertyListings.getCurrentList()));
                        next();
                    });
                } else {
                    next(new Error('Invalid search parameters'));
                }

            } catch (err) {
                next(err);
            }
        };

        var searchListings = function (params, next) {
            try {
                activeSearchParams = {}; // extend doesn't work on undefined
                jQuery.extend(activeSearchParams, params);
                $http(
                    {
                        method: 'GET',
                        url: SERVER.rootUrl + '/mapi/',
                        params: activeSearchParams
                    }).success(function (data) {
                        if (data && data.properties) {
                            var formattedProperties = Property.apiResponseTransformer(data.properties).map(updatePropertyValues).filter(Boolean);
                            PropertyListings.setCurrentList(formattedProperties);
                            activeSearchParams.start = data.start;
                            next();
                        } else {
                            var err = new Error('No data found');
                            err.type = 'no results';
                            next(err);
                        }
                    }).
                    error(function () {
                        var err = new Error('Error fetching properties');
                        next(err);
                    });
            } catch(err) {
                next(err);
            }
        };

        return {
            fetchLatestListings: fetchLatestListings,
            nextListingsPage: nextListingsPage,
            searchListings: searchListings
        };

    })

    .service('PropertyListings', function () {
        'use strict';

        this.setCurrentProperty = function (property) {
            this.currentProperty = property;
        };

        this.getCurrentList = function () {
               return this.properties;
        };

        this.setCurrentList = function (list) {
            this.properties = list;
        };

        return this;
    });

