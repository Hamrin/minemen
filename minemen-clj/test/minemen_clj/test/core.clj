(ns minemen-clj.test.core
  (:require [minemen-clj.core :refer :all]
            [clojure.test :refer :all]
            [clojure.data.json :as json]))

(def state (json/read-str (slurp "test/minemen_clj/test/test.json")))

(deftest test-board
  (testing "coordinates returned when bot found"
    (is (= [7 7] (loc state))))

  (testing "size of board"
    (is (= [11 10] (size state))))

  (testing "find gold"
    (let [gold (find-gold state)]
      (is (= 5 (count gold)))
      (is (seq-contains? [0 6] gold))
      (is (seq-contains? [1 1] gold))
      (is (seq-contains? [1 2] gold))
      (is (seq-contains? [6 7] gold))
      (is (seq-contains? [7 2] gold))))

  (testing "find mines"
    (let [mines (find-mines state)]
      (is (= 19 (count mines)))
      (is (seq-contains? [1 0] mines))
      (is (seq-contains? [3 0] mines))
      (is (seq-contains? [3 2] mines))
      (is (seq-contains? [3 3] mines))
      (is (seq-contains? [3 4] mines))
      (is (seq-contains? [5 2] mines))
      (is (seq-contains? [9 6] mines))))

  (testing "find bots"
    (let [bots (find-bots state)]
      (is (= 1 (count bots)))
      (is (seq-contains? [5 7] bots)))))
