for i in *.ttf ; do 
  gftools fix-fsselection --usetypometrics $i
done
for i in *.ttf ; do 
  gftools fix-dsig $i
done