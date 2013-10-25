(ns minemen-clj.test.core
  (:require [minemen-clj.core :refer :all]
            [clojure.test :refer :all]
            [clojure.data.json :as json]))

(def state (json/read-str (slurp "test/minemen_clj/test/test.json")))

(deftest test-board
  (testing "coordinates returned when bot found"
    (is (= [7 7] (loc state))))

  (testing "size of board"
    (is (= [11 10] (size state)))))
