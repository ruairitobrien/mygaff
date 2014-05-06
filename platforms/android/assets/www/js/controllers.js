/* global angular, alert */

angular.module('mygaff.controllers', ['ui.bootstrap'])

    .controller('AppCtrl', function ($scope) {
        'use strict';
    })

.controller('ContentController', function ($scope, $ionicSideMenuDelegate) {
    'use strict';
        $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
})

    .controller('HomeCtrl', function ($scope, Listings) {
        'use strict';
        $scope.setCurrentListingType = function (listing) {
            Listings.setCurrentListingType(listing);
        };
    })

    .controller('ListingCtrl', function ($scope, $state, $stateParams, $ionicLoading, $ionicPopup, PropertyService, Listings) {
        'use strict';

        $scope.currentListing = Listings.currentListing;

        $scope.search = (Listings.currentListing === 'Properties') ? 'property-search' : 'business-search';

        var showLoading = function() {
            $scope.loading = $ionicLoading.show({
                content: '<i class="icon ion-looping"></i> Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 500
            });
        };

        $scope.showProperty = function (property) {
            Listings.setCurrentProperty(property);
        };

        $scope.doRefresh = function () {
            if($scope.currentListing === 'Business') {
                PropertyService.fetchBusinesses(function (err) {
                    if (err) {
                        alert(err.message);
                    } else {
                        $scope.properties = Listings.businesses;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                });
            } else if($scope.currentListing === 'Properties') {
                PropertyService.fetchProperties(function (err) {
                    if (err) {
                        alert(err.message);
                    } else {
                        $scope.properties = Listings.properties;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }
        };


        if($scope.currentListing === 'Business') {
            if(Listings.businesses) {
                $scope.properties = Listings.businesses;
            } else {
                showLoading();
                PropertyService.fetchBusinesses(function (err) {
                    if (err) {
                        alert(err.message);
                    } else {
                        $scope.properties = Listings.businesses;
                    }
                    $scope.loading.hide();
                });
            }

        } else if($scope.currentListing === 'Properties') {
            if(Listings.properties) {
                $scope.properties = Listings.properties;
            } else {
                showLoading();
                PropertyService.fetchProperties(function (err) {
                    if (err) {
                        alert(err.message);
                    } else {
                        $scope.properties = Listings.properties;
                    }
                    $scope.loading.hide();
                });
            }
        } else {
            $scope.loading.hide();
            alert('Error. Unknown Listing Option');
        }

    })

    .controller('PropertyCtrl', function ($scope, $sce, PropertyService, Listings) {
        'use strict';
        $scope.property = Listings.currentProperty;

        $scope.renderHtml = function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    })

    .controller('GalleryCtrl', function ($scope) {
        'use strict';
    })

    .controller('PropertySearchCtrl', function ($scope, SearchService, Listings) {
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
    })

    .controller('SettingsCtrl', function ($scope) {
        'use strict';
    });