/*
 * spa.shell.js
 * shell module for spa
 */
/*jslint browser:true,continue:true,devel:true,indent:2,maxerr:50,newcap:true,nomen:true,plusplus:true,regexp:true,sloppy:true,vars:true,white:true*/

/*global $, spa */

spa.shell = (function() {
  /*声明所有在名字空间内可用的变量*/
  /****************************************BEGIN MODULE SCOPE VARIABLES**********************************************************/
  var
  // 静态配置值放在configMap变量中
    configMap = {
      // 定义给uriAnchor使用的映射，用于验证
      auchor_schema_map: {
        chat: { open: true, closed: true }
      },
      main_html: '<div class="spa-shell-head">\
      <div class="spa-shell-head-logo"></div>\
      <div class="spa-shell-head-acct"></div>\
      <div class="spa-shell-head-search"></div>\
    </div>\
    <div class="spa-shell-main">\
      <div class="spa-shell-main-nav"></div>\
      <div class="spa-shell-main-content"></div>\
    </div>\
    <div class="spa-shell-foot"></div>\
    <div class="spa-shell-chat"></div>\
    <div class="spa-shell-modal"></div>',
      chat_extend_time: 1000,
      chat_extend_height: 450,
      chat_extend_title: 'Chick to retract',
      chat_retract_time: 300,
      chat_retract_height: 15,
      chat_retract_title: 'Click to extend'
    },
    // 将在模块中共享的动态信息放在stateMap变量中
    stateMap = {
      $container: null,
      anchor_map: {},
      is_chat_retracted: true
    },
    // 将jQuery集合缓存在jQueryMap中
    jqueryMap = {},
    setJQueryMap, toggleChat, onClickChat, initModule, copyAnchorMap, changeAnchorPart, onHashchange;

  /*保留区块 此区块函数不和页面元素交互*/
  /****************************************BEGIN UTILITY METHODS**********************************************************/
  copyAnchorMap = function() {
    return $.extend(true, {}, stateMap.anchor_map);
  }

  /*将创建和操作页面元素的函数放在DOMMethods区块中*/
  /****************************************BEGIN DOM METHODS**********************************************************/
  setJQueryMap = function() {
      var $container = stateMap.$container;
      jqueryMap = {
        $container: $container,
        $chat: $container.find('.spa-shell-chat') // 将聊天滑块的jQuery集合缓存到jQueryMap中
      };
    }
    // begin DOM methods /toggleChat/
    // 目的：打开或关闭聊天滑块
    // 状态： 设置 stateMap.is_chat_retracted
    //  * true - 聊天滑块关闭
    //  * false - 聊天滑块打开
  toggleChat = function(do_extend, callback) {
    var px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extend_height,
      is_closed = px_chat_ht === configMap.chat_retract_height,
      is_sliding = !is_open && !is_closed;
    // 避免出现竞争条件，即滑块可能同时在展开和收缩
    if (is_sliding) { return false; }
    // 聊天滑块打开
    if (do_extend) {
      jqueryMap.$chat.animate({ height: configMap.chat_extend_height },
        configMap.chat_extend_time,
        function() {
          jqueryMap.$chat.attr('title', configMap.chat_extend_title);
          stateMap.is_chat_retracted = false;
          if (callback) {
            callback(configMap.$chat);
          }
        }
      );
      return true;
    }
    //聊天滑块关闭
    jqueryMap.$chat.animate({ height: configMap.chat_retract_height },
      configMap.chat_retract_time,
      function() {
        jqueryMap.$chat.attr('title', configMap.chat_retract_title);
        stateMap.is_chat_retracted = true;
        if (callback) {
          callback(configMap.$chat);
        }
      }
    );
    return true;
  }

  // begin DOM methods /changeAnchorPart/
  // 目的：更改URI锚组件的一部分
  // 参数:
  // * arg_map - 该地图描述了我们想要改变的uri锚的什么部分
  // 返回值: boolean
  // * true - uri的锚部分被更新
  // * false - uri的锚部分没有更新
  // 代码核心说明:
  // 使用copyAnchorMap（）创建此映射的副本。
  // 使用arg_map修改键值。
  // 管理编码中的独立值和依赖值之间的区别。
  // 尝试使用uriAnchor更改uri。
  // 成功返回true，失败返回false。
  changeAnchorPart = function(arg_map) {
    var anchor_map_revise = copyAnchorMap(),
      bool_retrun = true,
      key_name, key_name_dep;
    // 开始合并并更改锚映射
    KEYVAL: for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        // 在迭代期间跳过相关键
        if (key_name.indexOf('_') === 0) {
          continue KEYVAL;
        }
        // 更新独立键值
        anchor_map_revise[key_name] = arg_map[key_name];
        // 更新匹配依赖项
        key_name_dep = '_' + key_name;
        if (arg_map[key_name_dep]) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep]
        }
      }
    }

    // 开始更新URI，如果不能通过模式（schema）验证就不设置锚，当发生异常时，把锚组件回滚到之前的状态。
    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_retrun = false;
    }

    return bool_retrun;
  }

  /*事件处理区块*/
  /****************************************BEGIN EVENT HANDLERS**********************************************************/
  onClickChat = function(event) {
    /*if (toggleChat(stateMap.is_chat_retracted)) {
      $.uriAnchor.setAnchor({
        chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
      })
    }*/

    changeAnchorPart({ chat: (stateMap.is_chat_retracted ? 'open' : 'closed') })
    return false;
  }

  // begin Event handler /onHashchange/
  // 目的: 处理hashchange事件
  // 参数：
  //  * event - jQuery事件对象
  // 设置：无
  // 返回值：false
  // 代码核心说明：
  // 添加onHashchange事件处理程序来处理URI锚变化。使用uriAnchor插件来将锚转换映射，与之前的状态比较，以确定要采取的动作。如果提议的锚变化是无效的，则将锚重置为之前的值。
  onHashchange = function(event) {
    var anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed,
      s_chat_proposed;

    // 尝试解析锚点
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // 变量
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    // 调整聊天滑块组件变化
    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch (s_chat_proposed) {
        case 'open':
          toggleChat(true);
          break;
        case 'closed':
          toggleChat(false);
          break;
        default:
          toggleChat(false);
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
          break;
      }
    }

    return false;
  }

  /*开放函数区块*/
  /****************************************BEGIN PUBLIC METHODS**********************************************************/
  initModule = function($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJQueryMap();
    // 初始化聊天滑块关闭，并且添加聊天滑块点击事件
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat.attr('title', configMap.chat_retract_title).click(onClickChat);

    // 配置uriAnchor插件，用于检测模式（schema）
    $.uriAnchor.configModule({
      schema_map: configMap.auchor_schema_map
    });
    $(window).bind('hashchange', onHashchange).trigger('hashchange');
  }
  return { initModule: initModule };
}())