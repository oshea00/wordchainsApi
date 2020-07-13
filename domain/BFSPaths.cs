using System.Collections.Generic;

namespace WordChains {   
    
    public class BFSPaths<T>
    {
        Graph<T> g;
        T s;
        Dictionary<T,T> edgeTo = new Dictionary<T,T>();

        public BFSPaths(Graph<T> g, T s)
        {
            this.g = g;
            this.s = s;
            Search(g,s);
        }

        private void Search(Graph<T> g, T s) {
            var q = new Queue<T>();
            g.Mark(s);
            q.Enqueue(s);
            while (q.Count > 0) {
                var v = q.Dequeue();
                g.Adjacent(v).ForEach(w=>{
                    if (!g.IsMarked(w)) {
                        edgeTo[w] = v;
                        g.Mark(w);
                        q.Enqueue(w);
                    }
                });
            }
        }

        public bool HasPathTo(T v) {
            return g.IsMarked(v);
        }

        public List<T> PathTo(T w) {
            var path = new List<T>();
            if (HasPathTo(w)) {
                for (T x=w; !x.Equals(s); x=edgeTo[x]) {
                    path.Add(x);
                }
                path.Add(s);
                path.Reverse();
            }
            return path;
        }
    }
}