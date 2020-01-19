<template>
  <div class="result-op c-container" tpl="calendar_new">
    <div class="op-calendar-new">
      <div class="op-calendar-new-box">
        <div class="op-calendar-new-left c-clearfix">
          <div class="op-calendar-new-select-box" style="visibility: visible;">
            <div class="op-calendar-new-year-box">
              <div
                key="data-click"
                class="c-dropdown2 OP_LOG_BTN c-dropdown2-common"
                style="z-index: 200;"
              >
                <div class="c-dropdown2-btn-group">
                  <select id="mySelect" v-model="cY" @change="changeDate">
                    <option v-for="i in years" :key="i" :value="i"
                      >{{ i }}年</option
                    >
                  </select>
                </div>
              </div>
            </div>
            <div class="op-calendar-new-month-box">
              <a
                href="javascript:;"
                class="op-calendar-new-prev-month"
                @click="preMonth"
                >&lt;</a
              >
              <a
                href="javascript:;"
                class="op-calendar-new-next-month"
                @click="nextMonth"
                >&gt;</a
              >
              <div
                key="data-click"
                class="c-dropdown2 OP_LOG_BTN c-dropdown2-common"
                style="z-index: 198;"
              >
                <div class="c-dropdown2-btn-group">
                  <select id="mySelect" v-model="cM" @change="changeDate">
                    <option v-for="i in 12" :key="i" :value="i - 1"
                      >{{ i }}月</option
                    >
                  </select>
                </div>
              </div>
            </div>
          </div>

          <a
            class="c-btn op-calendar-new-backtoday OP_LOG_BTN"
            href="javascript:;"
            @click="reback"
            >返回今天</a
          >

          <div class="op-calendar-new-table-box c-gap-top">
            <table
              class="op-calendar-new-table"
              :class="{ 'op-calendar-new-table-six': dates.length == 6 }"
            >
              <tbody>
                <tr>
                  <th>一</th>
                  <th>二</th>
                  <th>三</th>
                  <th>四</th>
                  <th>五</th>
                  <th class="op-calendar-new-table-weekend">六</th>
                  <th class="op-calendar-new-table-weekend">日</th>
                </tr>
                <tr v-for="(rows, ind) in dates" :key="ind">
                  <td
                    v-for="(date, index) in rows"
                    :key="index"
                    @click="() => clickTd(date)"
                  >
                    <div class="op-calendar-new-relative">
                      <a
                        href="javascript:;"
                        hidefocus="true"
                        :class="{
                          'op-calendar-new-table-work': date.isBreak == 2,
                          'op-calendar-new-table-rest': date.isBreak == 1,
                          'op-calendar-new-table-other-month': date.other,
                          'op-calendar-new-table-weekend':
                            [0, 6].indexOf(date.week) > -1,
                          'op-calendar-new-table-festival':
                            date.lunarFestival !== '' ||
                            date.solarFestival !== '' ||
                            date.solarTerms !== '',
                          'op-calendar-new-table-border op-calendar-new-table-selected':
                            date.isToday && date.isBreak == 2,
                          'op-calendar-new-table-today op-calendar-new-table-selected':
                            date.isToday && date.isBreak !== 2
                        }"
                      >
                        <!--  -->
                        <span
                          class="op-calendar-new-table-holiday-sign"
                          v-if="date.isBreak == 1"
                          >休</span
                        >
                        <span
                          class="op-calendar-new-table-holiday-sign"
                          v-if="date.isBreak == 2"
                          >班</span
                        >
                        <span class="op-calendar-new-daynumber">{{
                          date.sDay
                        }}</span>
                        <span class="op-calendar-new-table-almanac">{{
                          date.solarTerms ||
                            date.lunarFestival ||
                            date.solarFestival ||
                            date.lDay_zn
                        }}</span>
                        <span class="op-calendar-new-table-ticket "></span>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="op-calendar-new-right">
          <p class="op-calendar-new-right-date">
            {{ selDate.sYear }}-{{ selDate.sMonth }}-{{ selDate.sDay }} 星期{{
              selDate.week_zn
            }}
          </p>
          <p class="op-calendar-new-right-day">{{ selDate.sDay }}</p>
          <p class="op-calendar-new-right-lunar c-gap-top-small">
            <span>{{ selDate.sMonth_zn }}月{{ selDate.lDay_zn }}</span
            ><span>{{ selDate.cYear }}年 【{{ selDate.sYear_zn }}年】</span
            ><span>{{ selDate.cMonth }}月 {{ selDate.cDay }}日</span>
          </p>
          <center>{{ selDate.xz }}座</center>
        </div>
      </div>
      <div class="op-calendar-new-holidaytip" style="display: none;"></div>
    </div>
    <div><span class="c-showurl"></span></div>
  </div>
</template>

<script>
import { calendar, getPreMonth, getNextMonth } from "./calendar";
import { vacationBreak } from "./vacation-break";
export default {
  props: {
    value: {
      type: Date,
      default: new Date()
    }
  },
  data() {
    return {
      years: [],
      months: [],
      dates: [],
      cY: this.value.getFullYear(),
      cM: this.value.getMonth(),
      isInit: true,
      selDate: {}
    };
  },
  created() {
    let years = [],
      months = [];
    for (let i = 1990; i <= 2050; i++) years.push(i);
    for (let i = 1; i <= 12; i++) months.push(i);
    this.years = years;
    this.months = months;
  },
  mounted() {
    this.cal(this.value);
  },
  methods: {
    preMonth() {
      let m = this.cM - 1;
      if (m < 0) {
        this.cM = 11;
        this.cY -= 1;
      } else {
        this.cM = m;
      }
      this.changeDate();
    },
    nextMonth() {
      let m = this.cM + 1;
      if (m > 11) {
        this.cM = 0;
        this.cY += 1;
      } else {
        this.cM = m;
      }
      this.changeDate();
    },
    clickTd(date) {
      this.selDate = date;
      this.cY = date.sYear;
      this.cM = date.sMonth - 1;
      this.isInit = false;
      this.changeDate();
      this.$emit("change", date);
    },
    changeDate() {
      // this.selDate =
      this.cal(new Date(this.cY, this.cM));
    },
    reback() {
      this.isInit = true;
      this.cY = new Date().getFullYear();
      this.cM = new Date().getMonth();
      this.changeDate();
    },
    // 逻辑待优化
    cal(date) {
      let cDate = new Date(date);
      let uDate = getPreMonth(cDate);
      let nDate = getNextMonth(cDate);
      let uc = new calendar(uDate[0], uDate[1]);
      let cc = new calendar(cDate.getFullYear(), cDate.getMonth());
      let nc = new calendar(nDate[0], nDate[1]);

      let ret = [];

      let uw = cc[0].week;
      let i = 0;
      if (uw == 0) uw = 7;
      while (--uw) {
        let ind = parseInt(i / 7);
        let s = uc[uc.length - 1 - i];
        s.other = true;
        ret[ind] = ret[ind] || [];
        ret[ind].unshift(s);
        i++;
      }

      for (let j = 0, len = cc.length; j < len; j++) {
        let ind = parseInt(i / 7);
        let s = cc[j];
        if (s.isToday && this.isInit) {
          this.selDate = s;
        }
        ret[ind] = ret[ind] || [];
        ret[ind].push(s);
        i++;
      }

      let nw = cc[cc.length - 1].week;
      let k = 0;
      while (nw != 0 && nw++ < 7) {
        let ind = parseInt(i / 7);
        let s = nc[k];
        s.other = true;
        ret[ind] = ret[ind] || [];
        ret[ind].push(s);
        k++;
      }

      // 计算节假休息日及调休
      ret.map(arr => {
        arr.map(item => {
          // item.ok = true;
          const { sYear, sMonth, sDay } = item;
          let str = `${sYear}${sMonth > 9 ? sMonth : "0" + sMonth}${
            sDay > 9 ? sDay : "0" + sDay
          }`;
          if (vacationBreak.indexOf(str) > -1) {
            if (item.week !== 6 && item.week !== 0) {
              item.isBreak = 1;
            } else {
            }
          } else {
            if (
              item.sYear <= 2020 &&
              item.sYear >= 2010 &&
              (item.week == 6 || item.week == 0)
            ) {
              item.isBreak = 2;
            } else {
              item.isBreak = 3; // 未知
            }
          }
        });
      });
      this.dates = ret;
    }
  }
};
</script>

<style lang="less" src="./index.less"></style>
