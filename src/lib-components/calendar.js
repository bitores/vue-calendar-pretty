import { lunarInfo, solarMonth, Gan, Zhi, Animals, solarTerm, sTermInfo, nStr1, nStr2, monthNameCN, monthName, sFtv, lFtv, wFtv } from './common';
/*****************************************************************************
日期计算
*****************************************************************************/

//====================================== 返回农历 y年的总天数
function lYearDays(y) {
  var i, sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  return (sum + leapDays(y));
}

//====================================== 返回农历 y年闰月的天数
function leapDays(y) {
  if (leapMonth(y)) return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
  else return (0);
}

//====================================== 返回农历 y年闰哪个月 1-12 , 没闰返回 0
function leapMonth(y) {
  return (lunarInfo[y - 1900] & 0xf);
}

//====================================== 返回农历 y年m月的总天数
function monthDays(y, m) {
  return ((lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
}


//====================================== 算出农历, 传入日期控件, 返回农历日期控件
//                                       该控件属性有 .year .month .day .isLeap
function Lunar(objDate) {

  var i, leap = 0, temp = 0;
  var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;

  for (i = 1900; i < 2050 && offset > 0; i++) { temp = lYearDays(i); offset -= temp; }

  if (offset < 0) { offset += temp; i--; }

  this.year = i;

  leap = leapMonth(i); //闰哪个月
  this.isLeap = false;

  for (i = 1; i < 13 && offset > 0; i++) {
    //闰月
    if (leap > 0 && i == (leap + 1) && this.isLeap == false) { --i; this.isLeap = true; temp = leapDays(this.year); }
    else { temp = monthDays(this.year, i); }

    //解除闰月
    if (this.isLeap == true && i == (leap + 1)) this.isLeap = false;

    offset -= temp;
  }

  if (offset == 0 && leap > 0 && i == leap + 1)
    if (this.isLeap) { this.isLeap = false; }
    else { this.isLeap = true; --i; }

  if (offset < 0) { offset += temp; --i; }

  this.month = i;
  this.day = offset + 1;
}

//==============================返回公历 y年某m+1月的天数
function solarDays(y, m) {
  if (m == 1)
    return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
  else
    return (solarMonth[m]);
}
//============================== 传入 offset 返回干支, 0=甲子
function cyclical(num) {
  return (Gan[num % 10] + Zhi[num % 12]);
}

//======================================= 返回该年的复活节(春分后第一次满月周后的第一主日)
function easter(y) {

  var term2 = sTerm(y, 5); //取得春分日期
  var dayTerm2 = new Date(Date.UTC(y, 2, term2, 0, 0, 0, 0)); //取得春分的公历日期控件(春分一定出现在3月)
  var lDayTerm2 = new Lunar(dayTerm2); //取得取得春分农历

  if (lDayTerm2.day < 15) //取得下个月圆的相差天数
    var lMlen = 15 - lDayTerm2.day;
  else
    var lMlen = (lDayTerm2.isLeap ? leapDays(y) : monthDays(y, lDayTerm2.month)) - lDayTerm2.day + 15;

  //一天等于 1000*60*60*24 = 86400000 毫秒
  var l15 = new Date(dayTerm2.getTime() + 86400000 * lMlen); //求出第一次月圆为公历几日
  var dayEaster = new Date(l15.getTime() + 86400000 * (7 - l15.getUTCDay())); //求出下个周日

  this.m = dayEaster.getUTCMonth();
  this.d = dayEaster.getUTCDate();

}

//====================== 中文星期
function znWeek(w) {
  return nStr1[w];
}

//====================== 中文日期
function znDay(d) {
  var s;

  switch (d) {
    case 10:
      s = '初十'; break;
    case 20:
      s = '二十'; break;
      break;
    case 30:
      s = '三十'; break;
      break;
    default:
      s = nStr2[Math.floor(d / 10)];
      s += nStr1[d % 10];
  }
  return (s);
}


/*获取上个月*/
export function getPreMonth(date) {
  var d = new Date(date);
  var year = d.getFullYear(); //获取当前日期的年份
  var month = d.getMonth(); //获取当前日期的月份

  var year2 = year;
  var month2 = parseInt(month) - 1;
  if (month2 == -1) {
    year2 = parseInt(year2) - 1;
    month2 = 11;
  }

  var t2 = year2 + '-' + month2;
  return [year2, month2];
}
/*获取下个月*/
export function getNextMonth(date) {
  var d = new Date(date);
  var year = d.getFullYear(); //获取当前日期的年份
  var month = d.getMonth(); //获取当前日期的月份

  var year2 = year;
  var month2 = parseInt(month) + 1;
  if (month2 == 12) {
    year2 = parseInt(year2) + 1;
    month2 = 0;
  }
  var t2 = year2 + '-' + month2;
  return [year2, month2];
}


//============================== 阴历属性
function calTable(sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay) {

  this.isToday = false;
  //瓣句
  this.sYear = sYear;   //公元年4位数字
  this.sYear_zn = Animals[(sYear - 4) % 12]; //生肖年
  this.sMonth = sMonth;  //公元月数字
  this.sMonth_zn = monthNameCN[sMonth];  //公元月数字
  this.sDay = sDay;    //公元日数字
  this.week = week;    //星期, 1个中文
  this.week_zn = znWeek(week);    //星期, 1个中文
  //农历
  this.lYear = lYear;   //公元年4位数字
  this.lMonth = lMonth;  //农历月数字
  this.lDay = lDay;    //农历日数字
  this.lDay_zn = znDay(lDay);
  this.isLeap = isLeap;  //是否为农历闰月?
  //八字
  this.cYear = cYear;   //年柱, 2个中文
  this.cMonth = cMonth;  //月柱, 2个中文
  this.cDay = cDay;    //日柱, 2个中文

  this.color = '';



  this.lunarFestival = ''; //农历节日
  this.solarFestival = ''; //公历节日
  this.solarTerms = ''; //节气
}

//===== 某年的第n个节气为几日(从0小寒起算)
function sTerm(y, n) {
  var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
  return (offDate.getUTCDate());
}




//============================== 返回阴历控件 (y年,m+1月)
/*
功能说明: 返回整个月的日期资料控件

使用方式: OBJ = new calendar(年,零起算月);

OBJ.length      返回当月最大日
OBJ.firstWeek   返回当月一日星期

由 OBJ[日期].属性名称 即可取得各项值

OBJ[日期].isToday  返回是否为今日 true 或 false

其他 OBJ[日期] 属性参见 calTable() 中的注解
*/
export function calendar(y, m) {

  var sDObj, lDObj, lY, lM, lD = 1, lL, lX = 0, tmp1, tmp2, tmp3;
  var cY, cM, cD; //年柱,月柱,日柱
  var lDPOS = new Array(3);
  var n = 0;
  var firstLM = 0;

  sDObj = new Date(y, m, 1, 0, 0, 0, 0);    //当月一日日期

  this.length = solarDays(y, m);    //公历当月天数
  this.firstWeek = sDObj.getDay();    //公历当月1日星期几

  ////////年柱 1900年立春后为庚子年(60进制36)
  if (m < 2) cY = cyclical(y - 1900 + 36 - 1);
  else cY = cyclical(y - 1900 + 36);
  var term2 = sTerm(y, 2); //立春日期

  ////////月柱 1900年1月小寒以前为 丙子月(60进制12)
  var firstNode = sTerm(y, m * 2) //返回当月「节」为几日开始
  cM = cyclical((y - 1900) * 12 + m + 12);

  //当月一日与 1900/1/1 相差天数
  //1900/1/1与 1970/1/1 相差25567日, 1900/1/1 日柱为甲戌日(60进制10)
  var dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;

  for (var i = 0; i < this.length; i++) {

    if (lD > lX) {
      sDObj = new Date(y, m, i + 1);    //当月一日日期
      lDObj = new Lunar(sDObj);     //农历
      lY = lDObj.year;           //农历年
      lM = lDObj.month;          //农历月
      lD = lDObj.day;            //农历日
      lL = lDObj.isLeap;         //农历是否闰月
      lX = lL ? leapDays(lY) : monthDays(lY, lM); //农历当月最后一天

      if (n == 0) firstLM = lM;
      lDPOS[n++] = i - lD + 1;
    }

    //依节气调整二月分的年柱, 以立春为界
    if (m == 1 && (i + 1) == term2) cY = cyclical(y - 1900 + 36);
    //依节气月柱, 以「节」为界
    if ((i + 1) == firstNode) cM = cyclical((y - 1900) * 12 + m + 13);
    //日柱
    cD = cyclical(dayCyclical + i);

    //sYear,sMonth,sDay,week,
    //lYear,lMonth,lDay,isLeap,
    //cYear,cMonth,cDay
    this[i] = new calTable(
      y, m + 1, i + 1,
      // nStr1[], 
      (i + this.firstWeek) % 7,
      lY, lM, lD++, lL,
      cY, cM, cD);
  }

  //节气
  tmp1 = sTerm(y, m * 2) - 1;
  tmp2 = sTerm(y, m * 2 + 1) - 1;
  this[tmp1].solarTerms = solarTerm[m * 2];
  this[tmp2].solarTerms = solarTerm[m * 2 + 1];
  if (m == 3) this[tmp1].color = 'red'; //清明颜色

  //公历节日
  for (i in sFtv)
    if (sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/))
      if (Number(RegExp.$1) == (m + 1)) {
        this[Number(RegExp.$2) - 1].solarFestival += RegExp.$4 + ' ';
        if (RegExp.$3 == '*') this[Number(RegExp.$2) - 1].color = 'red';
      }

  //月周节日
  for (i in wFtv)
    if (wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/))
      if (Number(RegExp.$1) == (m + 1)) {
        tmp1 = Number(RegExp.$2);
        tmp2 = Number(RegExp.$3);
        if (tmp1 < 5)
          this[((this.firstWeek > tmp2) ? 7 : 0) + 7 * (tmp1 - 1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5 + ' ';
        else {
          tmp1 -= 5;
          tmp3 = (this.firstWeek + this.length - 1) % 7; //当月最后一天星期?
          this[this.length - tmp3 - 7 * tmp1 + tmp2 - (tmp2 > tmp3 ? 7 : 0) - 1].solarFestival += RegExp.$5 + ' ';
        }
      }

  //农历节日
  for (i in lFtv)
    if (lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
      tmp1 = Number(RegExp.$1) - firstLM;
      if (tmp1 == -11) tmp1 = 1;
      if (tmp1 >= 0 && tmp1 < n) {
        tmp2 = lDPOS[tmp1] + Number(RegExp.$2) - 1;
        if (tmp2 >= 0 && tmp2 < this.length && this[tmp2].isLeap != true) {
          this[tmp2].lunarFestival += RegExp.$4 + ' ';
          if (RegExp.$3 == '*') this[tmp2].color = 'red';
        }
      }
    }


  //复活节只出现在3或4月
  if (m == 2 || m == 3) {
    var estDay = new easter(y);
    if (m == estDay.m)
      this[estDay.d - 1].solarFestival = this[estDay.d - 1].solarFestival + ' 复活节 Easter Sunday';
  }


  if (m == 2) this[20].solarFestival = this[20].solarFestival + unescape('%20%u6D35%u8CE2%u751F%u65E5');

  //黑色星期五
  if ((this.firstWeek + 12) % 7 == 5)
    this[12].solarFestival += '黑色星期五';

  var Today = new Date();
  var tY = Today.getFullYear();
  var tM = Today.getMonth();
  var tD = Today.getDate();

  //今日
  if (y == tY && m == tM) this[tD - 1].isToday = true;
  this.y = y;
  this.m = m + 1;

}


///////////////////////////////////////////////////////////////////////////////


