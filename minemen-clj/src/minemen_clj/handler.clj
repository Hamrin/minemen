(ns minemen-clj.handler
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [clojure.data.json :as json]
            [minemen-clj.core :refer [move]]))

(defn abs-uri [resource {scheme :scheme, domain :server-name, port :server-port}]
  (str (name scheme) "://" domain ":" port "/" resource))

(defn start [req]
  (json/write-str {:name "cljbot"
                   :avatar (abs-uri "avatar.gif" req)
                   :version "0.1.0"}))

(defroutes app-routes
  (POST "/start" [_ :as req] (start req))
  (POST "/move" {board :body} (println "move") (move (slurp board)))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))
