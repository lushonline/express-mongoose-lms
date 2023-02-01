#!/usr/bin/env bash

echo "Setting up mongo user"

echo $DB_USERNAME
echo $DB_PASSWORD

mongosh -- "$DB_NAME" <<EOF
    var rootUser = '$MONGO_INITDB_ROOT_USERNAME';
    var rootPassword = '$MONGO_INITDB_ROOT_PASSWORD';
    var admin = db.getSiblingDB('admin');
    admin.auth(rootUser, rootPassword);

    var user = '$DB_USERNAME';
    var passwd = '$DB_PASSWORD';
    db.createUser({user: user, pwd: passwd, roles: [{role: 'readWrite', db: '$DB_NAME'}]});
EOF