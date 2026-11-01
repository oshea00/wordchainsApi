dotnet restore
dotnet tool update -g Amazon.Lambda.Tools
dotnet lambda package --configuration Release --framework net10.0 --output-package bin/Release/net10.0/wordchain.zip
