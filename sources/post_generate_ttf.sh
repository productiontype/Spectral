for i in *.ttf; do
    python ../fix_weightcodes.py "$i"
    echo "Processing $i ..."
done
for i in *.ttf ; do mv $i ${i//#1/} ; done
for i in spectral-regular spectral-bold spectral-italic spectral-bolditalic; do
	ttfautohint -i -n -f latn -m ../hinting/$i.ctrl $i.ttf $i.hinted.ttf
  echo "Hinting $i ..."
done
for i in spectral-extrabold spectral-extrabolditalic spectral-extralight spectral-extralightitalic spectral-light spectral-lightitalic spectral-medium spectral-mediumitalic spectral-semibold spectral-semibolditalic; do
	ttfautohint -i -n -f latn $i.ttf $i.hinted.ttf
  echo "Hinting $i ..."
done
for i in *.ttf ; do mv $i ${i//.hinted/} ; done

# Update fsType
gftools fix-fstype *.ttf
rm *.ttf
for i in *.fix ; do mv $i $(basename -s .fix $i) ; done

# Add DSIG table
gftools fix-dsig *.ttf -a -f

# Add GASP table
gftools fix-gasp *.ttf --autofix
for i in *.fix ; do mv $i $(basename -s .fix $i) ; done