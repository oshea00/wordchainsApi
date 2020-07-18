using System;
using System.Net;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;

[assembly:LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace WordChains
{
    public class Handler
    {
      public APIGatewayProxyResponse WordChain(APIGatewayProxyRequest request)
      {
        Console.WriteLine($"{string.Join(",",request.QueryStringParameters)}");
        string from = request.QueryStringParameters["from"];
        string to = request.QueryStringParameters["to"];

        var result = WordChains.MakeWordChains(WordList.Dictionary, from, to);

        Console.WriteLine($"From: Game To: Over Results: {result}");

        return Response(result); 
      }

      APIGatewayProxyResponse Response(List<string> result) 
      {
        int statusCode = (int) HttpStatusCode.OK;
        return new APIGatewayProxyResponse {
          StatusCode = statusCode,
          Body = JsonSerializer.Serialize<List<string>>(result),
          Headers = new Dictionary<string, string>
          { 
              { "Content-Type", "application/json" }, 
              { "Access-Control-Allow-Origin", "*" } 
          }        
        };

      }
    }    
}
