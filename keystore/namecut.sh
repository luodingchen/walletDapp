while true
do
for name in `ls *-*`
do 
mv $name ${name##*-}
done
done
