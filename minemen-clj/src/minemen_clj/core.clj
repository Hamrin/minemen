(ns minemen-clj.core
  (:require [clojure.data.json :as json]))

(defn loc
  "returns this bot's location on the board as [y x]"
  [state]
  (let [id (state "yourID")
        iboard (zipmap (range) (state "board"))]
    (first (filter #(> (last %) -1) (map #(vector (first %) (.indexOf (last %) id)) iboard)))))

(defn size
  "returns size of board as [y x]"
  [state]
  (let [board (state "board")]
    [(count board) (count (nth board 1))]))

(defn move [board]
  (println board)
  (json/write-str {:direction {:x 0, :y 0}, :mine 0}))
