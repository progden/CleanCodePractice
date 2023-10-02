<script setup lang="ts">
import { ref, onMounted, provide, reactive } from "vue"
import { getInitData, queryTestPlan } from "@/api/testPlan"
import { DocSpec } from "@/api/testPlan/type"
import { CustomTable, CustomTableOptionType } from "@/components/CustomTable/index"
import { CreateDialog, EditDialog } from "./components/index"

//data
const createDialog = ref<InstanceType<typeof CreateDialog> | null>(null)
const editDialog = ref<InstanceType<typeof EditDialog> | null>(null)
const option: CustomTableOptionType = {
  realPagination: false,
  pagination: {
    layout: "total, prev, pager, next, jumper"
  },
  table: {
    highlightCurrentRow: true,
    height: "100%"
  }
}
const data = ref<Array<any>>([])
const queryData = reactive({
  carrier: "",
  version: "",
  spec: "",
  status: ""
})
const carrierList = ref<Array<string>>([])
const specList = ref<Array<string>>([])
const versionList = ref<Array<string>>([])
const tableLoading = ref(false)
const currentRow = ref<DocSpec>({})
const pageLoading = ref(false)
//functions
const queryBtnClick = () => {
  getList()
}
const resetBtnClick = () => {
  queryData.carrier = ""
  queryData.version = ""
  queryData.spec = ""
  queryData.status = ""

  getList()
}
const createBtnClick = () => {
  createDialog.value?.show()
}
const editBtnClick = () => {
  editDialog.value?.show()
}
const getList = async () => {
  tableLoading.value = true
  const isOver1s = new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, 250)
  })
  const { data: resData } = await queryTestPlan(queryData)
  data.value = resData
  currentRow.value = {}
  await isOver1s
  tableLoading.value = false
}
const rowSelect = (rows: Array<DocSpec>) => {
  if (rows.length === 0) return
  currentRow.value = rows[0]
}
const init = async () => {
  pageLoading.value = true
  try {
    const { data } = await getInitData()
    carrierList.value = data.carriers.map((x) => x.value)
    specList.value = data.specs.map((x) => x.value)
    versionList.value = data.versions
  } catch (e) {
    console.error(e)
  } finally {
    pageLoading.value = false
  }
}
//init
provide("carrierList", carrierList)
provide("specList", specList)
onMounted(() => {
  init()
  getList()
})
</script>
<style scoped>
.form-item {
  width: calc(100% / 3);
}
.btn-form-item {
  width: calc(100% / 3);
  margin-left: calc(100% / 3);
}
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.table {
  height: calc(100% - 1.25rem);
}
</style>
<template>
  <div class="app-container" v-loading="pageLoading">
    <el-card mb-5 p-5 :body-style="{ padding: 0 }">
      <el-form label-width="100px" label-position="right" flex flex-wrap>
        <el-form-item label="Carrier" class="form-item">
          <el-select v-model="queryData.carrier">
            <el-option label="All" value="" />
            <el-option v-for="(carrier, index) in carrierList" :key="index" :value="carrier" />
          </el-select>
        </el-form-item>
        <el-form-item label="Version" class="form-item">
          <el-select v-model="queryData.version" filterable>
            <el-option label="All" value="" />
            <el-option v-for="(ver, index) in versionList" :key="index" :value="ver" />
          </el-select>
        </el-form-item>
        <el-form-item label="Spec" class="form-item">
          <el-select v-model="queryData.spec">
            <el-option label="All" value="" />
            <el-option v-for="(spec, index) in specList" :key="index" :value="spec" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status" class="form-item">
          <el-select v-model="queryData.status">
            <el-option label="All" value="" />
            <el-option label="Active" value="Active" />
            <el-option label="Inactive" value="Inactive" />
          </el-select>
        </el-form-item>
        <el-form-item class="btn-form-item" label-width="0">
          <el-button ml-auto w-100px type="primary" icon="Search" :loading="tableLoading" @click="queryBtnClick">
            Query
          </el-button>
          <el-button mr-auto w-100px type="danger" icon="Refresh" :loading="tableLoading" @click="resetBtnClick">
            Reset
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <CustomTable
      class="table"
      :data="data"
      :total="data.length"
      :option="option"
      v-loading="tableLoading"
      @selected="rowSelect"
    >
      <template #header>
        <el-form>
          <el-form-item>
            <el-button icon="Plus" type="primary" @click="createBtnClick">Create</el-button>
            <el-button icon="Edit" type="warning" @click="editBtnClick" :disabled="Object.keys(currentRow).length === 0"
              >Edit</el-button
            >
          </el-form-item>
        </el-form>
      </template>
      <template #body>
        <el-table-column label="Carrier" prop="docSource" />
        <el-table-column label="Version" prop="version" />
        <el-table-column label="Spec" prop="docGroup" />
        <el-table-column label="Status" prop="docStatus" />
        <el-table-column label="Column Config" prop="mapName" />
        <el-table-column label="Note" prop="note" />
      </template>
    </CustomTable>
    <CreateDialog ref="createDialog" @create="getList" />
    <EditDialog ref="editDialog" :data="currentRow" @update="getList" />
  </div>
</template>
