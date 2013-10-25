(ns minemen-clj.core
  (:require [clojure.data.json :as json]))

(defn indexed-board
  "returns the board as a map where keys are the row indexes and values are the rows"
  [state]
  (zipmap (range) (state "board")))

(defn loc
  "returns this bot's location on the board as [y x]"
  [state]
  (let [id (state "yourID")]
    (first (filter #(> (last %) -1) (map #(vector (first %) (.indexOf (last %) id)) (indexed-board state))))))

(defn size
  "returns size of board as [y x]"
  [state]
  (let [board (state "board")]
    [(count board) (count (nth board 1))]))

(defn seq-contains?
  "tests if value v exists in seq s"
  [v s]
  (some #{v} s))

(defn indexes-of
  "returns indexes in seq s at which value v exists"
  [v s]
  (map first (filter #(= v (last %)) (zipmap (range) s))))

(defn find-in-row
  "returns the locations of value v in in row i as a vector of [y x] positions"
  [i v row]
  (map #(vector i %) (indexes-of v row)))

(defn find-on-board
  "returns the locations of value v as a vector of [y x] positions"
  [state v]
  (mapcat #(find-in-row (first %) v (last %)) (indexed-board state)))

(defn find-gold
  "returns the locations of gold as a vector of [y x] positions"
  [state]
  (find-on-board state "g"))

(defn find-mines
  "returns the location of mines as a vector of [y x] positions"
  [state]
  (find-on-board state "b"))

(defn move [board]
  (println board)
  (json/write-str {:direction {:x 0, :y 0}, :mine 0}))
