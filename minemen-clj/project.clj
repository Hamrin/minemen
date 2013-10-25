(defproject minemen-clj "0.1.0-SNAPSHOT"
  :description "Clojure bot for minemen"
  :url "https://github.com/jmglov/minemen"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [org.clojure/data.json "0.2.3"]
                 [compojure "1.1.5"]]
  :plugins [[lein-ring "0.8.5"]]
  :ring {:handler minemen-clj.handler/app}
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.5"]]}})
