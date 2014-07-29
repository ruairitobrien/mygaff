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
         */
        var activeSearchParams;


        /**
         * Prepend the site URL to images as the app is not in the mygaff site domain.
         *
         * @param business
         * @returns {*}
         */
        var prependRootUrlToImageUrl = function (business) {
            if (business.thumbnail.slice(0, SERVER.resourceRootUrl.length) !== SERVER.resourceRootUrl) {
                business.thumbnail = SERVER.resourceRootUrl + business.thumbnail;
            }
            if (business.images) {
                _.forEach(business.images, function (image, index) {
                    if (image.slice(0, SERVER.resourceRootUrl.length) !== SERVER.resourceRootUrl) {
                        business.images[index] = SERVER.resourceRootUrl + image;
                    }
                });
            }
            return business;
        };

        /**
         * Fixes property image URLs and formats prices.
         *
         * @param business
         * @returns {*}
         */
        var updateBusinessValues = function (business) {
            try {
                prependRootUrlToImageUrl(business);
            } catch (err) {
                console.log(err);
            }
            return business;
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
            try {
                if (activeSearchParams && (activeSearchParams.start !== '0')) {
                    var originalList = BusinessListings.getCurrentList();

                    searchListings(activeSearchParams, function (err) {
                        if (err) {
                            return next(err);
                        }

                        if(!originalList.equals(BusinessListings.getCurrentList())) {
                            BusinessListings.setCurrentList(_.union(originalList, BusinessListings.getCurrentList()));
                        }

                        next();
                    });
                } else {
                    if(activeSearchParams.start === '0') {
                        next();
                    } else {
                        next(new Error('Invalid search parameters'));
                    }
                }

            } catch (err) {
                next(err);
            }
        };

        var searchListings = function (params, next) {
            try {
                activeSearchParams = {};
                jQuery.extend(activeSearchParams, params);
                $http(
                    {
                        method: 'GET',
                        url: SERVER.rootUrl + '/mapibiz/',
                        params: activeSearchParams
                    }).success(function (data) {
                        if (data && data.listings) {
                            var formattedProperties = Business.apiResponseTransformer(data.listings).map(updateBusinessValues).filter(Boolean);
                            BusinessListings.setCurrentList(formattedProperties);
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
            } catch (err) {
                next(err);
            }
        };

        return {
            fetchLatestListings: fetchLatestListings,
            nextListingsPage: nextListingsPage,
            searchListings: searchListings
        };

    })

    .service('BusinessListings', function () {
        'use strict';

        this.setCurrentBusiness = function (business) {
            this.currentBusiness = business;
        };

        this.getCurrentList = function () {
            return this.businesses;
        };

        this.setCurrentList = function (list) {
            this.businesses = list;
        };

        return this;
    });
