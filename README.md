# Clean Code Practice
用來練習 Clean Code 的範例集

## Code smells - 越來越肥的 code
越來越胖的 smell 通常不會是第一次寫就會出現，而是隨著程式一次一次地修改，慢慢地出現。
(體重也是)

以更為密集的檢查這些壞味道並進行修改會是好的實踐。
另外確保更大規模的的修改沒有影響業務邏輯，單元測試/TDD更是其中的關鍵。
這邊先只講壞味道(Code smells)

### Code, method, class 太長長到難改
  * Long Method (超過 5/10 行)
  * Large Class (太多職責，不夠單純)
  * Primitive Obsession (只用 primitive/語言基本結構來組織邏輯)
  * Long Parameter List(超過 3~4 個參數)
  * Data Dumps (一些重複出現的區塊，例如資料庫連線處理、操作 Excel POI 有很多固定的寫法)

### Code smell to Refactoring

#### [Long Method 相關重構](/0101_Bloater_LongMethod.md)
  這些 Long Method 相關的處理方式，關鍵是讓程式的可讀性變高，並且使用物件導向的概念在重構著。

  有個稍微練習可以增加可讀性的方法，就是區分我們是在說明過程還是在說明結果。 
  一般過程的命名，大多是在說明過程，而比較清楚的註解/方法名稱則是在說明成果是甚麼。

  ```java
  boolean basePrice();                          // 成果
  boolean calBasePrice();                       // 說明裡面在做什麼
  boolean getBasePriceByQuantityAndUnitPrice();     //說明裡面在做什麼 
  ```
  
  ```java
  void sort();          // 行為
  void bubbleSort();    // 實作使用的演算法
  void quickSort();
  void sortByXXXXXX();  // By XXXXX  大多跟說明內容有相關
  ```

  再來，當然我們也很常需要說明怎麼做的，這就好好寫在**函數的註解**上或是函數的內容**真的要說明的部分**吧。

  關於效能，在這裡會有些像是 basePrice() 的重複計算，這些真的很影響效能嗎?
  其實不會的，且在大部分商業軟體的應用場合不需要這樣考慮。

  在一些極端特殊環境(接近硬體層次的開發或者是極端注重效能演算法等)，才需要特別注意。

#### [Large Class 大類別](/0102_Bloater_LargeClass.md) 

  基礎一點的事情是，類別需要是充血模型才能會有屬性+行為一起互動的狀況發生，反之，程式裡面會有很多的循序的邏輯。

  如果是光拆貧血模型的資料結構，反而很容易造成將資料拆散在很多類別，這樣不太健康，應該避免，避無可避的話，個人觀點是可以利用命名讓它們擺在一起。
  貧血模型的邏輯部分，通常會有太多的細節，而且其實不太有物件各自分工與合作的概念在裡面，也是很難得到類別重構的好處。硬做反而會讓統一個事情的業務邏輯拆在不同的類別裡。

  當類別太大並且進行拆解，很容易陷入**為拆而拆**的情境。

  拆類別前可以在 code review 時或是直接跟隔壁的同事聊聊，有沒有拆過頭。
  如果業務面沒有很多產品，或許就不需要拆出產品的基礎類別或是建立一個產品工廠類別。

  自己做的時候怎麼辦? 拆過頭的狀況在拆的當下很難看的出來、踩煞車，客觀一點的方法是稍微站遠一些，看看拆出這些類別之後，我們的程式是否還跟系統目的/業務規則符合，會是個蠻重要的觀點。
  時常工程師遇到問題，東西做不完、事情重要不重要，回到SA或是PM的角色討論時，因為他們多知道其他的資訊，其實就變得好判斷了。

#### [Primitive Obsession 基本型別的誤用](/0103_Bloater_PrimitiveObsession.md)
 
  這是原罪... 加一個變數能解決的問題，怎麼會想要調整類別呢。且問題在於，3次5次10次修改後，誰還記得有類別這件事情? "好大"的修改誰敢改。
  最後就變成很多變數在程式裡面是常態，分類、整理，讓他容易讀、好修改，變成太進階的問題了。
  
  我們學習的過程中，不管 google 學、看書學、上課學的程式，都比實際的專案還 __**不複雜**__ 太多了，放在單一個網頁、書裡一到兩頁的範例已經太複雜，大家都想著怎麼寫簡單。
  但是專案的 code 動不動已經成千上萬行了。怎麼組織業務邏輯，都不是這些資源在教的東西，要意識到這是兩件事情很困難。

  練習使用物件來代替由多個變數組成的資料結構，這樣的重構是很好的練習。
  例如，日期區間的表示法，我們可以用兩個變數來表示，也可以用一個類別來表示，並且可以在類別裡面加上 ``isContains`` 確認某個日期是否在這個區間裡面。
  使用貨幣類別來判斷數值的正確性、顯示格式等，電話號碼類別來處理電話號碼的格式、驗證等。

  另外一個情況也是常見的"狀態"使用，就是狀態值的常數宣告。
  這種情況的code smell其實比較間接，當我們宣告了狀態與區別狀態的常數，宣告本身很常見，但是這些狀態連帶的使用情境，通常會連帶著很多``if..else``或是``switch..case``做處理。
  個人覺得要真正明確的code smell是後面的情境，在看到狀態常數就打算的時候，我覺得有太多情況是狀態的分析沒有還沒有弄清楚，第一時間的使用情境可能還沒出現，不宜太早重構。
  而真的要開始重構的時候，除了狀態外，應該是順便處理跟狀態同時出現的，在各種狀態時發生的業務邏輯，這部分重構不管是重構到同一個 class, 不同的 subclass 或是 state/strategy 則是看具體的業務邏輯有多少而定了。

#### [Long Parameter List]()

  這作為開發中一定會出現的過程，看到就慢慢重構吧。
  注意，我們是不是在重複建立相同、類似的結構。
  專案裡怎麼安放這些 DTO(Data Transfer Object，僅作為資料交換使用的物件) 比較是個問題。

#### [Data Dumps]()

  時常 copy-paste 後的結果，出現是很自然的事情喔。區分哪些事是重複的，其實要在重複的時候才會知道。
  能預先知道不是設計，是在做民俗治療(觀落陰)。
  開發前如果能想預先安排，其實需要很刻意地問這個問題【之前有沒有人寫過類似的功能?】。
  很需要團隊合作呢!!! 

## Code smells - 誤用物件導向

## Code smells - 難以增加新功能

## Code smells - 沒意義的邏輯

## Code smells - 互相倚賴
