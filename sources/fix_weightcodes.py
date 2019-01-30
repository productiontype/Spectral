#!/usr/bin/env python

# Fix weightcodes

import sys, os
from fontTools.ttLib import TTFont
from fontTools.ttx import makeOutputFileName

inputTTF = sys.argv[1]

font = TTFont(inputTTF)
filename = os.path.splitext(inputTTF)[0]
extension = os.path.splitext(inputTTF)[1]

wght={'spectral-extralight':[250,2],'spectral-light':[300,3],'spectral-':[400,5],'spectral-medium':[500,6],'spectral-semibold':[600,7],'spectral-bold':[700,8],'spectral-extrabold':[800,9]}
weightname = filename.replace('regular','').replace('italic','')
font['OS/2'].panose.bWeight = wght[weightname][1]
font['OS/2'].usWeightClass = wght[weightname][0]

outputTTF = makeOutputFileName(inputTTF, '', extension)
font.save(outputTTF)