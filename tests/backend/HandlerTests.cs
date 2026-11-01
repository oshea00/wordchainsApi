using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using WordChains;
using Xunit;

public class HandlerTests
{
    static APIGatewayProxyResponse Search(string from, string to)
    {
        var query = new Dictionary<string, string>();
        if (from != null) query["from"] = from;
        if (to != null) query["to"] = to;
        return new Handler().WordChain(new APIGatewayProxyRequest { QueryStringParameters = query });
    }

    static string Code(APIGatewayProxyResponse response) =>
        JsonDocument.Parse(response.Body).RootElement.GetProperty("code").GetString();

    static string[] Chain(APIGatewayProxyResponse response) =>
        JsonSerializer.Deserialize<string[]>(response.Body);

    [Fact]
    public void ReturnsAChainOfOneLetterChanges()
    {
        var response = Search("cold", "warm");
        Assert.Equal(200, response.StatusCode);
        var chain = Chain(response);
        Assert.Equal("cold", chain.First());
        Assert.Equal("warm", chain.Last());
        foreach (var (a, b) in chain.Zip(chain.Skip(1)))
            Assert.Equal(1, a.Zip(b).Count(pair => pair.First != pair.Second));
        Assert.All(chain, word => Assert.True(WordList.Contains(word)));
    }

    [Fact]
    public void LowercasesInput()
    {
        Assert.Equal(new[] { "cat", "cot" }, Chain(Search("CAT", "Cot")));
    }

    [Fact]
    public void AWordChainsToItself()
    {
        Assert.Equal(new[] { "cat" }, Chain(Search("cat", "cat")));
    }

    [Theory]
    [InlineData(null, "dog")]
    [InlineData("cat", null)]
    [InlineData("c4t", "dog")]
    [InlineData("a", "b")]
    [InlineData("elephants", "elephants")]
    public void RejectsInvalidWords(string from, string to)
    {
        var response = Search(from, to);
        Assert.Equal(400, response.StatusCode);
        Assert.Equal("invalid_word", Code(response));
    }

    [Fact]
    public void RejectsWordsOfDifferentLengths()
    {
        var response = Search("cat", "door");
        Assert.Equal(400, response.StatusCode);
        Assert.Equal("length_mismatch", Code(response));
    }

    [Fact]
    public void NamesEveryWordMissingFromTheDictionary()
    {
        var response = Search("zzzz", "qqqq");
        Assert.Equal(422, response.StatusCode);
        Assert.Equal("not_in_dictionary", Code(response));
        var words = JsonDocument.Parse(response.Body).RootElement.GetProperty("words");
        Assert.Equal(new[] { "zzzz", "qqqq" }, words.EnumerateArray().Select(w => w.GetString()));
    }

    [Fact]
    public void RejectsAStartWordOutsideTheDictionaryEvenWithNeighbours()
    {
        var response = Search("cax", "dog");
        Assert.Equal(422, response.StatusCode);
    }

    [Fact]
    public void ReportsWhenNoChainExists()
    {
        var isolated = FindIsolatedWord();
        var other = WordList.Dictionary.First(w => w.Length == isolated.Length && w != isolated);
        var response = Search(isolated, other);
        Assert.Equal(404, response.StatusCode);
        Assert.Equal("no_chain", Code(response));
    }

    static string FindIsolatedWord()
    {
        var sameLength = WordList.Dictionary.Where(w => w.Length == 4).ToList();
        return sameLength.First(w => !sameLength.Any(o => o.Zip(w).Count(p => p.First != p.Second) == 1));
    }
}
