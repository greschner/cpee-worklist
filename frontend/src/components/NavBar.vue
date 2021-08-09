<template>
  <el-menu
    :default-active="$route.path"
    mode="horizontal"
    router
  >
    <el-menu-item index="/dashboard">
      Dashboard
    </el-menu-item>
    <el-menu-item index="/logs">
      Logs
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {

};
</script>

<style>

</style>
