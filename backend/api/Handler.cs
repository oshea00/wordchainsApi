using System;
using System.Net;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Amazon;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;

[assembly:LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace WordChains
{
    public class Handler
    {
      const string InvalidWordMessage = "Words must be 2 to 8 letters";

      static readonly Regex ValidWord = new Regex("^[A-Za-z]{2,8}$", RegexOptions.Compiled);

      public APIGatewayProxyResponse WordChain(APIGatewayProxyRequest request)
      {
        var query = request.QueryStringParameters;
        string from = null;
        string to = null;
        query?.TryGetValue("from", out from);
        query?.TryGetValue("to", out to);

        if (!IsValidWord(from) || !IsValidWord(to))
        {
          return Failure(HttpStatusCode.BadRequest, "invalid_word", InvalidWordMessage);
        }

        from = from.ToLowerInvariant();
        to = to.ToLowerInvariant();

        if (from.Length != to.Length)
        {
          return Failure(HttpStatusCode.BadRequest, "length_mismatch", "Both words must be the same length");
        }

        var unknown = new[] { from, to }.Distinct().Where(w => !WordList.Contains(w)).ToArray();
        if (unknown.Length > 0)
        {
          return Failure(HttpStatusCode.UnprocessableEntity, "not_in_dictionary", "Word not in dictionary", unknown);
        }

        var result = WordChains.MakeWordChains(WordList.Dictionary, from, to);

        Console.WriteLine($"From: {from} To: {to} Steps: {result.Count}");

        if (result.Count == 0)
        {
          return Failure(HttpStatusCode.NotFound, "no_chain", "No word chain found");
        }

        return Response(result);
      }

      static bool IsValidWord(string word) =>
        word != null && ValidWord.IsMatch(word);

      APIGatewayProxyResponse Failure(HttpStatusCode status, string code, string message, string[] words = null)
      {
        object body = words == null
          ? new { code, message }
          : new { code, message, words };
        return new APIGatewayProxyResponse {
          StatusCode = (int) status,
          Body = JsonSerializer.Serialize(body),
          Headers = ResponseHeaders()
        };
      }

      static Dictionary<string, string> ResponseHeaders() => new Dictionary<string, string>
      {
          { "Content-Type", "application/json" },
          { "Access-Control-Allow-Origin", "*" }
      };

      APIGatewayProxyResponse Response(List<string> result) 
      {
        int statusCode = (int) HttpStatusCode.OK;
        return new APIGatewayProxyResponse {
          StatusCode = statusCode,
          Body = JsonSerializer.Serialize<List<string>>(result),
          Headers = ResponseHeaders()
        };

      }
    }    
}
