var channel_1_high = 8000;
var channel_1_low = 2000;
var channel_1_false = 0;
var temperature_point_1 = 25;
var hvac_timer_timeout_ms = 20 * 1000;
var hvac_timer_id = null;
// var control1 = ['wb-gpio']['EXT1_R3A1'];
// var a1 = ['wb-gpio']['A1_IN'];
// var a2 = ['wb-gpio']['A2_IN'];
// var temperature = ['wb-w1']['28-00000d6b460c'];

defineVirtualDevice('HVAC_test', {
  title: 'HVAC test', // Название устройства
  cells: {
    // параметры
    enabled: {
      type: 'switch', // тип
      value: false, // значение по умолчанию
    },
  },
});

//Функция запуска таймера проверки состояния для A2_IN
function runTimerHVAC() {
  if (hvac_timer_id) {
    clearTimeout(hvac_timer_id);
  }
  hvac_timer_id = setTimeout(function () {
    if (!['wb-gpio']['A2_IN']) {
      //Если датчик A2_IN состояние false через время таймера переводим виртуальное устройство в false и пишем лог
      dev['HVAC_test']['enabled'] = false;
      log('ALARM A2_IN'); // вывод сообщения в лог
    }
    hvac_timer_id = null;
  }, hvac_timer_timeout_ms);
}

//смотрим за изменением контрола A1_IN
//если true смотрим за состоянием A2_IN через запуск таймера в вызываемой функции
defineRule('swich_HVAC_test', {
  whenChanged: ['wb-gpio']['A1_IN'],
  then: function (newValue) {
    if (newValue) {
      dev['HVAC_test']['enabled'] = true;
      runTimerHVAC();
    } else {
      dev['HVAC_test']['enabled'] = false;
      log('ALARM A1_IN'); // вывод сообщения в лог
    }
  },
});

defineRule('whenChanged_HVAC_test', {
  whenChanged: ['HVAC_test']['enabled'], // топик, при изменении которого сработает правило
  then: function (newValue) {
    if (newValue) {
      dev['wb-gpio']['EXT1_R3A1'] = true;
      if (dev['wb-w1']['28-00000d6b460c'] > temperature_point_1) {//если температура 28-00000d6b460c >25
        dev['wb-mao4_209']['Channel 1'] = channel_1_high;
      } else {
        dev['wb-mao4_209']['Channel 1'] = channel_1_low;
      }
    } else {
      dev['wb-gpio']['EXT1_R3A1'] = false;
      dev['wb-mao4_209']['Channel 1'] = channel_1_false;
    }
  },
});
