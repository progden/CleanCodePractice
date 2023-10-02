package com.rpwis.fubon.method;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.apache.commons.io.FileUtils;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.rpwis.fubon.config.Constants;
import com.rpwis.fubon.entity.po.ReportConfig;
import com.rpwis.fubon.entity.vo.ActionLogViewVo;
import com.rpwis.fubon.service.ConfigurationService;
import com.rpwis.fubon.service.ReportService;
import com.rpwis.fubon.utils.ResourceFileUtil;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Connection;
import java.sql.Timestamp;

@Component
public class SendReport {

    @Autowired
    private ReportService reportService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ResourceFileUtil rfu;

    @Autowired
    private ConfigurationService config;

    private static final Logger logger = LoggerFactory.getLogger(SendReport.class);

    private ClassLoader classLoader = getClass().getClassLoader();

    private int sendDayOfMonth = 1;
    private DayOfWeek sendDayOfWeek = DayOfWeek.MONDAY;
    private DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private String tempFolderPath = "/temp/";
    private StringBuilder pdfPathSB = new StringBuilder();

    public void doIt(){
        logger.info("報表排程開始");
        List<ReportConfig> allConfig = reportService.findAllConfig();
        LocalDate today = LocalDate.now();
        //比對每個報表的排程設定與當日
        for(ReportConfig tmpConfig : allConfig){
            logger.info("{} start", tmpConfig.getReportName());
            String emails = tmpConfig.getEmailList();
            if(emails==null || emails.isEmpty()){
                logger.info("{} has no e-mail", tmpConfig.getReportName());
                continue;
            }

            boolean monthCheck = tmpConfig.getCycleRule().equals("month") && today.getDayOfMonth() == sendDayOfMonth;
            boolean weekCheck = tmpConfig.getCycleRule().equals("week") && today.getDayOfWeek().equals(sendDayOfWeek);
            if(monthCheck || weekCheck/* || true*/ ){
                setDateTimeRange(tmpConfig.getReportName(), tmpConfig.getCycleRule());
                if(!pdfPathSB.toString().isEmpty()){
                    sendReport(tmpConfig.getEmailList().split(";"), pdfPathSB.toString());
                    pdfPathSB.setLength(0);
                }
            }
        }
    }

    //設定時間區間
    public void setDateTimeRange(String reportName, String cycleRule){
        Date startTime = null;
        Date endTime = null;
        
        //設定查詢的起始時間
        Calendar calendarEnd = Calendar.getInstance();
        calendarEnd.set(Calendar.HOUR_OF_DAY, 0);
        calendarEnd.set(Calendar.MINUTE, 0);
        calendarEnd.set(Calendar.SECOND, 0);
        calendarEnd.set(Calendar.MILLISECOND, 0);

        Calendar calendarStart = Calendar.getInstance();
        calendarStart.setTimeInMillis(calendarEnd.getTimeInMillis());
        if(cycleRule.equals("week")){
            calendarStart.add(Calendar.DAY_OF_MONTH, -7);
        }
        else{
            calendarStart.add(Calendar.MONTH, -1);
        }
        startTime = calendarStart.getTime();
        System.out.println("----------"+startTime+"---------");
        
        //設定查詢的結束時間
        // calendarEnd.add(Calendar.DAY_OF_MONTH, 1);
        calendarEnd.add(Calendar.MILLISECOND, -1);
        endTime = calendarEnd.getTime();
        System.out.println("----------"+endTime+"---------");

        try {
            Files.createDirectories(Paths.get(tempFolderPath));
            if (reportName.equals(Constants.Report.REPORT1)){
                createActionLogReport(reportName, startTime, endTime);
            }
            else{
                createAsusCloudReport(reportName, startTime, endTime);
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }

    }

    //建立異動日誌報表(report1)
    private void createActionLogReport(String reportName, Date startTime, Date endTime){
        try {
            String fileName = String.format("%s.html", reportName);
            // File file = new File(classLoader.getResource(initHtml).getFile());
            File htmlFile = rfu.getFileInJar(reportName, ".html");
            String htmlString = FileUtils.readFileToString(htmlFile, "UTF-8");
            
            String condition = String.format("%s~%s", dateFormat.format(startTime), dateFormat.format(endTime));
            htmlString = htmlString.replace("$time", condition);

            List<ActionLogViewVo> actionLogs = reportService.findActionLogsByDate(startTime, endTime);
            StringBuilder sb = new StringBuilder();
            for(ActionLogViewVo tmpLog : actionLogs){
                sb.append("                    <tr>\n");
                sb.append(String.format("                        <td>%s</td>\n", dateFormat.format(tmpLog.getCreateTime())));
                sb.append(String.format("                        <td>%s</td>\n", tmpLog.getEmpName()));
                sb.append(String.format("                        <td>%s</td>\n", tmpLog.getAction()));
                sb.append(String.format("                        <td>%s</td>\n", tmpLog.getDetail()));
                sb.append("                    </tr>\n");
            }
            htmlString = htmlString.replace("$tableData", sb.toString());

            File newHtmlFile = new File(String.format("%s%s",tempFolderPath,fileName));
            FileUtils.writeStringToFile(newHtmlFile, htmlString, "UTF-8");

            html2pdf(newHtmlFile);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }
    }
    
    //建立華碩雲 管理者登入報表(report2)、用戶使用記錄(report3)
    private void createAsusCloudReport(String reportName, Date startTime, Date endTime){
        try{
            String fileName = String.format("%s.html", reportName);
            // File file = new File(classLoader.getResource(fileName).getFile());
            File htmlFile = rfu.getFileInJar(reportName, ".html");
            String htmlString = FileUtils.readFileToString(htmlFile, "UTF-8");

            String condition = String.format("%s~%s", dateFormat.format(startTime), dateFormat.format(endTime));
            htmlString = htmlString.replace("$time", condition);
            String data = mssqlData(reportName, startTime, endTime);
            htmlString = htmlString.replace("$tableData", data);

            File newHtmlFile = new File(String.format("%s%s",tempFolderPath,fileName));
            FileUtils.writeStringToFile(newHtmlFile, htmlString, "UTF-8");

            html2pdf(newHtmlFile);
        }
        catch (Exception e){
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }
    }

    //連接華碩雲mssql 取報表資料
    private String mssqlData(String reportName, Date startTime, Date endTime){
        logger.info("Report Name: " + reportName);
        String data="";
        try {
            //DB連線資訊
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            String dbHost = config.getConfigByName(Constants.OmnistorDB.HOST);
            String dbPort = config.getConfigByName(Constants.OmnistorDB.PORT);
            String dbName = config.getConfigByName(Constants.OmnistorDB.DB_NAME);
            String connUrl = String.format("jdbc:sqlserver://%s:%s;databaseName=%s;encrypt=true;trustServerCertificate=true;", dbHost, dbPort, dbName);
            String dbUserName = config.getConfigByName(Constants.OmnistorDB.USER);
            String dbPassword = config.getConfigByName(Constants.OmnistorDB.PWD);
            Connection conn = DriverManager.getConnection(connUrl, dbUserName, dbPassword);
            PreparedStatement ps;

            StringBuilder sb = new StringBuilder();
            //管理者登入報表
            if(reportName.equals(Constants.Report.REPORT2)){
                String sql = "SELECT * FROM Fubon_OSM_Report WHERE ActionTime BETWEEN ? AND ?";
                ps = conn.prepareStatement(sql);
                ps.setTimestamp(1, new Timestamp(startTime.getTime()));
                ps.setTimestamp(2, new Timestamp(endTime.getTime()));
                try (ResultSet rs = ps.executeQuery()){
                    while(rs.next()){
                        Date actionTime = rs.getTimestamp("ActionTime");
                        String actionAccount = rs.getString("ActionAccount");
                        String actionType = rs.getString("ActionType");
                        String clientIp = rs.getString("ClientIP");
                        String deviceInfo = (rs.getString("DeviceInfo")==null)? "" : rs.getString("DeviceInfo");
                        sb.append("                    <tr>\n");
                        sb.append(String.format("                        <td>%s</td>\n", dateFormat.format(actionTime)));
                        sb.append(String.format("                        <td>%s</td>\n", actionAccount));
                        sb.append(String.format("                        <td>%s</td>\n", actionType));
                        sb.append(String.format("                        <td>%s</td>\n", clientIp));
                        sb.append(String.format("                        <td>%s</td>\n", deviceInfo));
                        sb.append("                    </tr>\n");
                    }
                    data = sb.toString();
                }
            }
            //用戶使用記錄
            else if(reportName.equals(Constants.Report.REPORT3)){
                String sql = "SELECT * FROM Fubon_UserAction_Report WHERE [Operation time] BETWEEN ? AND ?";
                ps = conn.prepareStatement(sql);
                ps.setTimestamp(1, new Timestamp(startTime.getTime()));
                ps.setTimestamp(2, new Timestamp(endTime.getTime()));
                try (ResultSet rs = ps.executeQuery()){
                    while(rs.next()){
                        Date loginDate = rs.getTimestamp("Operation time");
                        String userAccount = rs.getString("Action user");
                        String userName = rs.getString("Nickname");
                        String clientVer = rs.getString("Cllient(version)");
                        String clientIp = rs.getString("IP");
                        String deviceInfo = (rs.getString("Device Info")==null)? "" : rs.getString("Device Info");
                        String action = rs.getString("Action");
                        String type = rs.getString("Type");
                        String fileSize = (rs.getString("File size(bype)")==null)? "" : rs.getString("File size(bype)");
                        String orgPath = (rs.getString("Original Path")==null)? "" : rs.getString("Original Path");
                        String orgName = (rs.getString("Original Name")==null)? "" : rs.getString("Original Name");
                        String newPath = (rs.getString("New Path")==null)? "" : rs.getString("New Path");
                        String newName = (rs.getString("New Name")==null)? "" : rs.getString("New Name");
                        String otherInfo = (rs.getString("Other info")==null)? "" : rs.getString("Other info");

                        sb.append("                    <tr>\n");
                        sb.append(String.format("                        <td>%s</td>\n", dateFormat.format(loginDate)));
                        sb.append(String.format("                        <td>%s</td>\n", userAccount));
                        sb.append(String.format("                        <td>%s</td>\n", userName));
                        sb.append(String.format("                        <td>%s</td>\n", clientVer));
                        sb.append(String.format("                        <td>%s</td>\n", clientIp));
                        sb.append(String.format("                        <td>%s</td>\n", deviceInfo));
                        sb.append(String.format("                        <td>%s</td>\n", action));
                        sb.append(String.format("                        <td>%s</td>\n", type));
                        sb.append(String.format("                        <td>%s</td>\n", fileSize));
                        sb.append(String.format("                        <td>%s</td>\n", orgPath));
                        sb.append(String.format("                        <td>%s</td>\n", orgName));
                        sb.append(String.format("                        <td>%s</td>\n", newPath));
                        sb.append(String.format("                        <td>%s</td>\n", newName));
                        sb.append(String.format("                        <td>%s</td>\n", otherInfo));
                        sb.append("                    </tr>\n");
                    }
                    data = sb.toString();
                }
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }
        return data;
    }

    //html轉pdf
    private void html2pdf(File htmlFile){
        try{
            String pdfName = htmlFile.getName().replace("html", "pdf");
            pdfPathSB.setLength(0);
            pdfPathSB.append(tempFolderPath.concat(pdfName));
            String pdfPath = pdfPathSB.toString();

            Document document = Jsoup.parse(htmlFile, "UTF-8");
            document.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
            String baseUri = classLoader.getResource("bootstrap-tableonly.css").toURI().toString();
            System.out.println(baseUri);

            try (OutputStream os = new FileOutputStream(pdfPath)) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.toStream(os);
                builder.withW3cDocument(new W3CDom().fromJsoup(document), baseUri);
                // builder.useFont(new File(classLoader.getResource("Microsoft-Yahei.ttf").getFile()), "Microsoft-Yahei");
                builder.useFont(rfu.getFileInJar("Microsoft-Yahei",".ttf"), "Microsoft-Yahei");
                builder.run();
            }
        }
        catch (Exception e){
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }
    }

    private void sendReport(String[] toList, String pathToAttachment){
        MimeMessage message = mailSender.createMimeMessage();
        String from = config.getConfigByName(Constants.Smtp.FROM);
        String fromName = config.getConfigByName(Constants.Smtp.FROM_NAME);
        
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(new InternetAddress(from, fromName));
            helper.setTo(toList);
            helper.setSubject(fromName);
            helper.setText("請確認報表附件");
            FileSystemResource file = new FileSystemResource(new File(pathToAttachment));
            helper.addAttachment(file.getFilename(), file);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public boolean  deleteFolder(File folder){
        File[] allContents = folder.listFiles();
        if(allContents != null){
            for(File f:allContents){
                deleteFolder(f);
            }
        }
        return folder.delete();
    }
}
