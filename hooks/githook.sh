#!/bin/bash

cd $1
git pull -q
touch crypto.wsgi
