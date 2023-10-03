using System;
using System.Configuration;
using Microsoft.Data.SqlClient;
using NLog;

namespace RECCasesRemovalTask
{
    internal class Program
    {
        private static Logger logger = LogManager.GetCurrentClassLogger();

        [STAThread]
        static void Main(string[] args)
        {
            // 取得資料庫連線資訊
            string _connectionString = ConfigurationManager.ConnectionStrings["DbEntities"].ConnectionString;

            // 取得 Stored Procedure 名稱
            string _storedProcedureName = ConfigurationManager.AppSettings["ExecStoredProcedureName"].ToString();

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(_storedProcedureName, connection))
                    {
                        command.CommandTimeout = 0;

                        command.CommandType = System.Data.CommandType.StoredProcedure;

                        // 設定輸出參數 (ReturnMessage、ErrorMessage)
                        SqlParameter returnMessageParam = new SqlParameter("@ReturnMessage", System.Data.SqlDbType.NVarChar, -1);   // 設為 -1 支援 NVARCHAR(MAX) 最大長度
                        returnMessageParam.Direction = System.Data.ParameterDirection.Output;
                        command.Parameters.Add(returnMessageParam);

                        SqlParameter errorMessageParam = new SqlParameter("@ErrorMessage", System.Data.SqlDbType.NVarChar, -1);     // 設為 -1 支援 NVARCHAR(MAX) 最大長度
                        errorMessageParam.Direction = System.Data.ParameterDirection.Output;
                        command.Parameters.Add(errorMessageParam);

                        // 執行預存程序 (Stored Procedure)
                        command.ExecuteNonQuery();

                        // 取得輸出的參數值 (@ReturnMessage、@ErrorMessage)
                        string returnMessage = returnMessageParam.Value.ToString();
                        string errorMessage = errorMessageParam.Value.ToString();

                        if (!string.IsNullOrWhiteSpace(errorMessage))
                        {
                            logger.Error(errorMessage);
                        }

                        if (!string.IsNullOrWhiteSpace(returnMessage))
                        {
                            logger.Info(returnMessage);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error($"下架程式 RECCasesRemovalTask 發生錯誤: {ex.Message}");
            }
        }
    }
}
