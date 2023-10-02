/*
 * JQuery WYSIWYG Web Form Designer
 * Copyright 2015 AgilePoint Inc
 */

/* Add your JS code Here (Press Ctrl+Space keys for intellisense) */

var dataGridIndex = -1;
var checkActivityDisplayNameResult;

/**
 * 表單生成時執行
 * @date      : 2023-08-15
 * @version   : 1.0
 */
eFormEvents.onFormLoadComplete = function () {
  //取得第一階段採購清單明細並整理放入第二階段採購清單明細
  //財務編輯流程
  checkActivityDisplayNameResult = getFieldNameObjectValue(
    'checkActivityDisplayName'
  );

  setFieldNameObjectValue('txtDgAssetclaValue', null);

  if (checkActivityDisplayNameResult != '財務更新SAP') {
    let masterAssetCodeArray = [];
    let secondDgApplyDetailArray = [];
    eFormHelper.getFieldValue({ fieldId: 'dgApplyDetail' }, function (result) {
      eFormHelper.getFieldValue(
        { fieldId: 'tempIdDataGrid' },
        function (idResult) {
          let j = 1;
          for (let i = 0; i < result.data.dgApplyDetail.length; i++) {
            if (
              masterAssetCodeArray.indexOf(
                result.data.dgApplyDetail[i].dgMasterAssetCode
              ) < 0
            ) {
              masterAssetCodeArray.push(
                result.data.dgApplyDetail[i].dgMasterAssetCode
              );
              secondDgApplyDetailArray.push({
                secondDgNO: j,
                secondDgAsset: result.data.dgApplyDetail[i].dgMasterAssetCode,
                secondDgDescript: result.data.dgApplyDetail[i].dgAssetName,
                secondDgAssetclassName:
                  result.data.dgApplyDetail[i].dgEquipmentTypeName,
                secondDgAssetclassValue:
                  idResult.data.tempIdDataGrid[i].dgEquipmentTypeValue,
                secondDgAmount: result.data.dgApplyDetail[i].dgAmount,
                secondDgDescript2: result.data.dgApplyDetail[i].dgCustodianName,
                secondDgLocationName:
                  result.data.dgApplyDetail[i].dgStorageLocationName,
                secondDgLocationValue:
                  idResult.data.tempIdDataGrid[i].dgStorageLocationValue,
              });
              j++;
            } else {
              let target = secondDgApplyDetailArray.find(
                (element) =>
                  element.secondDgAsset ==
                  result.data.dgApplyDetail[i].dgMasterAssetCode
              );
              let updateAmount =
                Number(target.secondDgAmount) +
                Number(result.data.dgApplyDetail[i].dgAmount);
              secondDgApplyDetailArray[target.secondDgNO - 1].secondDgAmount =
                updateAmount;
            }
          }

          eFormHelper.getFieldValue(
            { fieldId: 'secondDgApplyDetail' },
            function (res) {
              res.data.secondDgApplyDetail = secondDgApplyDetailArray;
              setFieldNameObjectValue('secondDgApplyDetail', res.data);
            }
          );

          dgApplyDetailClick();
        }
      );
    });

    //預算號碼轉換公司代碼
    let projectNumber = getFieldNameObjectValue('txtProjectNumber');
    let tempProjectNumber = projectNumber.substring(0, 2);
    if (tempProjectNumber == 'AB') {
      setFieldNameObjectValue('txtProjectNumberToOrganizationID', 'BSFC');
    } else {
      setFieldNameObjectValue('txtProjectNumberToOrganizationID', 'FCC1');
    }

    //預算號碼轉換工程類別
    tempProjectNumber = projectNumber.substring(7, 8);
    setFieldNameObjectValue('txt2ndDgEvalgroup2', tempProjectNumber);
  }
  //財務更新SAP
  else {
    editItemVisible(0, false);
  }
};

/**
 * 元件顯示或隱藏
 * @date      : 2023-09-06
 * @version   : 1.0
 */
function editItemVisible(target, state) {
  setFormFieldVisible('num2ndDgQuantity', state);
  setFormFieldVisible('dl2ndDgInternOrd', state);
  setFormFieldVisible('dl2ndDgEvalgroup1', state);
  setFormFieldVisible('txt2ndDgEvalgroup2', state);
  setFormFieldVisible('dl2ndEvalgroup3', state);
  setFormFieldVisible('txt2ndDgDepKey', state);
  setFormFieldVisible('txt2ndDgUlifeYrs', state);
  setFormFieldVisible('btnEdit', state);
  setFormFieldVisible('btnCancel', state);
  //財務更新SAP
  if (target == 0) {
    setFormFieldVisible('txaComments', state);
    setFormFieldVisible('btnAgree', state);
    setFormFieldVisible('btnReject', state);
    setFormFieldVisible('btnRFC1', true);
    setFormFieldVisible('txtRFC1Response', true);
    setFormFieldVisible('txtRFC1ResMessage', true);
    dgApplyDetailUnbind();
  }
}

/**
 * 採購清單明細點擊
 * @date      : 2023-08-17
 * @version   : 1.0
 */
function dgApplyDetailClick() {
  $('#secondDgApplyDetail').on('click', 'tr', function () {
    $(this).removeAttr('style');
    $(this).siblings().removeClass('k-state-selected');
    $(this).addClass('k-state-selected');
    let dataItem = $('#secondDgApplyDetail')
      .data('kendoGrid')
      .dataItem($('#secondDgApplyDetail tbody').find('tr.k-state-selected'));
    if (dataItem == null) {
      return;
    }
    dataGridIndex = dataItem.secondDgNO - 1;

    eFormHelper.getFieldValue(
      { fieldId: 'secondDgApplyDetail' },
      function (result) {
        //費用預算號碼
        let stringSplit =
          result.data.secondDgApplyDetail[
            dataGridIndex
          ].secondDgAssetclassName.split('(');

        setFieldNameObjectValue(
          'txtDgAssetclaValue',
          stringSplit[1].split(')')[0]
        );

        eFormHelper.triggerAutoLookup(
          { fieldId: 'getInternOrd' },
          function (res) {
            if ($('#dl2ndDgInternOrd option').length > 0) {
              setFieldNameObjectValue(
                'dl2ndDgInternOrd',
                $('#dl2ndDgInternOrd option')[1].value
              );
            }
          }
        );

        if (
          result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup1 !=
          ''
        ) {
          setFieldNameObjectValue(
            'num2ndDgQuantity',
            result.data.secondDgApplyDetail[dataGridIndex].secondDgQuantity
          );

          setFieldNameObjectValue(
            'dl2ndDgEvalgroup1',
            result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup1
          );

          setFieldNameObjectValue(
            'dl2ndEvalgroup3',
            result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup3
          );

          setFieldNameObjectValue(
            'txt2ndDgDepKey',
            result.data.secondDgApplyDetail[dataGridIndex].secondDgDepkey
          );
          setFieldNameObjectValue(
            'txt2ndDgUlifeYrs',
            result.data.secondDgApplyDetail[dataGridIndex].secondDgUlifeYrs
          );
        }
      }
    );

    editItemVisible(-1, true);
  });
}

/**
 * 採購清單明細移除點擊
 * @date      : 2023-08-22
 * @version   : 1.0
 */
function dgApplyDetailUnbind() {
  $('[id^=secondDgApplyDetail]').unbind('click');
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
  let num2ndDgQuantityResult,
    dl2ndDgInternOrdResult,
    dl2ndDgEvalgroup1Result,
    dl2ndDgEvalgroup1NameResult,
    txt2ndDgEvalgroup2Result,
    dl2ndEvalgroup3Result,
    txt2ndDgDepKeyResult,
    txt2ndDgUlifeYrsResult;

  num2ndDgQuantityResult = getFieldNameObjectValue('num2ndDgQuantity');

  dl2ndDgInternOrdResult = getFieldNameObjectValue('dl2ndDgInternOrd');

  dl2ndDgEvalgroup1Result = getFieldNameObjectValue('dl2ndDgEvalgroup1');

  if (getFieldNameObjectValue('dl2ndDgEvalgroup1') == 0) {
    dl2ndDgEvalgroup1NameResult = '營業';
  } else {
    dl2ndDgEvalgroup1NameResult = '製造';
  }

  txt2ndDgEvalgroup2Result = getFieldNameObjectValue('txt2ndDgEvalgroup2');

  dl2ndEvalgroup3Result = getFieldNameObjectValue('dl2ndEvalgroup3');

  txt2ndDgDepKeyResult = getFieldNameObjectValue('txt2ndDgDepKey');

  txt2ndDgUlifeYrsResult = getFieldNameObjectValue('txt2ndDgUlifeYrs');

  eFormHelper.getFieldValue(
    { fieldId: 'secondDgApplyDetail' },
    function (result) {
      if (
        num2ndDgQuantityResult != '' &&
        dl2ndDgInternOrdResult != '' &&
        dl2ndDgInternOrdResult != '-1' &&
        txt2ndDgDepKeyResult != '' &&
        txt2ndDgUlifeYrsResult != ''
      ) {
        result.data.secondDgApplyDetail[dataGridIndex].secondDgQuantity =
          num2ndDgQuantityResult;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgInternOrd =
          dl2ndDgInternOrdResult;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup1 =
          dl2ndDgEvalgroup1Result;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup1Name =
          dl2ndDgEvalgroup1NameResult;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup2 =
          txt2ndDgEvalgroup2Result;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgEvalgroup3 =
          dl2ndEvalgroup3Result;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgDepkey =
          txt2ndDgDepKeyResult;
        result.data.secondDgApplyDetail[dataGridIndex].secondDgUlifeYrs =
          txt2ndDgUlifeYrsResult;
        setFieldNameObjectValue('secondDgApplyDetail', result.data);
      } else {
        var strWarning = '';
        if (num2ndDgQuantityResult == '')
          strWarning += '【數量單位】未輸入<br>';
        if (
          !(
            dl2ndDgInternOrdResult != '-1' && dl2ndDgInternOrdResult != '請選擇'
          )
        )
          strWarning += '【費用預算號碼】未選擇<br>';
        if (txt2ndDgDepKeyResult == '') strWarning += '【折舊設定】未輸入<br>';
        if (txt2ndDgUlifeYrsResult == '') strWarning += '【年限】未輸入<br>';
        alertWarning(strWarning, '');
        return;
      }
      editItemVisible(-1, false);
    }
  );
}

/**
 * 取消修改Data Grid 的內容
 * @date      : 2023-09-14
 * @version   : 1.0
 */
function canceledit() {
  editItemVisible(-1, false);
  dataGridIndex = -1;
}

/**
 * 送出申請前檢查
 * @date      : 2023-09-04
 * @version   : 1.0
 */
eFormEvents.onBeforeSubmit = function (callback) {
  if (getFieldNameObjectValue('rdoManagerApproval') == 'Reject') {
    callback(true);
  } else {
    let check = false;
    eFormHelper.getFieldValue(
      { fieldId: 'secondDgApplyDetail' },
      function (result) {
        for (let i = 0; i < result.data.secondDgApplyDetail.length; i++) {
          if (result.data.secondDgApplyDetail[i].secondDgInternOrd == '') {
            alert('請編輯採購清單明細No' + (i + 1) + '資料。');
            check = false;
            break;
          } else {
            check = true;
          }
        }

        if (check) {
          callback(true);
        } else {
          callback(false);
        }
      }
    );

    if (checkActivityDisplayNameResult == '財務更新SAP') {
      let txtRFC3Response = getFieldNameObjectValue('txtRFC3Response');
      if (txtRFC3Response == 'S') {
        callback(true);
      } else {
        callback(false);
      }
    }
  }
};

/**
 * SAP RFC1：ZEFORMRFC_CO_ASSET_CREATE
 * @date      : 2023-08-16
 * @version   : 1.0
 */
function rFC1() {
  eFormHelper.triggerAutoLookup(
    {
      fieldId: 'getZeformrfcCoAssetCreate',
    },
    function (result) {
      if (result.isSuccess) {
        let txtRFC1Response = getFieldNameObjectValue('txtRFC1Response');
        if (txtRFC1Response == 'S') {
          let tempDataGridArray = [];

          //取得RFC1回覆的資料並整理
          eFormHelper.getFieldValue(
            { fieldId: 'tempRFCDataGrid' },
            function (getResult) {
              for (let i = 0; i < getResult.data.tempRFCDataGrid.length; i++) {
                let asset = getResult.data.tempRFCDataGrid[i].tempDgAsset;
                asset = asset.substring(4, asset.length);
                tempDataGridArray.push({
                  secondDgAsset: asset,
                  secondDgSubnumber:
                    getResult.data.tempRFCDataGrid[i].tempDgSubnumber,
                });
              }
            }
          );

          eFormHelper.getFieldValue(
            { fieldId: 'secondDgApplyDetail' },
            function (setResult) {
              for (
                let i = 0;
                i < setResult.data.secondDgApplyDetail.length;
                i++
              ) {
                setResult.data.secondDgApplyDetail[i].secondDgAsset =
                  tempDataGridArray[i].secondDgAsset;
                setResult.data.secondDgApplyDetail[i].secondDgSubnumber =
                  tempDataGridArray[i].secondDgSubnumber;
                setFieldNameObjectValue('secondDgApplyDetail', setResult.data);
              }
            }
          );
          setFormFieldVisible('btnRFC2', true);
          setFormFieldVisible('txtRFC2Response', true);
          setFormFieldVisible('txtRFC2ResMessage', true);
        }
      } else {
        console.log(res.error);
      }
    }
  );
}

/**
 * SAP RFC2：ZEFORMRFC_CO_ASSET_SETTLEMENT
 * @date      : 2023-08-16
 * @version   : 1.0
 */
function rFC2() {
  eFormHelper.triggerAutoLookup(
    {
      fieldId: 'getZeformrfcCoAssetSettlement',
    },
    function (res) {
      if (res.isSuccess) {
        let txtRFC2Response = getFieldNameObjectValue('txtRFC2Response');
        if (txtRFC2Response == 'S') {
          setFormFieldVisible('btnRFC3', true);
          setFormFieldVisible('txtRFC3Response', true);
          setFormFieldVisible('txtRFC3ResMessage', true);
        }
      } else {
        console.log(res.error);
      }
    }
  );
}

/**
 * SAP RFC3：ZEFORMRFC_AUC_SETTLEMENT
 * @date      : 2023-09-04
 * @version   : 1.0
 */
function rFC3() {
  eFormHelper.triggerAutoLookup(
    {
      fieldId: 'getZeformrfcAucSettlement',
    },
    function (res) {
      if (res.isSuccess) {
        let txtRFC3Response = getFieldNameObjectValue('txtRFC3Response');
        if (txtRFC3Response == 'S') {
          setFormFieldEnabled('btnFinish', true);
        }
      } else {
        console.log(res.error);
      }
    }
  );
}
