	// create the module and name it scotchApp
	var app = angular.module('KaazaApp', ['ngRoute', 'infinite-scroll', 'algoliasearch']);

	// configure our routes
	app.config(function($routeProvider, $locationProvider) {
	 $routeProvider

	  // route for the home page
	  .when('/', {
	   templateUrl: 'pages/home.html',
	   controller: 'homeController'
	  })

	  // route for the detail page
	  .when('/basket/:id', {
	   templateUrl: 'pages/detail.html',
	   controller: 'detailController'
	  })
	  .otherwise({
	   redirectTo: '/'
	  });

	});


	// create the controller and inject Angular's $scope
	app.controller('homeController', function($scope, $http, algolia) {
	 let skip = 0;
	 let limit = 20;
	 var client = algoliasearch('1DLPJHZGI0', 'b266f9c8358b3d11e81028d56491068c');
	 var index = client.initIndex('Item');
	 $scope.inputText = '';
	 $scope.Baskets = [];

	 $scope.getMore = function() {
	  if ($scope.inputText.length >= 1) {
	   skip++; // to skip page 0 -> 1 just after updateText
	   index.search($scope.inputText, {
	     page: skip,
	     hitsPerPage: 8
	    },
	    function searchDone(err, content) {
	     for (let hit of content.hits)
	      $scope.Baskets.push(hit)
	     $scope.trending = false;
	    });
	  } else {
	   $http({
	    method: 'GET',
	    url: 'http://api.kaaza.io/v1/items?skip=' + skip + '&' + 'limit=' + limit
	   }).then(function successCallback(response) {
	    for (let item of response.data)
	     $scope.Baskets.push(item);
	    $scope.trending = true;
	   }, function errorCallback(err) {
	    if (err)
	     console.log(err);
	   });
	   skip += 20;
	  }
	 };

	 $scope.updateText = function() {
	  skip = 0;
	  if ($scope.inputText == "") {
	   $scope.Baskets = [];
	   $scope.trending = true;
	   $scope.getMore();
	  } else
	   index.search($scope.inputText, function searchDone(err, content) {
	    $scope.Baskets = content.hits;
	    $scope.trending = false;
	   });
	 };
	 $scope.getMore();
	});

	app.controller('detailController', function($scope, $routeParams, $http) {

	 $http({
	  method: 'GET',
	  url: 'http://api.kaaza.io/v1/items/' + $routeParams.id,
	  params: {
	   skip: 0,
	   limit: 42
	  }
	 }).then(function successCallback(response) {
	  $scope.detailBasket = response.data;
	  console.log($scope.detailBasket);
	 }, function errorCallback(response) {});
	});
