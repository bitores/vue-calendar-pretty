<script>
import Vue from "vue";
import { VueDatePicker } from "@/entry";

export default Vue.extend({
  name: "app",
  components: {
    VueDatePicker
  }
});
</script>

<template>
  <div id="app">
    <vue-date-picker />
  </div>
</template>
