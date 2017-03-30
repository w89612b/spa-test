/*
 * spa.fake.js
 * Fake  module
 */
/*jslint browser:true,continue:true,devel:true,indent:2,maxerr:50,newcap:true,nomen:true,plusplus:true,regexp:true,sloppy:true,vars:true,white:true*/

/*global $, spa */
spa.fake = (function() {
  'use strict';
  var getPeopleList, fakeIdSerial, makeFakeId, mockSio;

  // 模拟服务器的ID序号
  fakeIdSerial = 5;
  // 创建生成模拟的服务端ID字符串
  makeFakeId = function() {
    return 'id_' + String(fakeIdSerial++);
  };

  getPeopleList = function() {
    return [{
      name: 'Betty',
      _id: 'id_01',
      css_map: {
        top: 20,
        left: 20,
        background_color: 'rgb(128,128,128)'
      }
    }, {
      name: 'Mike',
      _id: 'id_02',
      css_map: {
        top: 60,
        left: 20,
        background_color: 'rgb(128,255,128)'
      }
    }, {
      name: 'Pebbles',
      _id: 'id_03',
      css_map: {
        top: 100,
        left: 20,
        background_color: 'rgb(128,192,192)'
      }
    }, {
      name: 'Wilma',
      _id: 'id_04',
      css_map: {
        top: 140,
        left: 20,
        background_color: 'rgb(192,128,128)'
      }
    }]
  };

  // 定义mockSio对象闭包，它有两个公开方法：on和emit
  mockSio = (function() {
    var on_sio, emit_sio, callback_map = {};
    // 这个方法给某个消息类型注册回调函数，比如on_sio('updateuser',onUpdateuser);会给updateuser的消息类型注册回调函数onUpdateuser. 回调函数的参数是消息数据。
    on_sio = function(msg_type, callback) {
        callback_map[msg_type] = callback;
      }
      // 这个方法模拟向服务器发送消息，在第一轮，我们处理adduser的消息类型，当接收后，为模拟网络延时，等待3秒钟，然后再调用回调函数updateuser
    emit_sio = function(msg_type, data) {
      if (msg_type === 'adduser' && callback_map.userupdate) {
        setTimeout(function() {
          callback_map.userupdate([{
            _id: makeFakeId(),
            name: data.name,
            css_map: data.css_map
          }]);
        }, 3000);
      }
    };

    return {
      emit: emit_sio,
      on: on_sio
    };
  }());
  return { getPeopleList: getPeopleList, mockSio: mockSio };
}());