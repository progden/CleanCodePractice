<script setup lang="ts">
import { ref, reactive, onMounted, computed, provide } from "vue"
// import { useRoute } from "vue-router"
import type { TabsPaneContext } from "element-plus"
import { CustomTableOptionType } from "@/components/CustomTable/types/Option"
import CustomTable from "@/components/CustomTable/index.vue"
import AddDialog from "./components/AddDialog/index.vue"
import CoverDialog from "./components/CoverDialog/index.vue"
import DoneDialog from "./components/DoneDialog/index.vue"
import { useRoute, useRouter } from "vue-router"
import { TestCase } from "@/api/testRequest/type"
import {
  getPlanCaseByPlanId,
  createScope,
  getScopeCount,
  getCycleNameList,
  getAllTestCycleList,
  getScopeCaseWithCustomization
} from "@/api/testRequest"

//data
const router = useRouter()
const addDialog = ref<InstanceType<typeof AddDialog> | null>(null)
const searchAddDialog = ref<InstanceType<typeof AddDialog> | null>(null)
const coverDialog = ref<InstanceType<typeof CoverDialog> | null>(null)
const doneDialog = ref<InstanceType<typeof DoneDialog> | null>(null)
const activeName = ref("Waiting")
const route = useRoute()
const cycleId = ref("")
const planId = ref("")
const planName = ref("")
const carrier = ref("")
const cycleName = ref("")
const waitingData = ref<Array<TestCase>>([])
const searchData = ref<Array<TestCase>>([])
const waitingRowData = ref<Array<TestCase>>([])
const searchRowData = ref<Array<any>>([])
const formData = reactive({
  carrier: "",
  model: "",
  cycleName: "",
  status: "",
  testPlatform: "",
  customization: ""
})
const searchInput = ref("")
const waitingSearchInput = ref("")
const cycleNameList = ref<
  Array<{
    cycleName: string
  }>
>([])
const scopeStatusList = ref<
  Array<{
    key: string
    value: string
  }>
>([])
const testPlatformList = ref<
  Array<{
    key: string
    value: string
  }>
>([])
const isloading = ref(false)
//functions
const loadingChange = async () => {
  isloading.value = !isloading.value
}
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
const EditBtnClick = () => {
  // @ts-ignore
  addDialog.value?.show()
}
const searchAddBtnClick = () => {
  searchAddDialog.value?.show()
}
const coverBtnClick = () => {
  coverDialog.value?.show()
}
const doneBtnClick = () => {
  // @ts-ignore
  doneDialog.value?.show()
}
const selectWaitingData = (event: any) => {
  waitingRowData.value = event
}
const selectSearchData = (event: any) => {
  searchRowData.value = event
}
const editData = (data: { testCaseStatus: string; comment: string }) => {
  const modifiedItems = waitingData.value.filter((item1: TestCase) => {
    const matchingItem = waitingRowData.value.find((item2: TestCase) => item1.key === item2.key)
    return matchingItem !== undefined
  })
  modifiedItems.forEach((item) => {
    item.testCaseStatus = data.testCaseStatus
    item.comment = data.comment
    console.log(waitingData)
  })
}
const addSearchToSelected = (data: { status: any; comment: any }) => {
  const modifiedItems = waitingData.value.filter((item1: TestCase) => {
    const matchingItem = searchRowData.value.find((item2: TestCase) => item1.key === item2.key)
    return matchingItem !== undefined
  })
  modifiedItems.forEach((item) => {
    item.testCaseStatus = data.status
    item.comment = data.comment
  })
}
const coverToSelected = () => {
  const modifiedItems = waitingData.value.filter((item1: TestCase) => {
    const matchingItem = searchRowData.value.find((item2: TestCase) => item1.key === item2.key)
    return matchingItem !== undefined
  })
  modifiedItems.forEach((item) => {
    const matchingItem = searchRowData.value.find((item2: TestCase) => item.key === item2.key)
    if (matchingItem) {
      item.testCaseStatus = matchingItem.testCaseStatus
      item.comment = matchingItem.comment
    }
  })
}
const createScopeWithCase = async () => {
  const scopeData = reactive({
    planId: planId,
    planName: planName,
    cycleId: cycleId,
    caseList: waitingData
  })
  await loadingChange()
  await createScope(scopeData)
  router.push({
    path: "/testRequest/testingCycle"
  })
}
const option: CustomTableOptionType = {
  realPagination: false,
  pagination: {
    layout: "total, prev, pager, next, jumper"
  },
  table: {
    highlightCurrentRow: true
  }
}
const optionSearch: CustomTableOptionType = {
  realPagination: false,
  pagination: {
    layout: "total, prev, pager, next, jumper"
  },
  table: {
    highlightCurrentRow: true
  }
}
const computeTableData = computed(() => {
  const slicedArray: string[] = searchInput.value.split(",").map((item: string) => item.trim())
  const filter = (item: TestCase) => {
    // 檢查 TestCase 中的所有字串是否包含在 searchInput 中
    const { columnMap, ...newTestCase } = item
    const testCaseMatch = Object.values(newTestCase).some((val) => {
      if (val) return slicedArray.some((item) => item.includes(val))
    })

    // 檢查 ColumnMap 內的所有字串是否包含在 searchInput 中
    const columnMapMatch = columnMap?.some(
      (val) =>
        slicedArray.some((item) => item.includes(val.columnValue)) ||
        slicedArray.some((item) => item.includes(val.columnName))
    )

    // 返回符合條件的項目
    return testCaseMatch || columnMapMatch
  }
  return searchData.value.filter(filter)
})
const waitingComputeTableData = computed(() => {
  const slicedArray: string[] = waitingSearchInput.value.split(",").map((item: string) => item.trim())
  const filter = (item: TestCase) => {
    // 檢查 TestCase 中的所有字串是否包含在 waitingSearchInput 中
    const { columnMap, ...newTestCase } = item
    const testCaseMatch = Object.values(newTestCase).some((val) => {
      if (val) return slicedArray.some((item) => item.includes(val))
    })

    // 檢查 ColumnMap 內的所有字串是否包含在 waitingSearchInput 中
    const columnMapMatch = columnMap?.some(
      (val) =>
        slicedArray.some((item) => item.includes(val.columnValue)) ||
        slicedArray.some((item) => item.includes(val.columnName))
    )

    // 返回符合條件的項目
    return testCaseMatch || columnMapMatch
  }
  return waitingData.value.filter(filter)
})
const reset = () => {
  formData.cycleName = ""
  formData.customization = ""
  formData.testPlatform = ""
  formData.status = ""
}
const queryBtnClick = () => {
  console.log(formData)
  queryData()
}
//api
const queryData = async () => {
  await loadingChange()
  const res = await getScopeCaseWithCustomization(formData)
  searchData.value = res.data
  searchRowData.value = []
  await loadingChange()
}
const getPlanCase = async (planId: String) => {
  const formData = reactive({
    planId: planId
  })
  const res = await getPlanCaseByPlanId(formData)
  waitingData.value = res.data
  // 先把所有case的狀態改成特定狀態
  waitingData.value = waitingData.value.map((testCase) => {
    return { ...testCase, testCaseStatus: "00 - NIS" }
  })
}
const getQueryCycleName = async (carrier: String) => {
  const formData = reactive({
    carrier: carrier
  })
  const res = await getCycleNameList(formData)
  cycleNameList.value = res.data
}
const getAllList = async () => {
  const res = await getAllTestCycleList()
  scopeStatusList.value = res.data.scopeStatusList
  testPlatformList.value = res.data.testPlatformList
}
provide("scopeStatusList", scopeStatusList)
onMounted(async () => {
  await loadingChange()
  cycleId.value = route.query.cycleId as string
  planId.value = route.query.planId as string
  planName.value = route.query.planName as string
  carrier.value = route.query.carrier as string
  cycleName.value = route.query.cycleName as string
  const data = reactive({
    cycleId: cycleId.value
  })
  const res = await getScopeCount(data)
  if (res.code == 0 || res.code == 1) {
    router.push({
      path: "/testRequest/testingCycle"
    })
  }
  await getPlanCase(planId.value)
  await getQueryCycleName(carrier.value)
  await getAllList()
  await loadingChange()
  await queryData()
})
</script>
<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
#page {
  margin: auto;
  margin-top: 20px;
  width: 95%;
}
.formItem {
  width: 80%;
}
</style>
<template>
  <div id="page" v-loading="isloading">
    <div style="font-size: 30px">{{ planName }} - {{ cycleName }}</div>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="Waiting List" name="Waiting">
        <CustomTable
          :data="waitingComputeTableData"
          :total="waitingComputeTableData.length"
          :option="option"
          @selected="selectWaitingData($event)"
        >
          <template #header>
            <el-form>
              <el-form-item>
                <el-button type="primary" @click="EditBtnClick" :disabled="waitingRowData.length == 0">Edit</el-button>
                <div
                  style="display: inline-flex; flex-direction: column; width: calc(100% - 100px); align-items: flex-end"
                >
                  <el-button
                    type="primary"
                    @click="doneBtnClick"
                    :disabled="waitingData.some((testCase) => testCase.testCaseStatus === '')"
                    >Done</el-button
                  >
                </div>
              </el-form-item>
              <el-form-item label="Search" ml-auto>
                <el-input v-model="waitingSearchInput" />
              </el-form-item>
            </el-form>
          </template>
          <template #body>
            <el-table-column type="selection" />
            <el-table-column label="Test Case ID" prop="testCaseUniqueId" />
            <el-table-column label="Test Case Name" prop="testCaseDescription" />
            <el-table-column label="Test Platform" prop="testPlatform" />
            <el-table-column label="Note" prop="note" />
            <el-table-column label="Status" prop="testCaseStatus" />
            <el-table-column label="Comment" prop="comment" />
          </template>
        </CustomTable>
      </el-tab-pane>
      <el-tab-pane label="Search Result" name="Search">
        <el-card mb-5 p-5>
          <el-form :model="formData" label-width="40%" ref="form">
            <el-row>
              <el-col :span="24">
                <el-form-item label="Cycle Name" label-width="10%">
                  <el-select v-model="formData.cycleName" class="formItem" filterable>
                    <el-option
                      v-for="cycleName in cycleNameList"
                      :key="cycleName.cycleName"
                      :value="cycleName.cycleName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="Customization" label-width="30%">
                  <el-input v-model="formData.customization" class="formItem" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Test Platform" label-width="30%">
                  <el-select v-model="formData.testPlatform" class="formItem">
                    <el-option
                      v-for="testPlatform in testPlatformList"
                      :key="testPlatform.key"
                      :value="testPlatform.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Status" label-width="30%">
                  <el-select v-model="formData.status" class="formItem">
                    <el-option
                      v-for="scopeStatus in scopeStatusList"
                      :key="scopeStatus.key"
                      :value="scopeStatus.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <div flex flex-justify-end ml-auto>
                <el-button type="primary" @click="queryBtnClick"> Query </el-button>
                <el-button type="danger" @click="reset"> Reset </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
        <CustomTable
          :data="computeTableData"
          :total="computeTableData.length"
          :option="optionSearch"
          @selected="selectSearchData"
        >
          <template #header>
            <el-form>
              <el-form-item>
                <el-button type="primary" @click="searchAddBtnClick">Add</el-button>
                <el-button type="warning" @click="coverBtnClick">Copy</el-button>
                <el-form-item label="Search" ml-auto>
                  <el-input v-model="searchInput" />
                </el-form-item>
              </el-form-item>
            </el-form>
          </template>
          <template #body>
            <el-table-column type="selection" />
            <el-table-column type="expand">
              <template #default="props">
                <div m="4">
                  <p m="t-0 b-2" v-for="column in props.row.columnMap" :key="column.columnName">
                    {{ column.columnName }}:{{ column.columnValue }}
                  </p>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Test Case ID" prop="testCaseUniqueId" />
            <el-table-column label="Test Case Name" prop="testCaseDescription" />
            <el-table-column label="Test Platform" prop="testPlatform" />
            <el-table-column label="Status" prop="testCaseStatus" />
            <el-table-column label="Comment" prop="comment" />
            <el-table-column label="Test Result" prop="testResult" />
          </template>
        </CustomTable>
      </el-tab-pane>
    </el-tabs>
    <AddDialog ref="addDialog" @confirm="editData" />
    <AddDialog ref="searchAddDialog" @confirm="addSearchToSelected" />
    <CoverDialog ref="coverDialog" @confirm="coverToSelected" />
    <DoneDialog ref="doneDialog" @confirm="createScopeWithCase" />
  </div>
</template>
