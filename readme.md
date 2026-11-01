# Word Chains API

## AWS Lambda example with C#
Example of using .NET 10 as the AWS lambda runtime with a fun puzzle.

## Build and deploy
Run `./build.sh` to create the Lambda package, then `./deploy.sh` to upload it to the existing function with the AWS CLI.

## Example Chains
* [trout truth](https://qux5svesmk.execute-api.us-west-2.amazonaws.com/dev/wordchain?from=trout&to=truth)
* [game over](https://qux5svesmk.execute-api.us-west-2.amazonaws.com/dev/wordchain?from=game&to=over)
* [cat dog](https://qux5svesmk.execute-api.us-west-2.amazonaws.com/dev/wordchain?from=cat&to=dog)

Not all words have paths to each other - in fact quite a few pairs are fruitless. Shorter words are better.

