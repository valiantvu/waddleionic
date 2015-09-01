(function() {
angular.module('waddle.services', [
    'waddle.services.footprintRequestsFactory',
    'waddle.services.discoverPlacesFactory',
    'waddle.services.mapFactory',
    'waddle.services.auth',
    'waddle.services.userRequests',
    'waddle.services.nativeCheckin',
    'waddle.services.utils'
    ]);
})();
