/* global angular */

angular.module('mygaff.business.controllers', ['ui.bootstrap'])

    .controller('BusinessListingCtrl', function ($scope, $state, $ionicLoading, $ionicPopup, BusinessListings, BusinessListingService) {
        "use strict";

        var moreDataCanBeLoaded = true;

        $scope.moreDataCanBeLoaded = function () {
            // TODO: Can I check if no more data is available?
            return moreDataCanBeLoaded;
        };

        $scope.showBusiness = function (business) {
            BusinessListings.setCurrentBusiness(business);
        };

        $scope.nextPage = function () {
            BusinessListingService.nextListingsPage(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    $scope.listings = BusinessListings.getCurrentList();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            });
        };

        /**
         * Used by the pull down refresh to load businesses again
         */
        $scope.doRefresh = function () {
            BusinessListingService.fetchLatestListings(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error refreshing listings',
                        template: err.message
                    });
                } else {
                    $scope.listings = BusinessListings.getCurrentList();
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /**
         * Called when page first loads
         */
        if (BusinessListings.getCurrentList() && (BusinessListings.getCurrentList().length > 0)) {
            $scope.listings = BusinessListings.getCurrentList();
        } else {

            BusinessListingService.fetchLatestListings(function (err) {
                if (err) {
                    $ionicPopup.alert({
                        title: 'Error retrieving listings',
                        template: err.message
                    });
                    $state.go('app.home');

                } else {
                    $scope.listings = BusinessListings.getCurrentList();
                }
            });
        }
    })

    .controller('BusinessCtrl', function ($scope, $sce, BusinessListings, Gallery) {
        "use strict";

        $scope.business = BusinessListings.currentBusiness;

        Gallery.setImages($scope.business.images);

        $scope.renderHtml = function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };

    })

    .controller('BusinessSearchCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, SearchDataService, BusinessListingService) {
        'use strict';

        $scope.counties = SearchDataService.getCounties();
        $scope.county = $scope.counties[0];
        $scope.areas = SearchDataService.getCountyAreas($scope.county);
        $scope.area = $scope.areas[0];
        $scope.categories = SearchDataService.getBusinessCategories().categories;

        $scope.searchForm = {
            county: $scope.counties[0],
            location: $scope.areas[0],
            category: $scope.categories[0]
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
                category: ($scope.searchForm.category) ? $scope.searchForm.category.id : '',
                subcategory: '',
                start: 0
            };

            BusinessListingService.searchListings(searchParams, function (err) {
                $ionicLoading.hide();
                if (err) {
                    if (err.type && err.type === 'no results') {
                        $ionicPopup.alert({
                            title: 'No Results',
                            template: 'Please try different search criteria'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Error Searching Businesses',
                            template: err.message
                        });
                    }
                } else {
                    $state.go('app.business-listing');
                }
            });
        };
    });