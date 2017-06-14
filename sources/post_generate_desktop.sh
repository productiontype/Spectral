for i in *.ttf ; do 
  fontbakery fix-fsselection --usetypometrics $i -e --no-coverage
done
for i in *.ttf ; do 
  fontbakery fix-dsig $i -e --no-coverage
done