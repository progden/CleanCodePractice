# Clean Code Practice
用來練習 Clean Code 的範例集

以更為密集/快速的檢查壞味道並進行修改會是好的實踐。
另外確保更大規模的的修改沒有影響業務邏輯，單元測試/TDD更是提升品質關鍵。
這邊先只講壞味道(Code smells)

也應該區分清楚"看到壞味道"與"重構"兩件事，畢竟雖然重構看似更像工程師的技能，但有辦法看出有問題的地方與問題是甚麼則是更深的心法部分。

就【因果關係】來看，壞味道是個結果，導致這些壞味道的來源是甚麼? 
理解了更根本的原因、探索出可能的問題，進而利用重構來在不影響功能的情況下，進行調整。

> 「壞味道」=>「探索原因」=>「重構成更乾淨、好修改的樣子」

不要只是看到可以調整就無腦進行處理。

## Code smells - 越來越肥的 code
越來越胖的 smell 通常不會是第一次寫就會出現，而是隨著程式一次一次地修改，慢慢地出現。
(體重也是)

### Code, method, class 太長長到難改
  * Long Method (超過 5/10 行)
  * Large Class (太多職責，不夠單純)
  * Primitive Obsession (只用 primitive/語言基本結構來組織邏輯、Type/Status Code)
  * Long Parameter List(超過 3~4 個參數)
  * Data Clumps (一些重複出現的區塊，例如資料庫連線處理、操作 Excel POI 有很多固定的寫法)

### 從壞味道到開始重構

#### [Long Method 長方法](/0101_Bloater_LongMethod.md)


> 引發 Long Method 常見的情況是「花太多篇幅在做實作」。
> 
> 發現這個壞味道之後，就可以檢查「是否有清楚呈現意圖」，使用方法來寫下意圖，並且將方法的定義 (Method Signature) 寫得貼近業務面的故事。
> 
> 解決這種情況的方式就是透過 「Extract Method」、「Extract Class」、「Rename」等來呈現意圖，透過將程式碼重新組織讓太長的方法縮短。

  這些 Long Method 相關的處理方式，關鍵是讓程式的可讀性變高，並且使用物件導向的概念在重構著。

  有個稍微練習可以增加可讀性的方法，就是區分我們是在說明***過程***還是在說明***結果***。

  一般方法的命名，大多是在說明過程，而比較清楚的註解/方法名稱則是在說明成果。

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

  再來，我們也很常需要說明怎麼做的，這就好好寫在**函數的註解**上或是函數的內容**真的要說明的部分**吧。

  關於效能，在這裡會有些像是 basePrice() 的重複計算，這些真的很影響效能嗎?
  其實不會的，且在大部分商業軟體的應用場合不需要這樣考慮。

  在一些極端特殊環境(接近硬體層次的開發或者是極端注重效能演算法等)，才需要特別注意。

> 避免將界接、資料庫等藏在細節裡，把它當作一般的邏輯處理


#### [Large Class 大類別](/0102_Bloater_LargeClass.md) 

  基礎一點的事情是，類別需要是充血模型才能會有屬性+行為一起互動的狀況發生，反之，程式裡面會有很多的循序的邏輯。

  如果是光拆貧血模型的資料結構，反而很容易造成將資料拆散在很多類別，這樣不太健康，應該避免，避無可避的話，個人觀點是可以利用命名讓它們擺在一起。
  貧血模型的邏輯部分，通常會有太多的細節，而且其實不太有物件各自分工與合作的概念在裡面，也是很難得到類別重構的好處。硬做反而會讓統一個事情的業務邏輯拆在不同的類別裡。

  當類別太大並且進行拆解，很容易陷入**為拆而拆**的情境。

  拆類別前可以在 code review 時或是直接跟隔壁的同事聊聊，有沒有拆過頭。
  如果業務面沒有很多產品，或許就不需要拆出產品的基礎類別或是建立一個產品工廠類別。

  自己做的時候怎麼辦? 拆過頭的狀況在拆的當下很難看的出來、踩煞車，客觀一點的方法是稍微站遠一些，看看拆出這些類別之後，我們的程式是否還跟系統目的/業務規則符合，會是個蠻重要的觀點。
  時常工程師遇到問題，東西做不完、事情重要不重要，回到SA或是PM的角色討論時，因為他們多知道其他的資訊，其實就變得好判斷了。

#### [Primitive Obsession 基本型別偏執](/0103_Bloater_PrimitiveObsession.md)
 
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
  而真的要開始重構的時候，除了狀態外，應該是順便處理跟狀態同時出現的，在各種狀態時發生的業務邏輯，這部分重構不管是重構到同一個 class, 不同的 subclass 則是看具體的業務邏輯有多少而定了。

#### Long Parameter List

  這作為開發中一定會出現的過程，看到就慢慢重構吧。
  注意，我們是不是在重複建立相同、類似的結構。
  專案裡怎麼安放這些 DTO(Data Transfer Object，僅作為資料交換使用的物件) 比較是個問題。

#### Data Clumps (資料泥團)

  常可觀察的狀況是有個類似的 json 格式一直出現，如果是在 Java, .NET 裡可能是物件的宣告+初始化的結構，更加甚至會是 Key-Value Map/Dictionary, Array 等一些 hard code 的東西。 

  時常 copy-paste 後的結果，出現是很自然的事情喔。區分哪些事是重複的，其實要在重複的時候才會知道。
  能預先知道不是設計，是在做民俗治療(觀落陰)。
  開發前如果能想預先安排，其實需要很刻意地問這個問題【之前有沒有人寫過類似的功能?】，進一步使用物件等來處理。
  很需要團隊合作呢!!! 

## Code smells - 沒意義的邏輯

指其實明確有比較好的作法，看到應該直接調整，不要出現在程式裡面的壞味道。

### 沒意義的寫法/作法，避掉它吧!!
  * Mysterious Name (應該符合命名原則、出現在資料字典)
  * Duplicated Code (相同程式結構/流程出現)
  * Lazy Element (已經不再重要的類別/api)
  * Speculative Generality (一些為了將來的、還未發生的目的而產生的code)
  * Data Class (只有資料的類別，讓他的彈性減低吧)
  * Comments (註解是好的，但注意利用大量註解來掩飾寫不好的code的情況)

### 從壞味道到開始重構

#### [Mysterious Name 神秘的命名]()

命名是程式設計師最困難的事情之一，但有兩個可以做的事情，來協助我們做好它。

1. 做專案應該會有很多溝通&討論 (沒有的可能出事了)，溝通時常用的名詞做紀錄會有效果。
2. 留意溝通是在溝通 [意圖] 還是溝通 [作法]，溝通意圖會比較說結果、重點，此時的關鍵字會比較清楚。 溝通作法時常會有各種細節的資訊，可能會擷取太多的細節，導致不好找出關鍵字，就算是溝通作法，若可以多做一些摘要意圖的事情，也會有幫助。

第一件其實就是 **_產生專案的資料字典_**，特別是中英文翻譯，最好是程式裡面好用的英文，可以省下很多想變數的時間，也可以減少出現神秘名稱的機會。

第二件需要多花心力觀察自己的溝通、思考過程，但當意圖清楚，很多函數命名、變數命名的議題會變單純，**_函數名字寫意圖，函數內容寫做法_**。

#### [Duplicated Code 重複的程式](#)

基本的情況是複製貼上，進階點的情況是隨著重構出現重複結構。

> 需求/作法是"類似"還是"相同"，判斷會不會在不同時機分別被修改?
> 
> 會在不同時機被修改！類似；會在相同時機被修改！相同。


在複製貼上的情況中，仔細考慮下通常會是因為有類似的需求發生，所以複製來修改。

「類似」的狀況，重複應該算合理。 但回過頭來從需求落地到實作，假設為了滿足一個需求，我們需要做 3 件事情，這 3 件事是也用相同的原則來判斷，可就不一定完全都是類似了，可能有部分的事情是相同的，或許不該重複出現相同的程式碼。舉例：兩張報表，有相同的格式、提供給不同的客戶單位、產生 excel，因為兩個單位可能未來會各自提需求修改格式等，所以我們或許需要分開處理格式、查詢資料的邏輯。相同的情境下，可能可以用共用的 api 處理從 NPOI 物件到產出檔案的部分，不該各自重複。

> 透過組織、重構物件與以 Use Case 為主體的開發方式來讓系統的意圖更加明顯

在重構的情況中，當我們發現兩個類別被組織過後，有類似的目的，會放在差不多的位置 (ex. report 資料夾)，然後可以試著在兩邊重構出相同的結構，並將其提升到共用的基礎類別。
此時基礎類別也是一個基礎報表類別，提供報表相關的服務。整體來說會相對的合理。
隨著程式的重構與專案的變化，也有可能需求開始變得不一樣了，基礎類別變得不再是所有的子類別共用，也需要視情況將基礎類別根據意圖/目的進行拆分，讓程式依舊合理。

為什麼要用物件的形式來處理? 關鍵的原因是讀起來輕鬆跟如果有狀況可以藉由編譯器與IDE的提示知道，如果使用程序導向的方式，會很難發現兩張報表其實有相同的做法，就算使用 util 類別，有呼叫沒有呼叫也不會有透過IDE等工具來協助發現。 需要主動去看 util 有怎麼被呼叫、次數等。

#### [Lazy Element 冗元素]()
#### [Speculative Generality 畫大餅]()

> 避免的是因過度設計而導致"太多"額外的工作。

太大的設計 vs 小設計，關鍵其實不在設計，可能也不是"要花多久"時間，而是敏捷迭代要引導出的好處，透過在迭代內能完成 MVP、測試、收集回饋、越做越準、越做越有用、也能真正的快速起來。

設計要在迭代內能做完、重要的。
時間影響成本、影響客戶的感受，要固定周期，是限制。
工作量則受時間、能力、工作方式影響，在敏捷的觀點裡，是結果，不是原因。

遇到"沒有用到的設計"，就好好確認、移除掉它吧，還看的到就會有要探索的複雜度在，人要處理都會花額外的心力的。

#### [Data Class 資料類別]()
#### [Comments 被好註解吸引注意力而掩蓋的壞程式]()

## Code smells - 誤用物件導向

## Code smells - 難以增加新功能

## Code smells - 互相倚賴
