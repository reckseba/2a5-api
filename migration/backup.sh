#!/bin/bash
#
# call this by
# ./backup.sh myuser supersecretpw cluster0.LOOKTHISUP.mongodb.net dbname collectionname

if [ $# -ne 5 ]
then
    echo "5 parameters needed: myuser supersecretpw cluster0.LOOKTHISUP.mongodb.net dbname collectionname"
    exit 0
fi

USER=$1
PASS=$2
HOSTNAME=$3
DB=$4
COLLECTION=$5

mongoexport --uri mongodb+srv://$USER:$PASS@$HOSTNAME/$DB --collection $COLLECTION --type json --out backup.json --jsonArray
