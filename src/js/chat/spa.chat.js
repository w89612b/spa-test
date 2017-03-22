/*
 * spa.chat.js
 * chat feature module for SAP
 */

/*jslint browser:true,continue:true,devel:true,indent:2,maxerr:50,newcap:true,nomen:true,plusplus:true,regexp:true,sloppy:true,vars:true,white:true*/

/*global $, spa */
spa.chat = (function() {
  //-------------------------------BEGIN MODULE SCOPE VARIABLES--------------------------------------------------
  var configMap = {
      main_html: '<div style="padding:1em;color:#fff">say hello to that</div>',
      settable_map: {}
    },
    stateMap = { $container: null },
    jqueryMap = {},
    setJqueryMap, configModule, initModule;

  //-------------------------------BEGIN UTILITY METHODS-------------------------------------------------


  //-------------------------------BEGIN DOM METHODS-------------------------------------------------------
  setJqueryMap = function() {
    var $container = stateMap.$container;
    jqueryMap = { $container: $container };
  }

  //-------------------------------BEGIN EVENT METHODS-------------------------------------------------------


  //-------------------------------BEGIN PUBLIC METHODS--------------------------------------------------
  // begin public method /configModule/
  // 目的：调整允许键的配置可设置键和值的映射
  // 参数：
  //  * color_name - 颜色名字
  // 设置：
  //  * configMap.settable_map - 声明允许的键
  // 返回值：true
  // 异常抛出：无
  configModule = function(input_map) {
    spa.util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  }

  // begin public method /initModule/
  // 目的：初始化模型
  // 参数：
  //  * $container - 这个特性使用的jQuery元素
  // 返回值：true
  // 异常抛出：无
  initModule = function($container) {
    $container.html(configMap.main_html);
    stateMap.$container = $container;
    setJqueryMap();
    return true;
  }

  return {
    configModule: configModule,
    initModule: initModule
  }
}());