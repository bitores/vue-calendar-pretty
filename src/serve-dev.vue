<script>
import Vue from "vue";
import { VueCalendar } from "@/entry";

export default Vue.extend({
  name: "app",
  components: {
    VueCalendar
  },
  methods: {
    change(d) {
      console.log(d);
    }
  }
});
</script>

<template>
  <div id="app">
    <vue-calendar :value="new Date()" @change="change" />
  </div>
</template>
