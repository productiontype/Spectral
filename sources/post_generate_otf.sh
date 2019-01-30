for i in *.otf; do
    python ../fix_weightcodes.py "$i"
    echo "Processing $i ..."
done
for i in *.otf ; do mv $i ${i//#1/} ; done
for file in *.otf; do
	echo  Hinting $file ...
  autohint -q $file
done
gftools fix-fstype *.otf
rm *.otf
for i in *.fix ; do mv $i $(basename -s .fix $i) ; done
