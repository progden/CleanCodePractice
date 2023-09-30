# Clean Code Practice
用來練習 Clean Code 的範例集

## Code smells - 越來越肥的 code
越來越胖的 smell 通常不會是第一次寫就會出現，而是隨著程式一次一次地修改，慢慢地出現。
(體重也是)

以更為密集的檢查這些壞味道並進行修改會是好的實踐。
另外確保更大規模的的修改沒有影響業務邏輯，單元測試/TDD更是其中的關鍵。
這邊先只講壞味道(Code smells)

* Code, method, class 太長長到難改
  * Long Method (超過 5/10 行)
  * Large Class (太多職責，不夠單純)
  * Primitive Obsession (只用 primitive/語言基本結構來組織邏輯)
  * Long Parameter List(超過 3~4 個參數)
  * Data Dumps (一些重複出現的區塊，例如資料庫連線處理、操作 Excel POI 有很多固定的寫法)

* Code smell to Refactoring

  * [Long Method 相關重構](/0101_Bloater_LongMethod.md)
  
    這些 Long Method 相關的處理方式，關鍵是讓程式的可讀性變高，並且使用物件導向的概念在重構著。
  
    有個稍微練習可以增加可讀性的方法，就是區分我們是在說明過程還是在說明結果。 
    一般過程的命名，大多是在說明過程，而比較清楚的註解/方法名稱則是在說明成果是甚麼。

    ```java
    boolean basePrice();
    boolean calBasePrice();
    boolean getBasePriceByQuantityAndUnitPrice();
    ```
    
    ```java
    void sort();
    void bubbleSort();
    void quickSort();
    void sortByXXXXXX();
    ```
    再來，當然我們也很常需要說明怎麼做的，這就好好寫在函數的註解上或是函數的內容真的要說明的部分吧。

    關於效能，在這裡會有些像是 basePrice() 的重複計算，這些真的很影響效能嗎?
    其實不會的，且在大部分商業軟體的應用場合不需要這樣考慮。

    在一些極端特殊環境(接近硬體層次的開發或者是極端注重效能演算法等)，才需要特別注意。

  * [Large Class 大類別](/0102_Bloater_LargeClass.md) 

    當類別太大並且進行拆解，很容易陷入 __**為拆而拆**__ 的情境。
  
    拆類別前可以在 code review 時或是直接跟隔壁的同事聊聊，有沒有拆過頭。
    如果業務面沒有很多產品，或許就不需要拆出產品的基礎類別或是建立一個產品工廠類別。

    自己做的時候怎麼辦? 拆過頭的狀況在拆的當下很難看的出來、踩煞車，客觀一點的方法是稍微站遠一些，看看拆出這些類別之後，我們的程式是否還跟系統目的/業務規則符合，會是個蠻重要的觀點。
    時常工程師遇到問題，東西做不完、事情重要不重要，回到SA或是PM的角色討論時，因為他們多知道其他的資訊，其實就變得好判斷了。

## Code smells - 誤用物件導向

## Code smells - 難以增加新功能

## Code smells - 沒意義的邏輯

## Code smells - 互相倚賴
