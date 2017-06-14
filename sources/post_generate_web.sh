for i in *.ttf ; do 
  fontbakery fix-vertical-metrics $i -e --no-coverage
done