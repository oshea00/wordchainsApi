# Word Chains

A demo app that finds a chain of one-letter changes between two words. Try it at [wordchain.limpidfox.com](https://wordchain.limpidfox.com).

Both words must be the same length, from 2 to 8 letters. Not all words have paths to each other, and 3 to 6 letters work best. For example:

* [trout truth](https://api.limpidfox.com/qux5svesmk/wordchain?from=trout&to=truth)
* [game over](https://api.limpidfox.com/qux5svesmk/wordchain?from=game&to=over)
* [cat dog](https://api.limpidfox.com/qux5svesmk/wordchain?from=cat&to=dog)

## Repo layout

| Folder | Contents |
|---|---|
| `backend/` | C# Lambda function on .NET 10 |
| `ui/` | React site built with Vite, requires Node 24 |
| `infra/` | CloudFormation template for the AWS resources |
| `scripts/` | Build, test, deploy, smoke test and word list scripts |
| `tests/` | C# unit tests |

## Build, test and deploy

```
scripts/test.sh             # run the C# and UI tests
scripts/build.sh            # create the Lambda package and the site
scripts/deploy.sh infra     # apply infra/template.yaml
scripts/deploy.sh api       # deploy the Lambda package
scripts/deploy.sh ui        # upload the site and clear the CloudFront cache
scripts/smoke.sh public     # check the live site and API
```

Stack changes are listed for approval before they are applied. They need the AWS CLI with access to the account. Set `ALERT_EMAIL` to change the shutoff address.

## API

`GET /wordchain?from=<word>&to=<word>` returns the chain as a JSON array of words. Input is not case-sensitive. Failures return `{"code", "message"}`:

| Status | `code` | Meaning |
|---|---|---|
| 400 | `invalid_word` | A word is missing, or isn't 2 to 8 letters |
| 400 | `length_mismatch` | The words have different lengths |
| 422 | `not_in_dictionary` | A word isn't in the list; `words` names which |
| 404 | `no_chain` | Both words are valid, but no chain connects them |

## Word list

`backend/domain/words.txt` is derived from [SCOWL](http://wordlist.aspell.net/) by Kevin Atkinson, release 2020.12.07, using the American, British and shared lists up to size 60. It holds lowercase words of 2 to 8 letters. Words in `backend/domain/words-excluded.txt`, mainly offensive words, are removed.

Don't edit `words.txt` by hand. To change it, edit the exclusions or the release pinned in `scripts/update-words.py`, then run:

```
scripts/update-words.py
```

This also regenerates `ui/public/third-party-notices.txt`, which carries the SCOWL copyright and license notices and is published with the site.

## Cost protection

The API is public, so these limits keep traffic from running up a bill:

- API Gateway allows 5 requests per second, with a burst of 10.
- The Lambda function can run at most 3 copies at once.
- If the function is called more than 5,000 times in an hour, a CloudWatch alarm emails the alert address and blocks the API. The alarm can take up to about two hours to act.
- API Gateway request logging is off, and logs are kept for 14 days.

The API stays blocked until you restore it:

```
scripts/deploy.sh reopen
```

Limit changes can take about a minute to reach API Gateway, so requests may keep failing briefly after reopening.

When traffic exceeds the limits, API Gateway returns 429 and the Lambda limit can return 500. The site shows a "busy" message for both.

## AWS resources

`infra/template.yaml` defines the `limpid-wordchains-backend-dev` stack in us-west-2. These items are outside the stack:

- Route 53 records for `wordchain.limpidfox.com` and `api.limpidfox.com`
- ACM certificates, which are shared with other sites

To change the API's methods, rename `ApiGatewayDeploymentPublic` in the template so a new deployment is published.
