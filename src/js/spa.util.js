/*
 * spa.util.js
 * 常规JavaScript实用程序
 * Michael S. Mikowski - mmikowski at gmail dot com。
 * 这些是我自1998年以来创建，编译和更新的例程，在网络上有灵感。
 *
 * MIT License
 */

/*jslint browser:true,continue:true,devel:true,indent:2,maxerr:50,newcap:true,nomen:true,plusplus:true,regexp:true,sloppy:true,vars:true,white:true*/

/*global $, spa */
spa.util = (function() {
  var makeError, setConfigMap;

  // begin public constructor /makeError/
  // 目的：一个方便的包装器来创建一个错误对象
  // 参数：
  // * name_text - 错误名称
  // * msg_text - 错误说明
  // * data - 可选数据附加到错误对象
  // 返回值：新创建的错误对象
  // 异常抛出：无
  makeError = function(name_text, msg_text, data) {
    var error = new Error();
    error.name = name_text;
    error.message = msg_text;
    if (data) { error.data = data }
    return error;
  }

  // begin public method /setConfigMap/
  // 目的：通用代码在功能模块中设置配置
  // 参数：
  //  * input_map - 在配置中设置键值映射
  //  * settable_map - 允许键的地图设置
  //  * config_map - 映射以应用设置
  // 返回值：true
  // 异常抛出：如果不允许输入键，则为异常
  setConfigMap = function(arg_map) {
    var input_map = arg_map.input_map,
      settable_map = arg_map.settable_map,
      config_map = arg_map.config_map,
      key_name, error;
    for (key_name in input_map) {
      if (input_map.hasOwnproperty(key_name)) {
        if (settable_map.hasOwnproperty(key_name)) {
          config_map[key_name] = input_map[key_name];
        } else {
          error = makeError('Bad Input', 'Setting config key |' + key_name + '| is not supported');
          throw error;
        }
      }
    }
  }
  return { makeError: makeError, setConfigMap: setConfigMap };
}());