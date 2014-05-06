/* global angular, alert */

angular.module('mygaff.controllers', ['ui.bootstrap'])

    .controller('AppCtrl', function ($scope) {
        'use strict';
    })

    .controller('ContentController', function ($scope, $ionicSideMenuDelegate) {
        'use strict';
        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };
    })

    .controller('HomeCtrl', function ($scope, Listings) {
        'use strict';
        $scope.setCurrentListingType = function (listing) {
            Listings.setCurrentListingType(listing);
        };
    })

    .controller('ListingCtrl', function ($scope, $state, $stateParams, $ionicLoading, $ionicPopup, ListingService, Listings, LISTING_TYPES) {
        'use strict';

        $scope.currentListing = Listings.currentListing;

        $scope.search = (Listings.currentListing === LISTING_TYPES.properties) ? 'property-search' : 'business-search';

        $scope.moreDataCanBeLoaded = function () {
            // TODO: Can I check if no more data is available?
            return true;
        };

        $scope.showProperty = function (property) {
            Listings.setCurrentProperty(property);
        };

        $scope.nextPage = function () {
            ListingService.nextListingsPage(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error loading more listings',
                        template: err.message
                    });
                } else {
                    $scope.properties = Listings.getCurrentList();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            });
        };

        $scope.doRefresh = function () {
            ListingService.fetchLatestListings(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error refreshing listings',
                        template: err.message
                    });
                } else {
                    $scope.properties = Listings.getCurrentList();
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        if (Listings.getCurrentList() && (Listings.getCurrentList().length > 0)) {
            $scope.properties = Listings.getCurrentList();
        } else {
            ListingService.fetchLatestListings(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error retrieving listings',
                        template: err.message
                    });
                } else {
                    $scope.properties = Listings.getCurrentList();
                }
            });
        }

    })

    .controller('PropertyCtrl', function ($scope, $sce, Listings) {
        'use strict';
        $scope.property = Listings.currentProperty;

        $scope.renderHtml = function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    })

    .controller('GalleryCtrl', function ($scope) {
        'use strict';
    })

    .controller('PropertySearchCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, SearchService, Listings, ListingService, LISTING_TYPES) {
        'use strict';

        // Initialize scope with constants for form fields
        $scope.counties = SearchService.getCounties();
        $scope.areas = SearchService.getCountyAreas($scope.counties[0]);
        $scope.bedrooms = SearchService.getBedrooms();
        $scope.prices = SearchService.getPrices();
        $scope.listingTypes = SearchService.getPropertyListingTypes();

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
            $scope.areas = SearchService.getCountyAreas(county);
            $scope.searchForm.location = $scope.areas[0];
        };

        $scope.search = function () {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchParams = {
                county: $scope.searchForm.county.id,
                location: $scope.searchForm.location.id,
                bedsFrom: $scope.searchForm.bedsFrom,
                bedsTo: $scope.searchForm.bedsTo,
                priceFrom: $scope.searchForm.priceFrom.price,
                priceTo: $scope.searchForm.priceTo.price,
                listingType: $scope.searchForm.listingType
            };

            ListingService.searchListings(searchParams, function (err) {
                $ionicLoading.hide();
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error searching for properties!',
                        template: err.message
                    });
                } else {
                    Listings.setCurrentListingType(LISTING_TYPES.properties);
                    $state.go('app.listing');
                }
            });
        };
    })

    .controller('BusinessSearchCtrl', function ($scope, SearchService, Listings) {
        'use strict';

        $scope.counties = SearchService.getCounties();
        $scope.county = $scope.counties[0];
        $scope.areas = SearchService.getCountyAreas($scope.county);
        $scope.area = $scope.areas[0];

        $scope.updateAreas = function (county) {
            $scope.areas = SearchService.getCountyAreas(county);
            $scope.area = $scope.areas[0];
        };

        $scope.search = function () {
            Listings.setCurrentListingType('Result');
        };
    });