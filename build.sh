#!/bin/bash

#install zip on debian OS, since microsoft/dotnet container doesn't have zip by default
if [ -f /etc/debian_version ]
then
  apt -qq update
  apt -qq -y install zip
fi

dotnet restore
dotnet tool update -g Amazon.Lambda.Tools
dotnet lambda package --configuration Release --framework net10.0 --output-package bin/Release/net10.0/wordchain.zip
