using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace WordChains {
    
    public class Graph<T> {
        Dictionary<T,List<T>> vertices;
        Dictionary<T,bool> marked;
        Dictionary<T,int> componentIds;
        Dictionary<T,bool> color;

        int lastComponentId=0;
        bool hasCycle=false;
        bool isBipartite=true;

        public Graph()
        {
            vertices = new Dictionary<T, List<T>>();
            marked = new Dictionary<T,bool>();
            componentIds = new Dictionary<T,int>();
            color = new Dictionary<T,bool>();
        }

        public Graph(List<T> edges) : this() {
            if (edges.Count%2!=0)
                throw new Exception("Edge list must be an even count.");
            for (int i=0;i<edges.Count-1;i+=2) {
                AddEdge(edges[i],edges[i+1]);
            }
            foreach (var v in vertices.Keys) {
                if (!IsMarked(v)) {
                    dfsCycles(v,v);
                }
            } 
            ResetMarked();
            foreach (var v in vertices.Keys) {
                if (!IsMarked(v)) {
                    dfsBipartite(v);
                }
            } 
            ResetMarked();
        }

        void dfsCycles(T v, T u) {
            Mark(v);
            foreach (var w in Adjacent(v)) {
                if (!IsMarked(w))
                    dfsCycles(w,v);
                else 
                if (!w.Equals(v))
                    hasCycle = true;
            }
        }

        void dfsBipartite(T v) {
            Mark(v);
            foreach(var w in Adjacent(v)){
                if (!IsMarked(w)) {
                    color[w] = !color[v];
                    dfsBipartite(w);
                }
                else 
                if (color[w] == color[v]) {
                    isBipartite = false;
                }
            }
        }

        public List<T> GetVerticesWithColor(bool isColor) {
            var c = new List<T>();
            foreach (var v in vertices.Keys) {
                if (color[v]==isColor)
                    c.Add(v);
            }
            return c;
        }

        public bool HasCycle => hasCycle;
        public bool IsBipartite => isBipartite;

        public void AddEdge(T a, T b) {
            if (!vertices.ContainsKey(a)) {
                vertices.Add(a,new List<T>());
                marked.Add(a,false);
                componentIds.Add(a,1);
                color.Add(a,false);
            }
            if (!vertices.ContainsKey(b)) {
                vertices.Add(b,new List<T>());
                marked.Add(b,false);
                componentIds.Add(b,1);
                color.Add(b,false);
            }
            vertices[a].Add(b);
            vertices[b].Add(a);
        }

        public bool IsConnected(T a, T b) {
            ResetMarked();
            var s = new ConnectedVertices<T>(this,a);
            return IsMarked(b);
        }

        public bool IsMarked(T a) {
            return marked[a];
        }

        public void Mark(T a) {
            marked[a] = true;
        }

        public void ResetMarked() {
            foreach (var v in vertices.Keys) {
                marked[v] = false;
            }
        }

        public List<T> GetMarked() {
            var list = new List<T>();
            foreach (var v in vertices.Keys) {
                if (marked[v])
                    list.Add(v);
            }
            return list;
        }

        public void FindComponents() {
            ResetMarked();
            foreach (var v in vertices.Keys) {
                if (!IsMarked(v)) {
                    dfsComponents(v);
                    lastComponentId++;
                }
            }
        }

        void dfsComponents(T v) {
            Mark(v);
            componentIds[v] = lastComponentId;
            foreach (var w in Adjacent(v)) {
                if (!IsMarked(w))
                    dfsComponents(w);
            }
        }

        public bool SameComponent(T a, T b) {
            return componentIds[a] == componentIds[b];
        }

        public List<int> GetComponentIds() {
            var list = new List<int>();
            for (int i=0;i<lastComponentId;i++)
                list.Add(i);
            return list;
        }

        public List<T> GetVerticesInComponent(int id) {
            var list = new List<T>();
            foreach (var c in componentIds.Keys) {
                if (componentIds[c]==id) {
                    list.Add(c);
                }
            }
            return list;
        }

        public int VerticeCount => vertices.Count;

        public int EdgeCount => vertices.SelectMany(v=>v.Value).Count() / 2;

        public List<T> Adjacent(T w) {
            return vertices[w];
        }

        public int Degree(T w) {
            return Adjacent(w).Count;
        }

        public int MaxDegree() {
            int max=0;
            foreach (var v in vertices.Keys) {
                int d=Degree(v);
                if (d > max) {
                    max = d;
                }
            }
            return max;
        }

        public double AverageDegree() {
            return 2.0 * EdgeCount / VerticeCount;
        }

        public int SelfLoopCount() {
            int count=0;
            foreach (var v in vertices.Keys) {
                foreach (var n in Adjacent(v)) {
                    if (v.Equals(n))
                        count++;
                }
            }
            return count;
        }

        public override string ToString(){
            var sb = new StringBuilder();
            var edges = new HashSet<string>();
            sb.Append($"Vertices {VerticeCount}, Edges {EdgeCount}\n");
            foreach (var k in vertices.Keys) {
                foreach (var e in Adjacent(k)) {
                    var edge = $"{k}:{e} deg {Degree(k)} marked {IsMarked(k)}";
                    if (!edges.Contains($"{e}:{k}")) {
                        sb.Append($"{edge}\n");
                        edges.Add(edge);
                    }
                }
            }
            return sb.ToString();
        }
    }

    public class ConnectedVertices<T>
    {
        Graph<T> g;
        int count;

        public ConnectedVertices(Graph<T> g, T v)
        {
            this.g = g;
            Search(g,v);
        }

        private void Search(Graph<T> g, T v) {
            g.Mark(v);
            count++;
            foreach (var w in g.Adjacent(v)) {
                if (!g.IsMarked(w))
                    Search(g,w);
            }
        }
        public int Count => count;

        public List<T> GetConnected() {
            return g.GetMarked();
        }
    }
}