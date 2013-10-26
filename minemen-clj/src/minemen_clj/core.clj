(ns minemen-clj.core
  (:require [clojure.data.json :as json]))

(defn id
  "returns the ID of this bot"
  [state]
  (state "yourID"))

(defn indexed-board
  "returns the board as a map where keys are the row indexes and values are the rows"
  [state]
  (zipmap (range) (state "board")))

(defn loc
  "returns this bot's location on the board as [x y]"
  [state]
  (first (filter #(> (first %) -1) (map #(vector (.indexOf (last %) (id state)) (first %)) (indexed-board state)))))

(defn size
  "returns size of board as [x y]"
  [state]
  (let [board (state "board")]
    [(count (nth board 1)) (count board)]))

(defn seq-contains?
  "tests if value v exists in seq s"
  [v s]
  (some #{v} s))

(defn indexes-of
  "returns indexes in seq s at which value matching predicate p exists"
  [p s]
  (map first (filter #(p (last %)) (zipmap (range) s))))

(defn find-in-row
  "returns the locations of value matching predicate p in in row i as a vector of [x y] positions"
  [i p row]
  (map #(vector % i) (indexes-of p row)))

(defn find-on-board
  "returns the locations of values matching predicate p as a vector of [y x] positions"
  [state p]
  (mapcat #(find-in-row (first %) p (last %)) (indexed-board state)))

(defn find-gold
  "returns the locations of gold as a vector of [y x] positions"
  [state]
  (find-on-board state #{"g"}))

(defn find-mines
  "returns the location of mines as a vector of [y x] positions"
  [state]
  (find-on-board state #{"b"}))

(defn find-bots
  "returns the location of mines as a vector of [y x] positions"
  [state]
  (find-on-board state #(and (integer? %) (not (= (id state) %)))))

(defn move-candidates []
  [[1 0] [-1 0] [0 1] [0 -1]])

(defn new-loc [board move]
  (let [cur-loc (loc board)] [(+ (first cur-loc) (first move)) (+ (last cur-loc) (last move))]))

;(defn remove-bad-paths [board candidates]
;  (let [new-pos (zipmap candidates (map ))]
;    (filter #() candidates)))

(defn move [board]
  (println board)
  {:direction {:x 0, :y 0}, :mine 0})
