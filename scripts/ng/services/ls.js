angular.module('App').factory('LS', function($window) {
	return {
		setData: function(key, val) {
  			$window.localStorage.setItem(key, val);
  			return this;
		},
		getData: function(key) {
  			return $window.localStorage.getItem(key);
		}
	};
});
