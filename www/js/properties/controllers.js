/* global angular, alert */

angular.module('mygaff.property.controllers', ['ui.bootstrap'])

    .controller('PropertyListingCtrl', function ($scope, $state, $stateParams, $ionicLoading, $ionicPopup, PropertyListingService, PropertyListings, PROPERTIES_RESPONSE) {
        'use strict';

        var moreDataCanBeLoaded = true;

        $scope.moreDataCanBeLoaded = function () {
            // TODO: Can I check if no more data is available?
            return moreDataCanBeLoaded;
        };

        /**
         * Called when a property is clicked on. Simply sets the property to be shown when the property pages is navigated to.
         *
         * @param property
         */
        $scope.showProperty = function (property) {
            PropertyListings.setCurrentProperty(property);
        };

        /**
         * Loads the next few properties to scope using the start parameter sent back in API response
         */
        $scope.nextPage = function () {
            PropertyListingService.nextListingsPage(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    $scope.properties = PropertyListings.getCurrentList();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            });
        };

        /**
         * Used by the pull down refresh to load properties again
         */
        $scope.doRefresh = function () {
            PropertyListingService.fetchLatestListings(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error refreshing listings',
                        template: err.message
                    });
                } else {
                    $scope.properties = PropertyListings.getCurrentList();
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        };


        /**
         * Called when page first loads
         */
        if (PropertyListings.getCurrentList() && (PropertyListings.getCurrentList().length > 0)) {
            $scope.properties = PropertyListings.getCurrentList();
        } else {
            $scope.properties = PROPERTIES_RESPONSE.properties;
            /**
            PropertyListingService.fetchLatestListings(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error retrieving listings',
                        template: err.message
                    });
                    $state.go('app.home');

                } else {
                    $scope.properties = PropertyListings.getCurrentList();
                }
            });*/
        }
    })

    .controller('PropertyCtrl', function ($scope, $sce, PropertyListings, Gallery) {
        'use strict';
        $scope.property = PropertyListings.currentProperty;

        Gallery.setImages($scope.property.images);

        $scope.renderHtml = function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    })

    .controller('PropertySearchCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, SearchDataService, PropertyListingService) {
        'use strict';

        // Initialize scope with constants for form fields
        $scope.counties = SearchDataService.getCounties();
        $scope.areas = SearchDataService.getCountyAreas($scope.counties[0]);
        $scope.bedrooms = SearchDataService.getBedrooms();
        $scope.prices = SearchDataService.getPrices();
        $scope.listingTypes = SearchDataService.getPropertyListingTypes();

        $scope.searchForm = {
            county: $scope.counties[0],
            location: $scope.areas[0],
            bedsFrom: $scope.bedrooms[0],
            bedsTo: $scope.bedrooms[3],
            priceFrom: $scope.prices[1],
            priceTo: $scope.prices[3],
            listingType: $scope.listingTypes[0]
        };


        $scope.updateAreas = function (county) {
            $scope.areas = SearchDataService.getCountyAreas(county);
            $scope.searchForm.location = $scope.areas[0];
        };

        $scope.search = function () {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchParams = {
                state: $scope.searchForm.county.id,
                location: ($scope.searchForm.location) ? $scope.searchForm.location.id : '',
                bedsFrom: ($scope.searchForm.bedsFrom) ? $scope.searchForm.bedsFrom.amount : 0,
                bedsTo: ($scope.searchForm.bedsTo) ? $scope.searchForm.bedsTo.amount : 99,
                priceFrom: ($scope.searchForm.priceFrom) ? $scope.searchForm.priceFrom.price : 0,
                priceTo: ($scope.searchForm.priceTo) ? $scope.searchForm.priceTo.price : 999999999,
                listingType: $scope.searchForm.listingType || 'Sales',
                start: 0
            };

            PropertyListingService.searchListings(searchParams, function (err) {
                $ionicLoading.hide();
                if (err) {
                    if (err.type && err.type === 'no results') {
                        $ionicPopup.alert({
                            title: 'No Results',
                            template: 'Please try different search criteria'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Error Searching Properties',
                            template: err.message
                        });
                    }
                } else {
                    $state.go('app.property-listing');
                }
            });
        };
    });