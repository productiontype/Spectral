Spectral by Production Type
===========================

Spectral is an original typeface primarily intended for use inside Google’s Docs and Slides.

It supports Google Fonts Latin Pro glyph set, enabling the typesetting of English, Western European languages as well as Vietnamese and 130+ other languages.

License
-------

Spectral is available under the SIL Open Font License v1.1, for more details see [OFL.txt](OFL.txt).

Contributions
-------------

The project is led by Production Type, a digital type design agency based in Paris and Shanghai. 
To contribute ideas and feedback, see [github.com/productiontype/spectral](https://github.com/productiontype/spectral)


Source Files
------------

```
└── sources
    ├── BUILD.txt	# Contains informations to build the fonts
    ├── hinting	# Hinting control files
    │   ├── Spectral-Bold.ctrl
    │   ├── Spectral-BoldItalic.ctrl
    │   ├── Spectral-Italic.ctrl
    │   └── Spectral-Regular.ctrl
    ├── fix_weightcodes.py
    ├── generate_webfonts.sh					# Create webfonts
    ├── generate.sh								# Interpolate instances and build TTF files
    ├── post_generate_desktop.sh 				# Finish TTFs for desktop use
    ├── post_generate_ttf.sh 					# Finish TTFs
    ├── post_generate_web.sh 					# Finish TTFs for web use
    ├── webfont_metadata.xml
    ├── spectral-build-italic.designspace		# Interpolation file
    ├── spectral-build-roman.designspace		# Interpolation file
    ├── Spectral-Italic.ufo 					# UFO source master
    ├── Spectral-Regular.ufo 					# UFO source master
    ├── Spectral-XBold-Italic.ufo 				# UFO source master
    ├── Spectral-XBold.ufo 						# UFO source master
    ├── Spectral-XLight-Italic.ufo 				# UFO source master
    └── Spectral-XLight.ufo 					# UFO source master
```

Build Instructions
------------------

To build the fonts see [BUILD.txt](https://github.com/productiontype/spectral/sources/BUILD.txt).
