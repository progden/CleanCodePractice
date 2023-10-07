# Primitive Obsession 處理

## 如果類別有很多基本型別的屬性，且邏輯上是可以做分作同類，使用 Replace Data Value with Object 重構。
觀察這些資料與其相關的行為，是否可以被一個類別所取代。

````java
class Order {
    String customer;
    String roleId;
    
    public login() {
        if(roleId == "admin") {
            System.out.println("admin login");
        }
    }
}
````

````java
class Order {
    Customer customer;
    
    public login() {
        if(customer.isAdmin()) {
            System.out.println("admin login");
        }
    }
}
````

## 如果是在函數的參數上，使用 Introduce Parameter Object 或是 Preserve Whole Object 重構。

作法是將這些基本型別的參數包成一個類別，並且將這個類別當作參數傳入。
假設前面傳進了 low, high 變數，可以進一步找出合適的概念時。

```java
boolean withinPlan = plan.withinRange(low, high);
```
建立類別 & 建構式
```java
boolean withinPlan = plan.withinRange(low, high);
        
class TempRange {
    private int low;
    private int high;
    
    public TempRange(int low, int high) {
        this.low = low;
        this.high = high;
```
增加一個使用建構式，並且將原本的參數傳入。
```java    
boolean withinPlan = plan.withinRange(low, high, new TempRange(low, high));

class Plan{
    boolean withinRange(int low, int high, TempRange range){
        // change low, high to range.low, range.high
    }
}
```
移除原本的 low, high 參數
```java    
boolean withinPlan = plan.withinRange(new TempRange(low, high));

class Plan{
    boolean withinRange(TempRange range){
        // change low, high to range.low, range.high
    }
}
```

``Preserve whole object`` 就比較簡單
```java
int low = range.getLow();
int high = range.getHigh();
boolean withinPlan = plan.withinRange(low, high);
```
只是使用原來的"合理物件"，流程同前。
```java
boolean withinPlan = plan.withinRange(range);

class Plan{
    boolean withinRange(TempRange range){
        // change low, high to range.low, range.high
    }
}
```

