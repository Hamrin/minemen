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
  (first (filter #(> (last %) -1) (map #(vector (first %) (.indexOf (last %) (id state))) (indexed-board state)))))

(defn size
  "returns size of board as [x y]"
  [state]
  (let [board (state "board")]
    [(count board) (count (first board))]))

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
  (map #(vector i %) (indexes-of p row)))

(defn find-on-board
  "returns the locations of values matching predicate p as a vector of [y x] positions"
  [state p]
  (mapcat #(find-in-row (first %) p (last %)) (indexed-board state)))

(defn find-gold
  "returns the locations of gold as a vector of [y x] positions"
  [state]
  (find-on-board state #{"g"}))

(defn find-bombs
  "returns the location of bombs as a vector of [y x] positions"
  [state]
  (find-on-board state #{"b"}))

(defn find-bots
  "returns the location of bombs as a vector of [y x] positions"
  [state]
  (find-on-board state #(and (integer? %) (not (= (id state) %)))))

(defn new-loc [state move]
  (let [cur-loc (loc state)] [(+ (first cur-loc) (first move)) (+ (last cur-loc) (last move))]))

(defn out-of-bounds? [state pos]
  (let [sx (first (size state))
        sy (last (size state))
        px (first pos)
        py (last pos)]
    (or (or (< px 0) (>= px sx))
        (or (< py 0) (>= py sy)))))

(defn on-a-bomb? [state pos]
  (seq-contains? pos (find-bombs state)))

(defn on-a-bot? [state pos]
  (seq-contains? pos (find-bots state)))

(defn good-position? [state pos]
  (and (not (out-of-bounds? state pos))
       (not (on-a-bomb? state pos))
       (not (on-a-bot? state pos))))

(defn remove-bad-candidates [state candidates]
  (let [board-size (size state)
        moves (zipmap candidates (map #(new-loc state %) candidates))]
    (map first (filter #(good-position? state (last %)) moves))))

(defn move-candidates []
  [[1 0] [-1 0] [0 1] [0 -1]])

(defn move [state]
  (let [candidates (remove-bad-candidates state (move-candidates))
        best-move (if (empty? candidates) [0 0] (first candidates))]
    {:direction {:x (first best-move), :y (last best-move)}, :bomb 0}))
