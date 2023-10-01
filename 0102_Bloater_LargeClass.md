# Large Class 處理
## 如果有行為可以分離，使用 Extract Class

```javascript
class Person {
  get officeAreaCode() {return this._officeAreaCode;}
  get officeNumber()   {return this._officeNumber;}
```

```javascript
class Person {
  get officeAreaCode() {return this._telephoneNumber.areaCode;}
  get officeNumber()   {return this._telephoneNumber.number;}
}
class TelephoneNumber {
  get areaCode() {return this._areaCode;}
  get number()   {return this._number;}
}
```

## 如果有些行為有不同的做法實作，而且會在特定的時候使用，使用 Extract Subclass
參考 SOLID 原則的 L 里氏替換原則(Liskov Substitution Principle)
[使人瘋狂的 SOLID 原則：里氏替換原則 (Liskov Substitution Principle)](https://medium.com/%E7%A8%8B%E5%BC%8F%E6%84%9B%E5%A5%BD%E8%80%85/%E4%BD%BF%E4%BA%BA%E7%98%8B%E7%8B%82%E7%9A%84-solid-%E5%8E%9F%E5%89%87-%E9%87%8C%E6%B0%8F%E6%9B%BF%E6%8F%9B%E5%8E%9F%E5%89%87-liskov-substitution-principle-e66659344aed)

但從 code smell 角度常見發生位置是狀態的 ``switch...case`` 或是內容是區分不同時機的 ``if..else``。

這也是不容易做錯的方式，把邏輯先做完，透過 code smell + 重構形成設計。

```javascript
function createEmployee(name, type) {
    return new Employee(name, type);
}
```
Employee 裡面可能會有針對不同 type 做不同的反應的邏輯。
使用 ``Extract Subclass`` 讓各自類別處理各自應有的邏輯。
```javascript
function createEmployee(name, type) {
  switch (type) {
    case "engineer": return new Engineer(name);
    case "salesman": return new Salesman(name);
    case "manager":  return new Manager (name);
  }
```

## 如果要提供 Client 一組固定的操作，或是這個類別有要在不同的情境提供不同的操作，使用 Extract Interface

參考 SOLID 原則的 I 介面隔離原則(Interface Segregation Principle)

> 就是我沒有用到的我不需要知道

常見的狀況是，我們會寫越來越大的 Service 或是 Repository/DAO 會提供越來越多方法。
回過頭觀察一下 Client 端，其實裡面提供的 10 個方法只需要其中的三個(專屬於這個 Client 的呼叫)，可是引用了整個類別其實目的很不清楚。
進行 ``Extract Interface`` 可以讓這兩個類別的耦合變得清楚。

* 這個跟 ```Extract Superclass``` 有點類似?

當我們有兩個類別有出現相同的程式碼的時候，``Extract superclass``可以減少重複，甚至經過不斷的重構，這些類似的子類可能會消滅僅靠父類別就可以完成，原來的工作也不一定。

``Extract Interface`` 減少跟呼叫端的耦合。``Extract Superclass`` 減少程式碼的重複。


* 類別不就要有很多介面?

當出現這個狀況時，說不定要考慮看看類別是不是太大，有太多事情被放在一起了?

參考 SOLID 原則的 S 單一職責原則(Single Responsibility Principle)


## 類別中有原始資料和因應資料做反應的狀況，GUI是個常見的使用情境，使用 Duplicate Observed Data

> Web 不適用，但可以說一說

簡單說是核心的資料是較穩定不變化的，它的運算規則也是，但 UI 容易改變，甚至是要支援多種 UI 的情況也很容易發生。
將類別好好區分出資料與其運算獨立出來，UI的操作變得更乾淨。

這其實是 Observer 設計模式的應用。也就是 GUI 擁有一個核心資料模型，當狀態更新，由模型來主動觸發更新。

以上適用在所有東西都自己刻的傳統應用程式上。

> for Web

因為通常的 Web 框架已經幫我們區分開 View 與 API 了，而且允許其作非同步的呼叫，傳遞後端處理好的結果，前端應該僅需要做呈現而已。
但這裡不好處理的是後端到前端的 call back 與網路的不穩定，所以前面方式不那麼單純適用在 Web 前後端的形式。

但很類似的前端接收到後端提供資訊後，再來做視覺狀態的更新，雖然起頭是主動呼叫，但現在的前端開發模式，也試著在脫鉤這個連結。
前端可以試著參考原生的 ``Proxy`` 或是前端框架提供(React, Vue, Angular)也都支援的模型綁定，在或者是脫鉤框架使用 RxJS 來完成。

最終的議題就變得比較是，將很多視覺、互動邏輯回歸到前端的 SPA，必須要在前端做狀態的儲存管理的狀況了。
