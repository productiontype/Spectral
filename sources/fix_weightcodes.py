#!/usr/bin/env python

# Fix weightcodes

import sys, os
from fontTools.ttLib import TTFont
from fontTools.ttx import makeOutputFileName

inputTTF = sys.argv[1]

font = TTFont(inputTTF)
filename = os.path.splitext(inputTTF)[0]
extension = os.path.splitext(inputTTF)[1]

wght={'Spectral-ExtraLight':[250,2],'Spectral-Light':[300,3],'Spectral-':[400,5],'Spectral-Medium':[500,6],'Spectral-SemiBold':[600,7],'Spectral-Bold':[700,8],'Spectral-ExtraBold':[800,9]}
weightname = filename.replace('Regular','').replace('Italic','')
font['OS/2'].panose.bWeight = wght[weightname][1]
font['OS/2'].usWeightClass = wght[weightname][0]

outputTTF = makeOutputFileName(inputTTF, '', extension)
font.save(outputTTF)