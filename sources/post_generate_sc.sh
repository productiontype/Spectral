for i in *.[to]tf ; do 
  fam_name="${i:0:8}SC-"
  style="${i:9:100}"
  sc_name=$fam_name$style
  pyftfeatfreeze.py -f 'smcp' -S -U SC $i $sc_name
  rm $i
done