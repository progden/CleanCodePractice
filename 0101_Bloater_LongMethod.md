# Long Method
## 要減少方法的行數，使用 Extract Method。
### Extract Method
> 要注意攤水平的，呈現物件的互動，儘量避免深度太深


  ```java
  void PrintOwing()
  {
    this.PrintBanner();

    // Print details.
    Console.WriteLine("name: " + this.name);
    Console.WriteLine("amount: " + this.GetOutstanding());
  }
  ```
  ```java
  void PrintOwing()
  {
    this.PrintBanner();
    this.PrintDetails();
  }

  void PrintDetails()
  {
    Console.WriteLine("name: " + this.name);
    Console.WriteLine("amount: " + this.GetOutstanding());
  }
  ```

## 如果區域變數或是參數干擾 Extract Method，使用 **Replace Temp with Query**, **Introduce Parameter Object**, **Preserve Whole Object**
### Replace Temp with Query

  basePrice 是從類別的欄位計算出來 (quantity, itemPrice) 的暫存變數;
  ```java
  public double CalculateTotal() 
  {
      double basePrice = quantity * itemPrice;
      if (basePrice > 1000)
      {
          return basePrice * 0.95;
      }
      else
      {
          return basePrice * 0.98;
      }
  }
  ```
  extract method (extract 屬於這個物件的屬性部分)
  ```java
  public double CalculateTotal() 
  {
      double basePrice = BasePrice();
      if (basePrice > 1000)
      {
          return basePrice * 0.95;
      }
      else
      {
          return basePrice * 0.98;
      }
  }
  private double BasePrice(){
    return quantity * itemPrice;
  }
  ```
  inline method
  ```java
  public double CalculateTotal()
  {
    if (BasePrice() > 1000)
    {
      return BasePrice() * 0.95;
    }
    else
    {
      return BasePrice() * 0.98;
    }
  }
  
  private double BasePrice()
  {
    return quantity * itemPrice;
  }
  ```
  if..else 轉換成 三元運算。
  ```java
  public double CalculateTotal()
  {
    return BasePrice() > 1000
      ? BasePrice() * 0.95
      : BasePrice() * 0.98;
  }
  
  private double BasePrice()
  {
    return quantity * itemPrice;
  }
  ```
  
  有個 Product 類別，quantity, itemPrice 是他的欄位/屬性。

  分析的時候，__**購買產品時**__ 有購買數量跟產品單價，__**計算價格時**__ 如果總金額大於1000可以打95折，否則打98折。
  
  結果來說也更符合業務邏輯。

### Introduce Parameter Object & Preserve Whole Object

  ```java
  int low = daysTempRange.GetLow();
  int high = daysTempRange.GetHigh();
  bool withinPlan = plan.WithinRange(low, high);
  ```
  ```java
  bool withinPlan = plan.WithinRange(daysTempRange);
  ```
## 方法太複雜可以將整個方法移到獨立的物件，使用 **Replace Method with Method Object**
### Replace Method with Method Object
  有時候整個業務邏輯關聯的資料太複雜，僅透過 Extract Method 等還是讓原來的物件太過複雜。
  下

  ```java
  public class Order
  {
    // ...
    public double Price()
    {
      double primaryBasePrice;
      double secondaryBasePrice;
      double tertiaryBasePrice;
      // Perform long computation.
    }
  }
  ```

  ```java
  public class Order 
  {
    // ...
    public double Price() 
    {
      return new PriceCalculator(this).Compute();
    }
  }

  public class PriceCalculator 
  {
    private double primaryBasePrice;
    private double secondaryBasePrice;
    private double tertiaryBasePrice;
    
    public PriceCalculator(Order order) 
    {
      // Copy relevant information from the
      // order object.
    }
    
    public double Compute() 
    {
      // Perform long computation.
    }
  }
  ```
## 條件運算(if..else..)或是迴圈也是提示，可以進行抽取，條件使用 **Decompose Conditional**，迴圈使用 **Extract Method**
### Decompose Conditional
  ```java
  if (date < SUMMER_START || date > SUMMER_END) 
  {
    charge = quantity * winterRate + winterServiceCharge;
  }
  else 
  {
    charge = quantity * summerRate;
  }
  ```
  ``date``是區域變數，``SUMMER_START``跟``SUMMER_END``是類別的欄位，進行 ``Extract Method``。
  兩個計算的業務規則中，``quantity``是區域變數，``winterRate``, ``summerRate``, ``winterServiceCharge`` 是類別的的欄位，使用``Extract Method``。
  ```java
  if (isSummer(date))
  {
    charge = SummerCharge(quantity);
  }
  else 
  {
    charge = WinterCharge(quantity);
  }
  ```
  因為主要結果是要取得收取的費用，凸顯 charge，改用三元運算合併條件邏輯。
  ```java
  var charge = isSummer(date)
          ? SummerCharge(quantity)
          : WinterCharge(quantity);
  ```
### Extract Method

  一些邏輯處理與迴圈會有常見的耦合，這情境常見，如果沒有及早處理容易越來越複雜。
  ```java
  void printProperties(IList users)
  {
    for (int i = 0; i < users.size(); i++)
    {
      string result = "";
      result += users.get(i).getName();
      result += " ";
      result += users.get(i).getAge();
      Console.WriteLine(result);

      // ...
    }
  }
  ```
  針對 ``users.get(i)`` 進行 ``Extract Local Variable``
  ```java
  void printProperties(IList users)
  {
    for (int i = 0; i < users.size(); i++)
    {
      User user = users.get(i);
      
      string result = "";
      result += user.getName();
      result += " ";
      result += user.getAge();
      Console.WriteLine(result);

      // ...
    }
  }
  ```
  將 Temp/Local 進行 ``Extract Method``
  ```java
  void printProperties(IList users)
  {
    for (int i = 0; i < users.size(); i++)
    {
      User user = users.get(i);
      string result = getProperties(user);
      Console.WriteLine(result);

      // ...
    }
  }
  
  string getProperties(User user) {
    string result = "";
    result += user.getName();
    result += " ";
    result += user.getAge();
    return result;
  }
  ```
  ``result`` 是一個單一流程的 temp，合併成一句。
  ```java
  void printProperties(IList users)
  {
    foreach (User user in users)
    {
      Console.WriteLine(getProperties(user));

      // ...
    }
  }
  
  string getProperties(User user)  
  {
    return user.getName() + " " + user.getAge();
  }
  ```
  因為 ``getProperties`` 的內容僅跟 ``User`` 類別有關，可以使用 ``Move instance method``
  ```java
  void printProperties(IList users)
  {
    foreach (User user in users)
    {
      Console.WriteLine(user.getProperties());

      // ...
    }
  }
  
  class User {
    public string getProperties() {
      return this.getName()+ " " + this.getAge();
    }
  }
  ```
  ``getName``, ``getAge`` 如果是很單純的 get，因為已經是在類別的內部了，直接使用 ``name``, ``age`` 取代。
  
  視情況，如果 ``getName``, ``getAge`` 說不定可以順便從 public 改為 private 或是直接刪除了，減少類別對外的開放/耦合。
  ```java
  void printProperties(IList users)
  {
    foreach (User user in users)
    {
      Console.WriteLine(user.getProperties());

      // ...
    }
  }
  
  class User {
    public string getProperties() {
      return this.name + " " + this.age;
    }
  }
  ```

## 萬一 Extract XXXX 完後悔了，使用 ``Inline Variable``, ``Inline Method``

### Inline Method
  
```javascript
function getRating(driver) {
  return moreThanFiveLateDeliveries(driver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(driver) {
  return driver.numberOfLateDeliveries > 5;
}
```
執行 ``Inline Method``
```javascript
function getRating(driver) {
  return (driver.numberOfLateDeliveries > 5) ? 2 : 1;
}
```

### Inline Variable
```javascript
let basePrice = anOrder.basePrice;
return (basePrice > 1000);

```
透過 ``Inline Variable`` 減少暫時變數

```javascript
return anOrder.basePrice > 1000;
```
