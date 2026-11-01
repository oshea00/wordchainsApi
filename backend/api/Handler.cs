using System;
using System.Net;
using System.IO;
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
      static readonly Regex ValidWord = new Regex("^[A-Za-z]{1,20}$", RegexOptions.Compiled);

      public APIGatewayProxyResponse WordChain(APIGatewayProxyRequest request)
      {
        var query = request.QueryStringParameters;
        string from = null;
        string to = null;
        query?.TryGetValue("from", out from);
        query?.TryGetValue("to", out to);

        if (!IsValidWord(from) || !IsValidWord(to))
        {
          return BadRequest();
        }

        var result = WordChains.MakeWordChains(WordList.Dictionary, from, to);

        Console.WriteLine($"From: {from} To: {to} Steps: {result.Count}");

        return Response(result);
      }

      static bool IsValidWord(string word) =>
        word != null && ValidWord.IsMatch(word);

      APIGatewayProxyResponse BadRequest()
      {
        return new APIGatewayProxyResponse {
          StatusCode = (int) HttpStatusCode.BadRequest,
          Body = JsonSerializer.Serialize(new { message = "from and to must be 1-20 letters" }),
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
