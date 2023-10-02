package hwcertlab.baray.controller;

import hwcertlab.baray.db.ExpandCarrierBandTool;
import hwcertlab.baray.entity.CarrierField;
import hwcertlab.baray.entity.ResponseType;
import hwcertlab.baray.entity.TestPlanCreateType;
import hwcertlab.baray.service.ParameterService;
import hwcertlab.baray.service.TestPlanService;
import hwcertlab.baray.util.JsonUtil;
import hwcertlab.web.framework.model.carrier.spanner.DocSpec;
import hwcertlab.web.framework.model.carrier.spanner.TestPlanColumnMap;
import hwcertlab.web.framework.model.carrier.spanner.TestPlanRaw;
import hwcertlab.web.framework.tool.GoogleSheetTool;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/testplan")
public class TestPlanController {

    private final JsonUtil jsonUtil;
    private final TestPlanService testPlanService;
    private final ParameterService parameterService;

    TestPlanController(JsonUtil jsonUtil, TestPlanService testPlanService, ParameterService parameterService){
        this.jsonUtil = jsonUtil;
        this.testPlanService = testPlanService;
        this.parameterService = parameterService;
    }

    @GetMapping("/initData")
    public ResponseType getInitData(){
        ResponseType response = new ResponseType();
        HashMap<String, Object> data = new HashMap<>();
        data.put("carriers", parameterService.selectParameterValueByName("carrierName"));
        data.put("specs", parameterService.selectParameterValueByName("docGroup"));
        data.put("versions", testPlanService.getVersions());
        response.setData(data);
        return response;
    }

    @GetMapping("/mappingName")
    public ResponseType getMappingName(@RequestParam String carrier){
        ResponseType response = new ResponseType();
        response.setCode(0);
        response.setData(testPlanService.getMappingNameByCarrier(carrier));
        return response;
    }

    @GetMapping("/mappingNameExist")
    public ResponseType isMappingExist(@RequestParam String mappingName){
        ResponseType response = new ResponseType();
        response.setCode(0);
        response.setData(testPlanService.isMappingNameExist(mappingName));
        return response;
    }

    @GetMapping("/query")
    public ResponseType query(@RequestParam(required = false, defaultValue = "") String carrier,
                              @RequestParam(required = false, defaultValue = "") String version,
                              @RequestParam(required = false, defaultValue = "") String spec,
                              @RequestParam(required = false, defaultValue = "") String status){
        ResponseType response = new ResponseType();
        List<DocSpec> list = testPlanService.queryDocSpec(carrier, version, spec, status);
        response.setData(list);
        return response;
    }

    @PostMapping("/update")
    public ResponseType update(@RequestBody DocSpec docSpec){
        ResponseType response = new ResponseType();
        try{
            testPlanService.updateDocSpec(docSpec);
            response.setCode(0);
            response.setMessage("Update Success");
        }catch (Exception e){
            e.printStackTrace();
            response.setCode(1);
            response.setData(e.getCause());
            response.setMessage("Update Failed");
        }
        return response;
    }

    @Deprecated
    @PostMapping("/create1")
    public ResponseType create1(@RequestBody String json){
        ResponseType response = new ResponseType();
        try{
            TestPlanCreateType data = jsonUtil.toObject(json, TestPlanCreateType.class);

            //0.查詢是否是已存在的docSpec
            //1. 建立DocSpec
            DocSpec docSpec = new DocSpec();
            docSpec.setVersion(data.getVersion());
            docSpec.setDocSource(data.getCarrier());
            docSpec.setDocGroup(data.getSpec());
            docSpec.setSheetId(data.getTestPlan());
            docSpec.setImportDate(new Date());
            docSpec.setDocStatus("Active");
            String mapName = data.isUseExistFile() ? data.getExistFileName() : data.getNewFileName();
            docSpec.setMapName(mapName);
            UUID docSpecKey = testPlanService.insertDocSpec(docSpec);

            HashMap<String, String> colMap = new HashMap<>();
            //2. 建立或取得TestPlanColumnMap
            if(data.isUseExistFile()){
                //get TestPlanColumnMap by mapping name
                List<TestPlanColumnMap> columnMaps = testPlanService.selectColumnMapByMappingName(mapName);
                for (TestPlanColumnMap columnMap : columnMaps){
                    colMap.put(columnMap.getDbColumnName(), columnMap.getDocColumnName());
                }
            }else {
                testPlanService.deleteColumnMapByMappingName(data.getNewFileName());
                for(int i=0; i<data.getCarrierField().length; i++){
                    CarrierField carrierField = data.getCarrierField()[i];
                    String dbColName = String.valueOf(i+1);
                    while(dbColName.length()<3) dbColName = "0".concat(dbColName);
                    dbColName = "S".concat(dbColName); //ex: "S001
                    colMap.put(dbColName, carrierField.getIndex());

                    TestPlanColumnMap testPlanColumnMap = new TestPlanColumnMap();
                    testPlanColumnMap.setMappingName(data.getNewFileName());
                    testPlanColumnMap.setDocColumnName(carrierField.getIndex());
                    testPlanColumnMap.setDbColumnName(dbColName);
                    testPlanColumnMap.setColumnDisplayName(carrierField.getName());
                    testPlanColumnMap.setUserDefineFlag(carrierField.isEdit()?"Y":"N");
                    testPlanColumnMap.setQueryFilterFlag(carrierField.isFilter()?"Y":"N");
                    testPlanService.insertTestPlanColumnMap(testPlanColumnMap);
                }
                //tc unique id
                if(data.getTestCaseUniqueID() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "TestCaseUniqueId", data.getTestCaseUniqueID());
                    colMap.put("TestCaseUniqueId", String.valueOf(data.getTestCaseUniqueID()));
                }
                //org tc id
                if(data.getOrgTestCaseID() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "OrgTestCaseID", data.getOrgTestCaseID());
                    colMap.put("OrgTestCaseID", String.valueOf(data.getOrgTestCaseID()));
                }
                //band
                if(data.getBand() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "Band", data.getBand());
                    colMap.put("Band", String.valueOf(data.getBand()));
                }
                //condition
                if(data.getCondition() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "Condition", data.getCondition());
                    colMap.put("Condition", String.valueOf(data.getCondition()));
                }
                //tc descript
                if(data.getTestCaseDescription() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "TestCaseDescription", data.getTestCaseDescription());
                    colMap.put("TestCaseDescription", String.valueOf(data.getTestCaseDescription()));
                }
                //tp
                if(data.getTestPlatform() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "TestPlatform", data.getTestPlatform());
                    colMap.put("TestPlan", String.valueOf(data.getTestPlatform()));
                }
                //primary tp
                if(data.getPrimaryTestPlatform() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "PrimaryTestPlatform", data.getPrimaryTestPlatform());
                    colMap.put("PrimaryTestPlatform", String.valueOf(data.getPrimaryTestPlatform()));
                }
                //primary test lab
                if(data.getPrimaryTestLab() != null){
                    testPlanService.insertStaticColMap(data.getNewFileName(),
                            "PrimaryTestLab", data.getPrimaryTestLab());
                    colMap.put("PrimaryTestLab", String.valueOf(data.getPrimaryTestLab()));
                }

            }
            //3. 建立TestPlanRaw
            for(String tab : data.getSheetTabs()){
                List<List<Object>> tabData = GoogleSheetTool.load(data.getTestPlan(), tab);
                List<TestPlanRaw> aTabTestPlans=new ArrayList<>();
                for(int i=1; i<tabData.size(); i++){
                    List<Object> row = tabData.get(i);
                    TestPlanRaw testPlanRaw = new TestPlanRaw();
                    testPlanRaw.setDocSpecKey(docSpecKey.toString());
//                    testPlanRaw.setTestCaseUniqueId(row.get(data.getTestCaseUniqueID()).toString());
//                    //group default same as unique id
//                    testPlanRaw.setTestCaseGroup(row.get(data.getTestCaseUniqueID()).toString());
//                    testPlanRaw.setOrgTestCaseID(row.get(data.getOrgTestCaseID()).toString());
//                    testPlanRaw.setBand(row.get(data.getBand()).toString());
//                    testPlanRaw.setCondition(row.get(data.getCondition()).toString());
//                    testPlanRaw.setTestCaseDescription(row.get(data.getTestCaseDescription()).toString());
//                    testPlanRaw.setTestPlatform(row.get(data.getTestPlatform()).toString());
//                    testPlanRaw.setPrimaryTestPlatform(row.get(data.getPrimaryTestPlatform()).toString());
//                    testPlanRaw.setPrimaryTestLab(row.get(data.getPrimaryTestLab()).toString());
                    testPlanRaw.setNote(data.getNote());



                    colMap.forEach((key, value)->{
                        try{
                            String methodName = "set".concat(key); //ex: "setS001"
                            Method method = TestPlanRaw.class.getMethod(methodName, String.class);
//                            int rowIndex = value.charAt(0) - 65; //ascii A 為65
                            int rowIndex = Integer.parseInt(value);
                            method.invoke(testPlanRaw, row.size()>rowIndex? row.get(rowIndex): "" );
                        }catch(NoSuchMethodException | IllegalAccessException | InvocationTargetException e){
                            e.printStackTrace();
                        }
                    });
                    aTabTestPlans.add(testPlanRaw);
//                    testPlanService.insertTestPlanRaw(testPlanRaw);
                }
                ExpandCarrierBandTool aExpandTool = new ExpandCarrierBandTool();
                aExpandTool.setInputTestPlans(aTabTestPlans);
                aExpandTool.doExpand();
                List<TestPlanRaw> expandTabTestPlans=new ArrayList<>();
                expandTabTestPlans.addAll(aExpandTool.getOutputTestPlans());
                for(TestPlanRaw eachRaw:expandTabTestPlans)
                {
                    testPlanService.insertTestPlanRaw(eachRaw);
                }
            }
            response.setCode(0);
            response.setMessage("Create Success");
        }
//        catch (JsonProcessingException e) {
//            //表示json轉換失敗
//            e.printStackTrace();
//        } catch (Exception exception) {
//            exception.printStackTrace();
//
//        }
        catch (Exception e){
            e.printStackTrace();
            response.setCode(1);
            response.setData(e.getStackTrace()[0]);
            response.setMessage("Create Fail");
        }
        return response;
    }

    @PostMapping("/create")
    public ResponseType create(@RequestBody TestPlanCreateType data){
        ResponseType response = new ResponseType();
        try{
            //1. 建立 colMap
            HashMap<String, String> columnsMap = testPlanService.createColumnStep(data);
            List<Map.Entry<DocSpec, List<TestPlanRaw>>> testPlanList = new ArrayList<>();

            /** testPlanList structure
             * [
             *    { docSpec1 : [testPlanRaw1, testPlanRaw2, ...]},
             *    { docSpec2 : [testPlanRaw1, testPlanRaw2, ...]},
             *       ...
             * ]
             */

            boolean isVZW = data.getSpec().contains("Page");
            String mapName = data.isUseExistFile() ? data.getExistFileName() : data.getNewFileName();

            if (isVZW)
            {
                for(String tabName : data.getSheetTabs()){
                    //2-1. 根據每個tab建立DocSpec
                    DocSpec docSpec = new DocSpec();
                    docSpec.setVersion(data.getVersion());
                    docSpec.setDocSource(data.getCarrier());
                    docSpec.setDocGroup(tabName); //spec name 為 tabName
                    docSpec.setSheetId(data.getTestPlan());
                    docSpec.setImportDate(new Date());
                    docSpec.setDocStatus("Active");
                    docSpec.setMapName(mapName);
                    UUID docKey = testPlanService.addOrUpdateDocSpec(data.getCarrier(),data.getVersion(),tabName,docSpec);
                    List<TestPlanRaw> rowList = new ArrayList<>();
                    List<List<Object>> tabData = GoogleSheetTool.load(data.getTestPlan(), tabName);
                    //3-1. 根據每筆sheet row建立TestPlanRaw
                    for(int i=1; i<tabData.size(); i++){
                        List<Object> row = tabData.get(i);
                        TestPlanRaw testPlanRaw = new TestPlanRaw();
                        testPlanRaw.setNote(data.getNote());

                        columnsMap.forEach((key, value)->{
                            try{
                                String methodName = "set".concat(key); //ex: "setS001"
                                Method method = TestPlanRaw.class.getMethod(methodName, String.class);
                                int rowIndex = Integer.parseInt(value);
                                method.invoke(testPlanRaw, row.size()>rowIndex? row.get(rowIndex): "" );
                            }catch(NoSuchMethodException | IllegalAccessException | InvocationTargetException e){
                                e.printStackTrace();
                            }
                        });
                        testPlanRaw.setDocSpecKey(docKey.toString());
                        String testPlatform = Arrays.stream(testPlanRaw.getTestPlatform().split(",")).map(String::trim).collect(Collectors.joining(","));
                        testPlanRaw.setTestPlatform(testPlatform);
                        rowList.add(testPlanRaw);
                    }
                    Map.Entry<DocSpec, List<TestPlanRaw>> testPlan = new AbstractMap.SimpleEntry<>(docSpec, rowList);
                    testPlanList.add(testPlan);
                }
            }
            else
            {
                //2-2. 建立一筆DocSpec
                DocSpec docSpec = new DocSpec();
                docSpec.setVersion(data.getVersion());
                docSpec.setDocSource(data.getCarrier());
                docSpec.setDocGroup(data.getSpec());
                docSpec.setSheetId(data.getTestPlan());
                docSpec.setImportDate(new Date());
                docSpec.setDocStatus("Active");
                docSpec.setMapName(mapName);
                UUID docKey = testPlanService.addOrUpdateDocSpec(data.getCarrier(),data.getVersion(),data.getSpec(),docSpec);
                List<TestPlanRaw> rowList = new ArrayList<>();
                for(String tabName : data.getSheetTabs()){
                    List<List<Object>> tabData = GoogleSheetTool.load(data.getTestPlan(), tabName);
                    //3-1. 根據每筆sheet row建立TestPlanRaw
                    for(int i=1; i<tabData.size(); i++){
                        List<Object> row = tabData.get(i);
                        TestPlanRaw testPlanRaw = new TestPlanRaw();
                        testPlanRaw.setNote(data.getNote());

                        columnsMap.forEach((key, value)->{
                            try{
                                String methodName = "set".concat(key); //ex: "setS001"
                                Method method = TestPlanRaw.class.getMethod(methodName, String.class);
                                int rowIndex = Integer.parseInt(value);
                                method.invoke(testPlanRaw, row.size()>rowIndex? row.get(rowIndex): "" );
                            }catch(NoSuchMethodException | IllegalAccessException | InvocationTargetException e){
                                e.printStackTrace();
                            }
                        });
                        //add by leo, 09/20, trim
                        String testPlatform = Arrays.stream(testPlanRaw.getTestPlatform().split(",")).map(String::trim).collect(Collectors.joining(","));
                        testPlanRaw.setTestPlatform(testPlatform);

                        testPlanRaw.setDocSpecKey(docKey.toString());
                        rowList.add(testPlanRaw);
                    }
                }
                Map.Entry<DocSpec, List<TestPlanRaw>> testPlan = new AbstractMap.SimpleEntry<>(docSpec, rowList);
                testPlanList.add(testPlan);
            }
            //read config sheetID for expand band
            String configSheetID = testPlanService.getParameterValueByName("sheetID for band config").get(0).getValue();
            testPlanService.insertTestPlan(testPlanList, configSheetID);
            response.setCode(0);
            response.setMessage("Create Success");
        }catch (Exception e){
            e.printStackTrace();
            response.setCode(1);
            response.setData(e.getStackTrace()[0]);
            response.setMessage("Create Fail");
        }
        return response;
    }

}
