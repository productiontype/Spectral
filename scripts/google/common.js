var fontFiles = [
	  '../../fonts/Spectral-Bold.ttf'
	, '../../fonts/Spectral-BoldItalic.ttf'
	, '../../fonts/Spectral-ExtraBold.ttf'
	, '../../fonts/Spectral-ExtraBoldItalic.ttf'
	, '../../fonts/Spectral-ExtraLight.ttf'
	, '../../fonts/Spectral-ExtraLightItalic.ttf'
	, '../../fonts/Spectral-Italic.ttf'
	, '../../fonts/Spectral-Light.ttf'
	, '../../fonts/Spectral-LightItalic.ttf'
	, '../../fonts/Spectral-Medium.ttf'
	, '../../fonts/Spectral-MediumItalic.ttf'
	, '../../fonts/Spectral-Regular.ttf'
	, '../../fonts/Spectral-SemiBold.ttf'
	, '../../fonts/Spectral-SemiBoldItalic.ttf'
];

require.config({
	baseUrl: '/scripts/google/lib',
	paths:{
		
		lodash: [
			'https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min',
			'lodash.min'
		],
		d3: [
			'https://cdnjs.cloudflare.com/ajax/libs/d3/4.12.0/d3',
			'd3.min'
		]
	}
});

require(['bootstrap'], function(require) {
  
  	require(['../load-fonts'], function(main) {
      	main(window, fontFiles);
 	});

 	require(['../googlefontsbadge'], function() {
 		gfBadge();
 	});
	
 	require(['../data-viz']);
});