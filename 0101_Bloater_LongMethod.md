* Long Method -> Replace Temp with Query
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
  
  我們有個 Product 類別，quantity, itemPrice 是他的欄位/屬性。

  分析的時候，__**購買產品時**__ 有購買數量跟產品單價，__**計算價格時**__ 如果總金額大於1000可以打95折，否則打98折。


* Long Method -> Introduce Parameter Object
* Long Method -> Preserve Whole Object
  ```java
  int low = daysTempRange.GetLow();
  int high = daysTempRange.GetHigh();
  bool withinPlan = plan.WithinRange(low, high);
  ```
  ```java
  bool withinPlan = plan.WithinRange(daysTempRange);
  ```
* Long Method -> Extract Method

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

* Long Method -> Replace Method with Method Object
  有時候整個業務邏輯關聯的資料太複雜，僅透過 Extract Method 等還是讓原來的物件太過複雜。
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

* Long Method -> Decompose Conditional
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
  ```java
  var charge = isSummer(date)
          ? SummerCharge(quantity)
          : WinterCharge(quantity);
  ```
* Long Method -> Extract Method
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
