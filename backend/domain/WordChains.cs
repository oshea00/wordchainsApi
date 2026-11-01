using System;
using System.Collections.Generic;
using System.Linq;

namespace WordChains {

    public class WordChains {
        public static List<string> MakeWordChains(List<string> dictionary, string starting, string ending) 
        {
            try 
            {
                var g = HammingOneGraph(dictionary,starting);
                var bfs = new BFSPaths<string>(g,starting);
                return bfs.PathTo(ending);
            }
            catch (Exception)
            {
                return new List<string>{ "No word chain found :(" };
            }
        }

        private static Graph<string> HammingOneGraph(List<string> dictionary, string starting) 
        {
            dictionary = dictionary.Where(w=>w.Length == starting.Length).Distinct().ToList();

            var marked = new Dictionary<string,bool>();
            foreach (var w in dictionary)
                marked.Add(w,false);

            var stack = new Stack<string>();
            stack.Push(starting);

            var edgePairs = new List<string>();
            
            while (stack.Count > 0) {
                var startingWord = stack.Pop();
                marked[startingWord] = true;
                foreach (var word in dictionary) {
                    if (IsHammingDistance(startingWord, word, 1) && !marked[word]) {
                        edgePairs.Add(startingWord);
                        edgePairs.Add(word);
                        stack.Push(word);
                    }
                }
            }
            return new Graph<string>(edgePairs);
        }
        private static bool IsHammingDistance(string a, string b, int dist) {
            int distance=0;
            int n = a.Length;
            if (a.Length != b.Length)
                return false;
            for (int i = 0; i < n; i++) {
                if (a[i] != b[i])
                    distance++;
            }
            return distance == dist;
        }

    }

}