/* global angular */

angular.module('mygaff.services', [])

    .factory('ListingService', function ($http, _, Property, Listings, SERVER, LISTING_TYPES, PROPERTIES_RESPONSE) {
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
         * Parameters used to search for latest business listings
         *
         * @type {{state: number, location: number, bedsFrom: number, bedsTo: number, priceFrom: number, priceTo: number, listingType: string, start: number}}
         */
        var defaultBusinessParams = {
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
         *
         * @type {{state: number, location: number, bedsFrom: number, bedsTo: number, priceFrom: number, priceTo: number, listingType: string, start: number}}
         */
        var activeSearchParams = {
            state: 1,
            location: 1,
            bedsFrom: 1,
            bedsTo: 4,
            priceFrom: 50000,
            priceTo: 300000,
            listingType: 'Sales',
            start: 0
        };


        /**
         * Self explanatory really. Will handle most number formats including ones that are already formatted.
         * The output is for euros only
         *
         * @param price
         * @returns {string}
         */
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
            property.price = formatPrice(property.price);
            return property;
        };


        var fetchLatestListings = function (next) {
            if (Listings.currentListing === LISTING_TYPES.properties) {
                searchListings(defaultPropertyParams, next);
            } else if (Listings.currentListing === LISTING_TYPES.businesses) {
                searchListings(defaultBusinessParams, next);
            } else if (Listings.currentListing === LISTING_TYPES.results) {
                if (activeSearchParams) {
                    activeSearchParams.start = 0;
                    searchListings(activeSearchParams, next);
                } else {
                    searchListings(defaultPropertyParams, next);
                }
            }
        };

        var nextListingsPage = function (next) {
            var originalList = Listings.getCurrentList();

            searchListings(activeSearchParams, function (err) {
                if(err) {
                    return next(err);
                }
                Listings.setCurrentList(_.union(originalList, Listings.getCurrentList()));
                next();
            });
        };

        var searchListings = function (params, next) {
            jQuery.extend(activeSearchParams, params);

           // Listings.setCurrentList(PROPERTIES_RESPONSE.properties);
           // return next();

            $http(
                {
                    method: 'GET',
                    url: SERVER.rootUrl + '/mapi/',
                    params: activeSearchParams
                }).success(function (data) {
                    if (data && data.properties) {
                        var formattedProperties = Property.apiResponseTransformer(data.properties).map(updatePropertyValues).filter(Boolean);
                        Listings.setCurrentList(formattedProperties);
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

    .service('Listings', function (LISTING_TYPES) {
        'use strict';
        this.setCurrentListingType = function (listing) {
            this.currentListing = listing;
        };

        this.setCurrentProperty = function (property) {
            this.currentProperty = property;
        };

        this.getCurrentList = function () {
           if (this.currentListing === LISTING_TYPES.properties) {
               return this.properties;
           } else if (this.currentListing === LISTING_TYPES.businesses) {
               return this.businesses;
           } else if (this.currentListing === LISTING_TYPES.results) {
               return this.results;
           }
        };

        this.setCurrentList = function (list) {
            if (this.currentListing === LISTING_TYPES.properties) {
                this.setPropertyList(list);
            } else if (this.currentListing === LISTING_TYPES.businesses) {
                this.setBusinessList(list);
            } else if (this.currentListing === LISTING_TYPES.results) {
                this.setResultList(list);
            }
        };

        this.setPropertyList = function (properties) {
            this.properties = properties;
        };
        this.setBusinessList = function (businesses) {
            this.businesses = businesses;
        };
        this.setResultList = function (results) {
            this.results = results;
        };

        return this;
    })

    .factory('SearchService', function ($http, _, LOCATIONS, BEDROOMS, PRICES, PROPERTY_LISTING_TYPES, BUSINESS_CATEGORIES) {
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

;

