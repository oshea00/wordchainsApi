using System;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using WordChains;
using Xunit;

public class WordListTests
{
    [Fact]
    public void HoldsOnlyPlayableWords()
    {
        Assert.NotEmpty(WordList.Dictionary);
        Assert.All(WordList.Dictionary, w => Assert.Matches("^[a-z]{2,8}$", w));
    }

    [Fact]
    public void IsSortedAndUnique()
    {
        var sorted = WordList.Dictionary.Distinct().OrderBy(w => w, StringComparer.Ordinal);
        Assert.Equal(sorted, WordList.Dictionary);
    }

    [Fact]
    public void LeavesOutExcludedWords()
    {
        var excluded = File.ReadAllLines(Path.Combine(RepoRoot(), "backend/domain/words-excluded.txt"))
            .Where(line => Regex.IsMatch(line, "^[a-z]"));
        Assert.NotEmpty(excluded);
        Assert.DoesNotContain(excluded, WordList.Contains);
    }

    static string RepoRoot([CallerFilePath] string path = "") =>
        Path.GetFullPath(Path.Combine(Path.GetDirectoryName(path), "../.."));
}
