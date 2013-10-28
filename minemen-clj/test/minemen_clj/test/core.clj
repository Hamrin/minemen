(ns minemen-clj.test.core
  (:require [minemen-clj.core :refer :all]
            [clojure.test :refer :all]
            [clojure.data.json :as json]))

(deftest test-board
  (testing "location"
    (is (= [0 0] (loc {"board" [[ 0  "e"] ["e" "e"]], "yourID" 0})))
    (is (= [0 1] (loc {"board" [["e"  0 ] ["e" "e"]], "yourID" 0})))
    (is (= [1 0] (loc {"board" [["e" "e"] [ 0  "e"]], "yourID" 0})))
    (is (= [1 1] (loc {"board" [["e" "e"] ["e"  0 ]], "yourID" 0}))))

  (testing "size of board"
    (is (= [0 0] (size {"board" []})))
    (is (= [1 1] (size {"board" [["e"]]})))
    (is (= [1 2] (size {"board" [["e" "e"]]})))
    (is (= [2 1] (size {"board" [["e"] ["e"]]}))))

  (testing "find gold"
    (let [gold (find-gold {"yourID" 0
                           "board" [[ 1  "g" "g"]
                                    ["e"  0  "g"]
                                    ["e" "b" "b"]]})]
      (is (= 3 (count gold)))
      (is (seq-contains? [0 1] gold))
      (is (seq-contains? [0 2] gold))
      (is (seq-contains? [1 2] gold))))

  (testing "find bombs"
    (let [bombs (find-bombs {"yourID" 0
                             "board" [["b" "e" "g"]
                                      [ 1   0  "g"]
                                      ["b" "b" "b"]]})]
      (is (= 4 (count bombs)))
      (is (seq-contains? [0 0] bombs))
      (is (seq-contains? [2 0] bombs))
      (is (seq-contains? [2 1] bombs))
      (is (seq-contains? [2 2] bombs))))

  (testing "find bots"
    (let [bots (find-bots {"yourID" 0
                           "board" [["b" "e"  1 ]
                                    ["e"  0  "g"]
                                    ["b"  2   3 ]]})]
      (is (= 3 (count bots)))
      (is (seq-contains? [0 2] bots))
      (is (seq-contains? [2 1] bots))
      (is (seq-contains? [2 2] bots))))

  (testing "new location"
    (let [state {"yourID" 0
                 "board" [["e" "e" "e"]
                          ["e"  0  "e"]
                          ["e" "e" "e"]]}]
      (is (= [1 0] (new-loc state [0 -1])))
      (is (= [1 2] (new-loc state [0 1])))
      (is (= [0 1] (new-loc state [-1 0])))
      (is (= [2 1] (new-loc state [1 0]))))))

(deftest test-move
  (testing "don't move off the top of the board"
    (let [state {"yourID" 0, "board" [[0] ["e"]]}]
      (is (= {:x  1, :y  0} (:direction (move state))))))

  (testing "don't move off the bottom of the board"
    (let [state {"yourID" 0, "board" [["e"] [0]]}]
      (is (= {:x  -1, :y  0} (:direction (move state))))))

  (testing "don't move off the left of the board"
    (let [state {"yourID" 0, "board" [[0 "e"]]}]
      (is (= {:x  0, :y  1} (:direction (move state))))))

  (testing "don't move off the right of the board"
    (let [state {"yourID" 0, "board" [["e" 0]]}]
      (is (= {:x  0, :y  -1} (:direction (move state))))))
  
  (testing "don't move anywhere if you're stuck"
    (let [state {"yourID" 0, "board" [[0]]}]
      (is (= {:x  0, :y  0} (:direction (move state))))))

  (testing "don't run into bombs"
    (let [state {"yourID" 0, "board" [["b" 0 "b"]]}]
      (is (= {:x  0, :y  0} (:direction (move state))))))

  (testing "don't run into bots"
    (let [state {"yourID" 0, "board" [[1 0 2]]}]
      (is (= {:x  0, :y  0} (:direction (move state)))))))
