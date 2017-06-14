for i in *.ttf; do
    sfnt2woff-zopfli -m ../webfont_metadata.xml $i
    woff2_compress $i
done