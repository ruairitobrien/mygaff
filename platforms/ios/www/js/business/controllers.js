/* global angular */

angular.module('mygaff.business.controllers', ['ui.bootstrap'])

    .controller('BusinessListingCtrl', function ($scope) {
        "use strict";

        $scope.moreDataCanBeLoaded = function () {
            // TODO: Can I check if no more data is available?
            return true;
        };


    })

    .controller('BusinessCtrl', function ($scope, Gallery) {
        "use strict";

    })

    .controller('BusinessSearchCtrl', function ($scope, SearchDataService, BusinessListings) {
        'use strict';

        $scope.counties = SearchDataService.getCounties();
        $scope.county = $scope.counties[0];
        $scope.areas = SearchDataService.getCountyAreas($scope.county);
        $scope.area = $scope.areas[0];

        $scope.updateAreas = function (county) {
            $scope.areas = SearchDataService.getCountyAreas(county);
            $scope.area = $scope.areas[0];
        };

        $scope.search = function () {

        };
    });