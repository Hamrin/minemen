(ns minemen-clj.test.core
  (:require [minemen-clj.core :refer :all]
            [clojure.test :refer :all]
            [clojure.data.json :as json]))

(def state (json/read-str (slurp "test/minemen_clj/test/test.json")))

(deftest test-board
  (testing "coordinates returned when bot found"
    (is (= [7 7] (loc state))))

  (testing "size of board"
    (is (= [10 11] (size state))))

  (testing "find gold"
    (let [gold (find-gold state)]
      (is (= 5 (count gold)))
      (is (seq-contains? [6 0] gold))
      (is (seq-contains? [1 1] gold))
      (is (seq-contains? [2 1] gold))
      (is (seq-contains? [7 6] gold))
      (is (seq-contains? [2 7] gold))))

  (testing "find mines"
    (let [mines (find-mines state)]
      (is (= 19 (count mines)))
      (is (seq-contains? [0 1] mines))
      (is (seq-contains? [0 3] mines))
      (is (seq-contains? [2 3] mines))
      (is (seq-contains? [3 3] mines))
      (is (seq-contains? [4 3] mines))
      (is (seq-contains? [2 5] mines))
      (is (seq-contains? [6 9] mines)))))