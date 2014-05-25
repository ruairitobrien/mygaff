/* global angular */

angular.module('mygaff.business.services', [])

    .factory('BusinessListingService', function ($http, _, Business, BusinessListings, SERVER) {
        'use strict';

        /**
         * Parameters used to search for latest business listings
         *
         * @type {{state: number, location: number, category: number, subcategory: string, start: number}}
         */
        var defaultBusinessParams = {
            state: 1,
            location: 1,
            category: 31,
            subcategory: '',
            start: 0
        };

        /**
         * Current parameters for searching. These are dynamic and used to allow paging.
         * Some default values are in place originally to keep jshint happy but should never really be used.
         */
        var activeSearchParams = {};


        /**
         * Prepend the site URL to thumbnails as the app is not in the mygaff site domain.
         *
         * @param property
         * @returns {*}
         */
        var prependRootUrlToThumbnailUrl = function (property) {
            property.thumbnail = SERVER.resourceRootUrl + property.thumbnail;
            return property;
        };

        /**
         * Fixes property image URLs and formats prices.
         *
         * @param property
         * @returns {*}
         */
        var updatePropertyValues = function (property) {
            prependRootUrlToThumbnailUrl(property);
            return property;
        };


        var fetchLatestListings = function (next) {
            if (activeSearchParams) {
                activeSearchParams.start = 0;
                searchListings(activeSearchParams, next);
            } else {
                searchListings(defaultBusinessParams, next);
            }
        };

        var nextListingsPage = function (next) {
            var originalList = BusinessListings.getCurrentList();

            searchListings(activeSearchParams, function (err) {
                if (err) {
                    return next(err);
                }
                BusinessListings.setCurrentList(_.union(originalList, BusinessListings.getCurrentList()));
                next();
            });
        };

        var searchListings = function (params, next) {
            jQuery.extend(activeSearchParams, params);

            $http(
                {
                    method: 'GET',
                    url: SERVER.rootUrl + '/mapi/',
                    params: activeSearchParams
                }).success(function (data) {
                    if (data && data.properties) {
                        var formattedProperties = Business.apiResponseTransformer(data.properties).map(updatePropertyValues).filter(Boolean);
                        BusinessListings.setCurrentList(formattedProperties);
                        activeSearchParams.start = data.start;
                        next();
                    } else {
                        next(new Error('Not data found'));
                    }
                }).
                error(function () {
                    var err = new Error('Error fetching properties');
                    next(err);
                });
        };

        return {
            fetchLatestListings: fetchLatestListings,
            nextListingsPage: nextListingsPage,
            searchListings: searchListings
        };

    })

    .service('BusinessListings', function () {
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
