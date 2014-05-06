/* global angular */
angular.module('mygaff.models', [])

    .factory('Property', function () {
        'use strict';

        /**
         * Constructor, with class name
         */
        function Property(id, address, content, countyId, county, listingType, locationId, location, price, priceType, thumbnail, bedrooms) {
            this.id = id;
            this.address = address;
            this.content = content;
            this.countyId = countyId;
            this.county = county;
            this.listingType = listingType;
            this.locationId = locationId;
            this.location = location;
            this.price = price;
            this.priceType = priceType;
            this.thumbnail = thumbnail;
            this.bedrooms = bedrooms;
        }

        Property.build = function (data) {
            return new Property(
                data.id,
                data.address,
                data.content,
                data.countyId,
                data.county,
                data.listingType,
                data.locationId,
                data.location,
                data.price,
                data.priceType,
                data.thumbnail,
                data.bedrooms
            );
        };

        Property.apiResponseTransformer = function (responseData) {
            if (angular.isArray(responseData)) {
                return responseData
                    .map(Property.build)
                    .filter(Boolean);
            }
            return Property.build(responseData);
        };

        /**
         * Return the constructor function
         */
        return Property;
    });