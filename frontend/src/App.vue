<template>
  <el-container>
    <el-header>
      <nav-bar />
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script>

import NavBar from './components/NavBar.vue';
import '@/assets/styles.css';

export default {
  name: 'App',
  components: {
    NavBar,
  },
};
</script>

<style scoped>
.el-main{
  padding: 10px;
}
.el-header{
  padding: 0 10px;
}
</style>
