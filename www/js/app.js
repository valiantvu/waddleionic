// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('waddle', ['ionic', 'ngCordova', 'waddle.controllers', 'waddle.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('frontpage', {
      url: '/',
      templateUrl: 'modules/login/frontpage.html',
      controller: 'FrontpageController'
    })
    .state('footprints-map', {
      url: '/footprints-map',
      templateUrl: 'modules/map/map.html',
      controller: 'HomeController'
    })
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "tabs/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'tabs/home/home.html',
          controller: 'HomeController'
        }
      }
    })
    .state('tab.footprints', {
      url: '/footprints',
      views: {
        'footprints-tab': {
          templateUrl: 'tabs/footprints/footprints.html',
          controller: 'FootprintsController'
        }
      }
    })
    .state('tab.checkin', {
      url: '/checkin',
      views: {
        'checkin-tab': {
          templateUrl: 'tabs/checkin/checkin.html',
          controller: 'CheckinController'
        }
      }
    })
    .state('tab.checkin.post', {
      url: '/:venue',
      views: {
        templateUrl: 'tabs/checkin/checkin-post.html',
        controller: 'CheckinController'
      }
    })
    .state('tab.hypelist', {
      url: '/hypelist',
      views: {
        'hypelist-tab': {
          templateUrl: 'tabs/hypelist/hypelist.html',
          controller: 'HypelistController'
        }
      }
    })
    .state('tab.profile', {
      url: '/profile',
      views: {
        'profile-tab': {
          templateUrl: 'tabs/profile/profile.html',
          controller: 'ProfileController'
        }
      }
    })
    .state('tab.profile-friend', {
      url: '/profile-friend',
      views: {
        'profile_friend-tab': {
          templateUrl: 'tabs/profile/profile.html',
          controller: 'ProfileController'
        }
      }
    })
    .state('tab.comments', {
      url: '/comments',
      views: {
        'home-tab': {
          templateUrl: 'tabs/comments/comments.html',
          controller: 'CommentsController'
        }
      }
    })
    .state('tab.hypers', {
      url: '/hypers',
      views: {
        'home-tab': {
          templateUrl: 'tabs/hypers/hypers.html',
          controller: 'HypersController'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});


