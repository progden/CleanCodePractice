/*
 * JQuery WYSIWYG Web Form Designer
 * Copyright 2015 AgilePoint Inc
 */

/* Add your JS code Here (Press Ctrl+Space keys for intellisense) */

var dataGridIndex = -1;
var dlDgAddArray = ['Dummy001'];
var txtDgAssetNameArray = [];
var txtDgCustodianArray = [];
var txtDgStorageLocationArray = [];
var txtHandleAccountIDResult;
var checkActivityDisplayNameResult;
var tempDataGridArray = [];
var equipmentTypeArray = [];

/**
 * 表單生成時執行
 * @date      : 2023-07-24
 * @version   : 1.0
 */
eFormEvents.onFormLoadComplete = function () {
  //取得申請單號
  let strSerialNo = getFieldNameObjectValue('txtSerialNumber');
  if (strSerialNo.replace(/(^s*)|(s*$)/g, '').length == 0) {
    eFormHelper.triggerAutoLookup(
      {
        fieldId: 'getSerialNo',
      },
      function (result) {
        if (result.isSuccess) {
          console.log(result.data); //logs the data holds the empty object
        } else {
          console.log(result.error); // logs the hold exception object
        }
      }
    );

    //觸發填表人初始資料
    eFormHelper.triggerAutoLookup(
      {
        fieldId: 'getCreateEmpData',
      },
      function (result) {
        if (result.isSuccess) {
          console.log(result.data); //logs the data holds the empty object
          getStorageLocation();
        } else {
          console.log(result.error); // logs the hold exception object
        }
      }
    );
  }

  txtHandleAccountIDResult = getFieldNameObjectValue('txtHandleAccountID');

  checkActivityDisplayNameResult = getFieldNameObjectValue('checkActivityDisplayName');

  if (txtHandleAccountIDResult != '') {
    editItemVisible(1, false);

    getEquipmentType().then(function (result) {
      if (checkActivityDisplayNameResult == '申請人重新申請') {
        getStorageLocation();
        setFormFieldVisible('btnApply', true);
        setFixOption();
        setDlDgAdd();
      }
    });
  }
  dgApplyDetailClick();
};

/**
 * 觸發保管地資料
 * @date      : 2023-09-18
 * @version   : 1.0
 */
function getStorageLocation() {
  eFormHelper.triggerAutoLookup(
    {
      fieldId: 'getDlDgStorageLocation',
    },
    function (res) {
      if (res.isSuccess) {
        console.log(res.data);
      } else {
        console.log(res.error);
      }
    }
  );
}

/**
 * 元件顯示或隱藏
 * @date      : 2023-09-05
 * @version   : 1.0
 */
function editItemVisible(target, state) {
  switch (target) {
    //採購清單明細點擊
    case 0:
      setFormFieldVisible('dlDgAddOrFix', state);
      setFormFieldVisible('txtDgNotes', state);
      setFormFieldVisible('btnEdit', state);
      setFormFieldVisible('btnCancel', state);
      if (state) {
        eFormHelper.getFieldValue({ fieldId: 'dlDgAddOrFix' }, function (result) {
          //新增
          if (result.data == 0) {
            addOrEditVisible(true);
          }
          //修繕
          else {
            addOrEditVisible(false);
          }
        });
      } else {
        addOrEditVisible(false);
        setFormFieldVisible('dlDgAdd', state);
        setFormFieldVisible('dlDgFix', state);
        setFormFieldVisible('txtDgAssetName', state);
        setFormFieldVisible('txtDgAssetcla', state);
        setFormFieldVisible('txtCustodian', state);
        setFormFieldVisible('txtStorageLocation', state);
      }
      break;
    //財務初審
    case 1:
      setFormFieldVisible('btnQueryApplyEmp', false);
      setFormFieldVisible('btnQueryByProjectNumber', false);
      setFormFieldVisible('dlDgAdd', false);
      setFormFieldVisible('dlDgFix', false);
      setFormFieldVisible('txtDgAssetName', false);
      setFormFieldVisible('txtDgAssetcla', false);
      setFormFieldVisible('txtCustodian', false);
      setFormFieldVisible('txtStorageLocation', false);
      setFormFieldVisible('btnApply', false);
      setFormFieldEnabled('txtProjectNumber', false);
      setFormFieldEnabled('mstParallelApproval', false);
      setFormFieldVisible('btnEdit', state);
      setFormFieldVisible('btnCancel', state);
      setFormFieldVisible('dlEquipmentType', state);
      break;
    //新增主資產
    case 2:
      setFormFieldVisible('editDlDgAdd', state); //新主資產編號
      setFormFieldVisible('editTxtDgAddAssetName', state); //新主資產名稱設定
      setFormFieldVisible('dlDgCustodian', state); //保管人
      setFormFieldVisible('dlDgStorageLocation', state); //保管地
      setFormFieldVisible('btnDlDgAdd', state); //設定新主資產名稱
      setFormFieldVisible('btnCloseAddArea', state); //設定新主資產名稱取消
      if (txtDgAssetNameArray.length > 0) {
        setFieldNameObjectValue('editDlDgAdd', dlDgAddArray[0]);
        setFieldNameObjectValue('editTxtDgAddAssetName', txtDgAssetNameArray[0]);
        setFieldNameObjectValue('dlDgCustodian', splitCustodian(txtDgCustodianArray[0], 'name'));
        setFieldNameObjectValue('dlDgStorageLocation', splitStorageLocation(txtDgStorageLocationArray[0]));
      }
      break;
  }
}

/**
 * 新增與修繕是否顯示
 * @date      : 2023-09-11
 * @version   : 1.0
 */
function addOrEditVisible(state) {
  setFormFieldVisible('btnShowAddArea', state);
  setFormFieldVisible('dlDgAdd', state);
  setFormFieldVisible('dlDgFix', !state);
  setFormFieldVisible('txtDgAssetName', true); //資產名稱
  setFormFieldEnabled('txtDgAssetName', !state); //資產名稱
  setFormFieldVisible('txtDgAssetcla', !state); //設備類別
  setFormFieldVisible('txtCustodian', true); //資產保管人
  setFormFieldVisible('txtStorageLocation', true); //資產保管地
}

/**
 * 退回申請人整理主資產編號
 * @date      : 2023-09-19
 * @version   : 1.0
 */
function setDlDgAdd() {
  let dlDgAddOption = {};
  dlDgAddOption.fieldId = 'dlDgAdd';
  let dlDgAddOptionArray = [];

  let editDlDgAddOption = {};
  editDlDgAddOption.fieldId = 'editDlDgAdd';
  let editDlDgAddOptionArray = [];

  let tempObject = [];
  eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
    eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
      for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
        if (result.data.dgApplyDetail[i].dgMasterAssetCode.includes('Dummy')) {
          let check;
          check = tempObject.find((element) => element.assetCode == result.data.dgApplyDetail[i].dgMasterAssetCode);
          if (check == null) {
            tempObject.push({
              assetCode: result.data.dgApplyDetail[i].dgMasterAssetCode,
              assetName: result.data.dgApplyDetail[i].dgAssetName,
              custodian:
                result.data.dgApplyDetail[i].dgCustodianName +
                ' (' +
                idResult.data.tempIdDataGrid[i].dgCustodianValue +
                ')',
              storageLocation: result.data.dgApplyDetail[i].dgStorageLocationName,
            });
          }
        }
      }
      tempObject.sort((a, b) => {
        let assetCodeA = a.assetCode.toUpperCase();
        let assetCodeB = b.assetCode.toUpperCase();
        if (assetCodeA < assetCodeB) {
          return -1;
        }
        if (assetCodeA > assetCodeB) {
          return 1;
        }
        return 0;
      });
      for (let i = 0; i < tempObject.length; i++) {
        dlDgAddArray[i] = tempObject[i].assetCode;
        txtDgAssetNameArray[i] = tempObject[i].assetName;
        txtDgCustodianArray[i] = tempObject[i].custodian;
        txtDgStorageLocationArray[i] = tempObject[i].storageLocation;
        dlDgAddOptionArray.push({
          Name: tempObject[i].assetCode,
          Value: tempObject[i].assetCode,
        });
        editDlDgAddOptionArray.push({
          Name: tempObject[i].assetCode,
          Value: tempObject[i].assetCode,
        });
      }
      let newAssetCode = Number(tempObject[tempObject.length - 1].assetCode.replace('Dummy', ''));
      if (newAssetCode + 1 < 10) {
        newAssetCode = 'Dummy00' + Number(newAssetCode + 1);
      } else if (newAssetCode + 1 < 100) {
        newAssetCode = 'Dummy0' + Number(newAssetCode + 1);
      } else if (newAssetCode + 1 < 1000) {
        newAssetCode = 'Dummy' + Number(newAssetCode + 1);
      }
      editDlDgAddOptionArray.push({
        Name: newAssetCode,
        Value: newAssetCode,
      });

      dlDgAddOption.value = dlDgAddOptionArray;
      bindDataToCollectionControls(dlDgAddOption);

      editDlDgAddOption.value = editDlDgAddOptionArray;
      bindDataToCollectionControls(editDlDgAddOption);
    });
  });
}

/**
 * 採購清單明細Lookup執行後
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function dataGridLoaded() {
  //整理Data Grid資料
  eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
    let checkApplyDetail, strWarning;
    checkApplyDetail = $.trim(result.data.dgApplyDetail);
    if (getFieldNameObjectValue('txtProjectName') == '') {
      strWarning = '查無此預算號碼，請重新確認。';
      alertError(strWarning, '');
      ruturn;
    } else {
      if (checkApplyDetail.length == 0) {
        strWarning = '查無此預算號碼明細，請重新確認。';
        alertWarning(strWarning, '');
        ruturn;
      }
    }

    eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
      let tempArray = [];
      for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
        result.data.dgApplyDetail[i].dgNO = i + 1;
        result.data.dgApplyDetail[i].dgCustodianName = null;
        result.data.dgApplyDetail[i].dgStorageLocationName = null;
        result.data.dgApplyDetail[i].dgAddOrFix = null;
        result.data.dgApplyDetail[i].dgMasterAssetCode = null;
        result.data.dgApplyDetail[i].dgAssetName = null;
        result.data.dgApplyDetail[i].dgEquipmentTypeName = null;
        result.data.dgApplyDetail[i].dgNotes = null;

        setFieldNameObjectValue('dgApplyDetail', result.data);
        refreshApplyDetail();

        //整理Id Data Grid資料
        tempArray.push({
          dgCustodianValue: '-1',
          dgStorageLocationValue: '-1',
          dgEquipmentTypeValue: '-1',
        });
      }
      idResult.data.tempIdDataGrid = tempArray;
      setFieldNameObjectValue('tempIdDataGrid', idResult.data);
    });
  });

  getEquipmentType().then(function (result) {
    getZeformrfcCoAssetGetlist();
  });

  dgApplyDetailClick();
}

/**
 * 設備類別Array比對用
 * @date      : 2023-09-18
 * @version   : 1.0
 */
function getEquipmentType() {
  equipmentTypeArray = [];
  return new Promise((resolve) => {
    eFormHelper.triggerAutoLookup(
      {
        fieldId: 'getEquipmentType',
      },
      function (result) {
        for (let i = 1; i < $('#dlEquipmentType option').length; i++) {
          equipmentTypeArray.push({
            value: $('#dlEquipmentType option')[i].value,
            name: $('#dlEquipmentType option')[i].innerText,
          });
        }
        resolve();
      }
    );
  });
}

/**
 * 觸發取得暫存DataGrid資料
 * @date      : 2023-09-11
 * @version   : 1.0
 */
function getZeformrfcCoAssetGetlist() {
  eFormHelper.triggerAutoLookup(
    {
      fieldId: 'getZeformrfcCoAssetGetlist',
    },
    function (result) {
      setFixOption();
    }
  );
}

/**
 * 設定修繕選單
 * @date      : 2023-09-11
 * @version   : 1.0
 */
function setFixOption() {
  eFormHelper.getFieldValue({ fieldId: 'tempDataGrid' }, function (resultData) {
    let j = 0;
    let dlDgFixOption = {};
    dlDgFixOption.fieldId = 'dlDgFix';
    let tempArray = [];

    for (let i = 0; i < resultData.data.tempDataGrid.length; i++) {
      let check;
      check = tempDataGridArray.find((element) => element.tpDgAsset == resultData.data.tempDataGrid[i].tpDgAsset);
      if (check == null) {
        let tpDgAssetclaValue = resultData.data.tempDataGrid[i].tpDgAssetcla.substr(3);

        let equipmentTypeObject = equipmentTypeArray.find((element) => element.value == tpDgAssetclaValue);

        tempDataGridArray.push({
          index: j,
          tpDgAsset: resultData.data.tempDataGrid[i].tpDgAsset,
          tpDgMainDescript: resultData.data.tempDataGrid[i].tpDgMainDescript.trim(),
          tpDgAssetclaName: equipmentTypeObject.name,
          tpDgAssetclaValue: tpDgAssetclaValue,
          tpDgDescript: resultData.data.tempDataGrid[i].tpDgDescript.trim(),
          tpDgLocation: resultData.data.tempDataGrid[i].tpDgLocation.trim(),
        });
        tempArray.push({
          Name: resultData.data.tempDataGrid[i].tpDgAsset,
          Value: resultData.data.tempDataGrid[i].tpDgAsset,
        });
        j++;
      }
    }

    dlDgFixOption.value = tempArray;
    bindDataToCollectionControls(dlDgFixOption);

    if (tempDataGridArray.length > 0) {
      setFieldNameObjectValue('txtDgAssetcla', tempDataGridArray[0].tpDgAssetclaName);

      setFieldNameObjectValue('tpDgAssetclaValue', tempDataGridArray[0].tpDgAssetclaValue);
    }

    setFieldNameObjectValue('dlDgFix', -1);
  });
}

/**
 * 採購清單明細點擊
 * @date      : 2023-08-10
 * @version   : 1.0
 */
function dgApplyDetailClick() {
  $('#dgApplyDetail').on('click', 'tr', function () {
    $(this).removeAttr('style');
    $(this).siblings().removeClass('k-state-selected');
    $(this).addClass('k-state-selected');
    let dataItem = $('#dgApplyDetail')
      .data('kendoGrid')
      .dataItem($('#dgApplyDetail tbody').find('tr.k-state-selected'));
    if (dataItem == null) {
      return;
    }
    dataGridIndex = dataItem.dgNO - 1;

    //申請
    if (checkActivityDisplayNameResult == '' || checkActivityDisplayNameResult == '申請人重新申請') {
      eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
        eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
          if (result.data.dgApplyDetail[dataGridIndex].dgMasterAssetCode != '') {
            if (result.data.dgApplyDetail[dataGridIndex].dgAddOrFix == '新增') {
              setFieldNameObjectValue('dlDgAddOrFix', 0);
              setFieldNameObjectValue('dlDgAdd', result.data.dgApplyDetail[dataGridIndex].dgMasterAssetCode);
            } else {
              setFieldNameObjectValue('dlDgAddOrFix', 1);
              setFieldNameObjectValue('dlDgFix', result.data.dgApplyDetail[dataGridIndex].dgMasterAssetCode);
            }

            setFieldNameObjectValue('dlDgCustodian', result.data.dgApplyDetail[dataGridIndex].dgCustodianName);
            setFieldNameObjectValue('txtCustodian', getFieldNameObjectText('dlDgCustodian'));
            setFieldNameObjectValue(
              'dlDgStorageLocation',
              idResult.data.tempIdDataGrid[dataGridIndex].dgStorageLocationValue
            );
            setFieldNameObjectValue('txtStorageLocation', getFieldNameObjectText('dlDgStorageLocation'));

            setFieldNameObjectValue('txtDgAssetName', result.data.dgApplyDetail[dataGridIndex].dgAssetName);

            setFieldNameObjectValue('txtDgAssetcla', result.data.dgApplyDetail[dataGridIndex].dgEquipmentTypeName);

            setFieldNameObjectValue('txtDgNotes', result.data.dgApplyDetail[dataGridIndex].dgNotes);
          }
        });
      });
      editItemVisible(0, true);
      editItemVisible(2, false);
    }
    //財務初審
    else {
      let checkBSFCResult = getFieldNameObjectValue('checkBSFC');
      let checkFCC1Result = getFieldNameObjectValue('checkFCC1');
      if (checkActivityDisplayNameResult == checkBSFCResult || checkActivityDisplayNameResult == checkFCC1Result) {
        eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (result) {
          setFieldNameObjectValue('dlEquipmentType', result.data.tempIdDataGrid[dataGridIndex].dgEquipmentTypeValue);
        });
        editItemVisible(1, true);
      }
    }
  });
}

/**
 * 取出保管人 ID 或名稱
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function splitCustodian(string, targer) {
  let stringSplit = string.split('(');
  if (targer == 'id') {
    return stringSplit[1].split(')')[0];
  } else {
    return stringSplit[0].trim();
  }
}

/**
 * 取出保管地 ID
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function splitStorageLocation(string) {
  let stringSplit = string.split('(');
  return stringSplit[1].split(')')[0];
}

/**
 * 修繕轉換保管人放入資產保管人欄位
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function setTxtCustodian(txtCustodian) {
  setFieldNameObjectValue('dlDgCustodian', txtCustodian);
  let tempCustodian = getFieldNameObjectText('dlDgCustodian');
  setFieldNameObjectValue('txtCustodian', tempCustodian);
  setFieldNameObjectValue('dlDgCustodian', -1);
}

/**
 * 修繕轉換保管人放入資產保管人欄位
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function setTxtStorageLocation(txtStorageLocation) {
  setFieldNameObjectValue('dlDgStorageLocation', txtStorageLocation);
  let tempStorageLocation = getFieldNameObjectText('dlDgStorageLocation');
  setFieldNameObjectValue('txtStorageLocation', tempStorageLocation);
  setFieldNameObjectValue('dlDgStorageLocation', -1);
}

/**
 * 新增與修繕選擇
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function addOrFixChange() {
  eFormHelper.getFieldValue({ fieldId: 'dlDgAddOrFix' }, function (result) {
    //新增
    if (result.data == 0) {
      addOrEditVisible(true);
      setFieldNameObjectValue('dlDgAdd', 'Dummy001');
      if (txtDgAssetNameArray[0] != null) {
        setFieldNameObjectValue('txtDgAssetName', txtDgAssetNameArray[0]);
        setFieldNameObjectValue('txtCustodian', txtDgCustodianArray[0]);
        setFieldNameObjectValue('txtStorageLocation', txtDgStorageLocationArray[0]);
      } else {
        setFieldNameObjectValue('txtDgAssetName', null);
        setFieldNameObjectValue('txtCustodian', null);
        setFieldNameObjectValue('txtStorageLocation', null);
      }
    }
    //修繕
    else {
      editItemVisible(2, false);
      addOrEditVisible(false);
      setFieldNameObjectValue('txtDgAssetName', null);
      if (tempDataGridArray.length > 0) {
        setFieldNameObjectValue('dlDgFix', tempDataGridArray[0].tpDgAsset);
        setFieldNameObjectValue('txtDgAssetName', tempDataGridArray[0].tpDgMainDescript);
        setTxtCustodian(tempDataGridArray[0].tpDgDescript);
        setTxtStorageLocation(tempDataGridArray[0].tpDgLocation);
        setFieldNameObjectValue('txtDgAssetcla', tempDataGridArray[0].tpDgAssetclaName);
        setFieldNameObjectValue('txtDgAssetclaValue', tempDataGridArray[0].tpDgAssetclaValue);
      }
    }
  });
}

/**
 * 主資產編號設定儲存
 * @date      : 2023-07-24
 * @version   : 1.0
 */
function editDlDgAdd() {
  //新增
  let editDlDgAddResult, dlDgAddIndex, editTxtDgAddAssetNameResult, dlDgCustodianResult, dlDgStorageLocationResult;

  editDlDgAddResult = getFieldNameObjectValue('editDlDgAdd'); //新主資產編號
  if (editDlDgAddResult == '') {
    alertWarning('【新主資產編號】未選擇<br>', '');
    return;
  }

  dlDgAddIndex = Number(editDlDgAddResult.replace('Dummy', '')) - 1;

  let strWarning = '';
  editTxtDgAddAssetNameResult = getFieldNameObjectValue('editTxtDgAddAssetName'); //新主資產名稱設定
  dlDgCustodianResult = getFieldNameObjectText('dlDgCustodian'); //保管人
  dlDgStorageLocationResult = getFieldNameObjectText('dlDgStorageLocation'); //保管地

  if (editTxtDgAddAssetNameResult == '') {
    strWarning += '【新主資產名稱設定】未輸入<br>';
  }
  if (dlDgCustodianResult == 'Please Select') {
    strWarning += '【保管人】未選擇<br>';
  }
  if (dlDgStorageLocationResult == 'Please Select') {
    strWarning += '【保管地】未選擇<br>';
  }

  if (strWarning == '') {
    txtDgAssetNameArray[dlDgAddIndex] = editTxtDgAddAssetNameResult;
    txtDgCustodianArray[dlDgAddIndex] = dlDgCustodianResult;
    txtDgStorageLocationArray[dlDgAddIndex] = dlDgStorageLocationResult;
  } else {
    alertWarning(strWarning, '');
    return;
  }

  let dlDgAddOption = {};
  dlDgAddOption.fieldId = 'dlDgAdd';
  let dlDgAddOptionArray = [];

  let editDlDgAddOption = {};
  editDlDgAddOption.fieldId = 'editDlDgAdd';
  let editDlDgAddOptionArray = [];

  for (let i = 0; i <= txtDgAssetNameArray.length; i++) {
    let dlDgAddString = 'Dummy';
    if (i + 1 < 10) {
      dlDgAddString += '00' + Number(i + 1);
    } else if (i + 1 < 100) {
      dlDgAddString += '0' + Number(i + 1);
    } else if (i + 1 < 1000) {
      dlDgAddString += Number(i + 1);
    }
    //上限 Dummy999
    if (i < 999) {
      dlDgAddArray[i] = dlDgAddString;
    }
    if (i != txtDgAssetNameArray.length) {
      dlDgAddOptionArray.push({
        Name: dlDgAddArray[i],
        Value: dlDgAddArray[i],
      });
    }
    editDlDgAddOptionArray.push({
      Name: dlDgAddArray[i],
      Value: dlDgAddArray[i],
    });
  }
  dlDgAddOption.value = dlDgAddOptionArray;
  bindDataToCollectionControls(dlDgAddOption);

  editDlDgAddOption.value = editDlDgAddOptionArray;
  bindDataToCollectionControls(editDlDgAddOption);

  eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
    eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
      for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
        if (result.data.dgApplyDetail[i].dgMasterAssetCode == editDlDgAddResult) {
          result.data.dgApplyDetail[i].dgAssetName = editTxtDgAddAssetNameResult; //資產名稱
          result.data.dgApplyDetail[i].dgCustodianName = splitCustodian(dlDgCustodianResult, 'name'); //保管人
          idResult.data.tempIdDataGrid[i].dgCustodianValue = splitCustodian(dlDgCustodianResult, 'id');
          result.data.dgApplyDetail[i].dgStorageLocationName = dlDgStorageLocationResult; //保管地
          idResult.data.tempIdDataGrid[i].dgStorageLocationValue = splitStorageLocation(dlDgStorageLocationResult);
        }
      }
      setFieldNameObjectValue('dgApplyDetail', result.data);
      setFieldNameObjectValue('tempIdDataGrid', idResult.data);
      refreshApplyDetail();
    });
  });

  setFieldNameObjectValue('dlDgAdd', 'Dummy001');
  setFieldNameObjectValue('editDlDgAdd', 'Dummy001');
  eFormHelper.getFieldValue({ fieldId: 'dlDgAddOrFix' }, function (result) {
    if (result.data == 0) {
      setFieldNameObjectValue('txtDgAssetName', txtDgAssetNameArray[0]); //資產名稱
      setFieldNameObjectValue('txtCustodian', txtDgCustodianArray[0]); //資產保管人
      setFieldNameObjectValue('txtStorageLocation', txtDgStorageLocationArray[0]); //資產保管地
    }
  });
  setFieldNameObjectValue('editTxtDgAddAssetName', txtDgAssetNameArray[0]); //新主資產名稱設定
  setFieldNameObjectValue('dlDgCustodian', splitCustodian(txtDgCustodianArray[0], 'name')); //保管人
  setFieldNameObjectValue('dlDgStorageLocation', splitStorageLocation(txtDgStorageLocationArray[0])); //保管地
  editItemVisible(2, false);
}

/**
 * 主資產編號(新增)選擇
 * @date      : 2023-07-24
 * @version   : 1.0
 */
function dlDgAddChange(fieldId) {
  eFormHelper.getFieldValue({ fieldId: fieldId }, function (result) {
    if (result.data != '') {
      let index = Number(result.data.replace('Dummy', '')) - 1;
      //編輯
      if (fieldId == 'editDlDgAdd') {
        if (txtDgAssetNameArray[index] != null) {
          setFieldNameObjectValue('editTxtDgAddAssetName', txtDgAssetNameArray[index]); //新主資產名稱設定
          setFieldNameObjectValue('dlDgCustodian', splitCustodian(txtDgCustodianArray[index], 'name')); //保管人
          setFieldNameObjectValue('dlDgStorageLocation', splitStorageLocation(txtDgStorageLocationArray[index])); //保管地
        } else {
          setFieldNameObjectValue('editTxtDgAddAssetName', null);
          setFieldNameObjectValue('dlDgCustodian', -1);
          setFieldNameObjectValue('dlDgStorageLocation', -1);
        }
      }
      //選取已儲存
      else {
        setFieldNameObjectValue('txtDgAssetName', txtDgAssetNameArray[index]); //資產名稱
        setFieldNameObjectValue('txtCustodian', txtDgCustodianArray[index]); //資產保管人
        setFieldNameObjectValue('txtStorageLocation', txtDgStorageLocationArray[index]); //資產保管地
      }
    }
  });
}

/**
 * 主資產編號(修繕)選擇
 * @date      : 2023-07-24
 * @version   : 1.0
 */
function dlDgFixChange(fieldId) {
  eFormHelper.getFieldValue({ fieldId: fieldId }, function (result) {
    if (result.data != '') {
      let target = tempDataGridArray.find((element) => element.tpDgAsset == result.data);
      setFieldNameObjectValue('txtDgAssetName', target.tpDgMainDescript);
      setTxtCustodian(target.tpDgDescript);
      setTxtStorageLocation(target.tpDgLocation);
      setFieldNameObjectValue('txtDgAssetcla', target.tpDgAssetclaName);
      setFieldNameObjectValue('txtDgAssetclaValue', target.tpDgAssetclaValue);
    }
  });
}

/**
 * 修改Data Grid 的內容
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function edit() {
  if (dataGridIndex < 0) {
    return;
  }

  //申請
  if (checkActivityDisplayNameResult == '' || checkActivityDisplayNameResult == '申請人重新申請') {
    let // dlDgCustodianNameResult,
      //   dlDgCustodianValueResult,
      // dlDgStorageLocationValueResult,
      // dlDgStorageLocationNameResult,
      dlDgAddOrFixResult,
      txtDgAssetNameResult,
      txtCustodianResult,
      txtStorageLocationResult,
      txtDgNotesResult;

    // dlDgCustodianNameResult = getFieldNameObjectText('dlDgCustodian');
    // dlDgCustodianValueResult = getFieldNameObjectValue('dlDgCustodian');

    // dlDgStorageLocationValueResult = getFieldNameObjectValue(
    //   'dlDgStorageLocation'
    // );
    // dlDgStorageLocationNameResult = getFieldNameObjectText(
    //   'dlDgStorageLocation'
    // );

    dlDgAddOrFixResult = getFieldNameObjectValue('dlDgAddOrFix');

    txtDgAssetNameResult = getFieldNameObjectValue('txtDgAssetName');
    txtCustodianResult = getFieldNameObjectValue('txtCustodian');
    txtStorageLocationResult = getFieldNameObjectValue('txtStorageLocation');

    txtDgNotesResult = getFieldNameObjectValue('txtDgNotes');

    eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
      eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
        //新增
        if (dlDgAddOrFixResult == 0) {
          let dlDgAddResult = getFieldNameObjectValue('dlDgAdd');
          // if (
          //   dlDgCustodianValueResult != '-1' &&
          //   dlDgCustodianValueResult != '' &&
          //   dlDgStorageLocationValueResult != '-1' &&
          //   dlDgStorageLocationValueResult != '' &&
          //   dlDgAddResult != '' &&
          //   txtDgAssetNameResult != ''
          // )
          if (dlDgAddResult != '' && txtDgAssetNameResult != '') {
            result.data.dgApplyDetail[dataGridIndex].dgAddOrFix = '新增';
            result.data.dgApplyDetail[dataGridIndex].dgMasterAssetCode = dlDgAddResult;
            result.data.dgApplyDetail[dataGridIndex].dgEquipmentTypeName = null;
            result.data.dgApplyDetail[dataGridIndex].dgEquipmentTypeValue = -1;
          } else {
            let strWarning = '';
            if (dlDgAddResult == '') {
              strWarning += '【主資產編號(新增)】未選擇<br>';
            } else {
              strWarning += '【資產名稱】未輸入<br>';
              strWarning += '【保管人】未選擇<br>';
              strWarning += '【保管地】未選擇<br>';
            }
            alertWarning(strWarning, '');
            return;
          }
        }
        //修繕
        else {
          let dlDgFixResult = getFieldNameObjectValue('dlDgFix');
          // if (
          //   dlDgCustodianValueResult != '-1' &&
          //   dlDgCustodianValueResult != '' &&
          //   dlDgStorageLocationValueResult != '-1' &&
          //   dlDgStorageLocationValueResult != '' &&
          //   dlDgFixResult != '' &&
          //   txtDgAssetNameResult != ''
          // )
          if (dlDgFixResult != '' && txtDgAssetNameResult != '') {
            let target = tempDataGridArray.find((element) => element.tpDgAsset == dlDgFixResult);

            if (tempDataGridArray[target.index].tpDgMainDescript != txtDgAssetNameResult) {
              tempDataGridArray[target.index].tpDgMainDescript = txtDgAssetNameResult;

              for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
                if (result.data.dgApplyDetail[i].dgMasterAssetCode == target.tpDgAsset) {
                  result.data.dgApplyDetail[i].dgAssetName = txtDgAssetNameResult;
                }
              }
            }

            result.data.dgApplyDetail[dataGridIndex].dgAddOrFix = '修繕';
            result.data.dgApplyDetail[dataGridIndex].dgMasterAssetCode = dlDgFixResult;
            result.data.dgApplyDetail[dataGridIndex].dgEquipmentTypeName = getFieldNameObjectValue('txtDgAssetcla');
            idResult.data.tempIdDataGrid[dataGridIndex].dgEquipmentTypeValue =
              getFieldNameObjectValue('txtDgAssetclaValue');
          } else {
            let strWarning = '';
            if (dlDgFixResult == '') strWarning += '【主資產編號(修繕)】未選擇<br>';
            if (txtDgAssetNameResult == '') strWarning += '【資產名稱】未輸入<br>';
            // if (!(dlDgCustodianValueResult != '-1' && dlDgCustodianValueResult != ''))
            //   strWarning += '【保管人】未選擇<br>';
            // if (!(dlDgStorageLocationValueResult != '-1' && dlDgStorageLocationValueResult != ''))
            //   strWarning += '【保管地】未選擇<br>';
            alertWarning(strWarning, '');
            return;
          }
        }
        result.data.dgApplyDetail[dataGridIndex].dgCustodianName = splitCustodian(txtCustodianResult, 'name');
        idResult.data.tempIdDataGrid[dataGridIndex].dgCustodianValue = splitCustodian(txtCustodianResult, 'id');
        result.data.dgApplyDetail[dataGridIndex].dgStorageLocationName = txtStorageLocationResult;
        stringSplit = txtStorageLocationResult.split('(');
        idResult.data.tempIdDataGrid[dataGridIndex].dgStorageLocationValue = stringSplit[1].split(')')[0];
        result.data.dgApplyDetail[dataGridIndex].dgAssetName = txtDgAssetNameResult;
        result.data.dgApplyDetail[dataGridIndex].dgNotes = txtDgNotesResult;

        setFieldNameObjectValue('dgApplyDetail', result.data);
        refreshApplyDetail();
        setFieldNameObjectValue('tempIdDataGrid', idResult.data);
        setFieldNameObjectValue('txtDgNotes', null);
        dataGridIndex = -1;
        editItemVisible(0, false);
        editItemVisible(2, false);
      });
    });
  }
  //財務初審
  else {
    eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
      eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
        if (
          getFieldNameObjectValue('dlEquipmentType') != -1 &&
          getFieldNameObjectValue('dlEquipmentType') != '請選擇'
        ) {
          result.data.dgApplyDetail[dataGridIndex].dgEquipmentTypeName = getFieldNameObjectText('dlEquipmentType');
          idResult.data.tempIdDataGrid[dataGridIndex].dgEquipmentTypeValue = getFieldNameObjectValue('dlEquipmentType');
          setFieldNameObjectValue('dgApplyDetail', result.data);
          refreshApplyDetail();
          setFieldNameObjectValue('tempIdDataGrid', idResult.data);
          editItemVisible(1, false);
        } else {
          let strWarning = '';
          strWarning += '【設備類別】未選擇<br>';
          alertWarning(strWarning, '');
          return;
        }
      });
    });
  }
}

/**
 * 取消修改Data Grid 的內容
 * @date      : 2023-09-14
 * @version   : 1.0
 */
function cancelEdit() {
  // showAddArea(false);
  editItemVisible(0, false);
  setFormFieldVisible('dlEquipmentType', false);
  dataGridIndex = -1;
}

/**
 * 送出申請前檢查
 * @date      : 2023-07-17
 * @version   : 1.0
 */
eFormEvents.onBeforeSubmit = function (callback) {
  let check = false;
  if (getFieldNameObjectValue('rdoManagerApproval') == 'Reject') {
    check = true;
  } else {
    eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
      let checkActivityDisplayNameResult = getFieldNameObjectValue('checkActivityDisplayName');

      //申請
      if (checkActivityDisplayNameResult == '' || checkActivityDisplayNameResult == '申請人重新申請') {
        for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
          if (
            result.data.dgApplyDetail[i].dgCustodianName == '' ||
            result.data.dgApplyDetail[i].dgStorageLocationName == '' ||
            result.data.dgApplyDetail[i].dgAddOrFix == '' ||
            result.data.dgApplyDetail[i].dgMasterAssetCode == '' ||
            result.data.dgApplyDetail[i].dgAssetName == ''
          ) {
            alertWarning('請編輯' + getFieldNameObjectValue('Heading6') + ' No' + (i + 1) + '資料。', '');
            check = false;
            break;
          } else {
            check = true;
          }
        }
      }
      //財務初審
      else {
        for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
          if (result.data.dgApplyDetail[i].dgEquipmentTypeName == '') {
            alertWarning('請編輯' + getFieldNameObjectValue('Heading6') + ' No' + (i + 1) + '資料。', '');
            check = false;

            break;
          } else {
            check = true;
          }
        }

        if (check) {
          let tempObject = {};
          tempObject.fieldId = 'mstDgCustodian';
          let tempArray = [];
          let tempString = '';

          eFormHelper.getFieldValue({ fieldId: 'tempIdDataGrid' }, function (idResult) {
            for (let i = 0; i < idResult.data.tempIdDataGrid.length; i++) {
              let checkObject = tempArray.find(
                (element) => element.Name == idResult.data.tempIdDataGrid[i].dgCustodianValue
              );
              if (checkObject == null) {
                tempArray.push({
                  Name: idResult.data.tempIdDataGrid[i].dgCustodianValue,
                  Value: idResult.data.tempIdDataGrid[i].dgCustodianValue,
                });
                tempString += idResult.data.tempIdDataGrid[i].dgCustodianValue;
                tempString += ';';
              }
            }

            tempObject.value = tempArray;
            bindDataToCollectionControls(tempObject);

            setFieldNameObjectValue('mstDgCustodian', tempString);
          });
        }
      }
    });
  }

  if (check) {
    callback(true);
  } else {
    callback(false);
  }
};

/**
 * 送出
 * @date      : 2023-07-17
 * @version   : 1.0
 */
function submit() {
  setFieldNameObjectValue('rdoManagerApproval', 'Approve');
}

function refreshApplyDetail() {
  var datagridname = 'dgApplyDetail';

  var grid;
  var gridContainer = $('#' + datagridname);
  grid = gridContainer.data('kendoGrid');

  // refresh datasource
  grid.dataSource.fetch(function () {
    var view = grid.dataSource.view();

    $.each(view, function (index, item) {
      item.dgAmount = numFormat(item.dgAmount);
      grid.dataSource.sync();
    });
  });

  $('#dgApplyDetail tr').find('td:eq(0),th:eq(0)').width(25);
  $('#dgApplyDetail tr').find('td:eq(3),th:eq(3)').width(75);
  $('#dgApplyDetail tr').find('td:eq(3)').css('text-align', 'right');
  //$('#dgApplyDetail thead th').off('click');
}
