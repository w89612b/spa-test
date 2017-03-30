/*
 * spa.util_b.js
 * JavaScript browser utilities
 * Compiled by Michael S. Mikowski
 * 这些是我自1998年以来创建，编译和更新的例程，在网络上有灵感。
 *
 * MIT License
 */
/*jslint browser:true,continue:true,devel:true,indent:2,maxerr:50,newcap:true,nomen:true,plusplus:true,regexp:true,sloppy:true,vars:true,white:true*/

/*global $, spa, getComputedStyle */
spa.util_b = (function() {
  'use strict';

  var configMap = {
      regex_encode_html: /[&"'><]/g,
      regex_encode_noamp: /["'><]/g,
      html_encode_map: {
        '&': '&#38;',
        '"': '&#34;',
        "'": '&#39;',
        '>': '&#62',
        '<': '&#60'
      }
    },
    decodeHtml, encodeHtml, getEmSize;

  // 创建一份修改后的配置的副本，用于编码实体
  configMap.encode_noamp_map = $.extend({}, configMap.html_encode_map);
  // 但要移除&符号
  delete configMap.encode_noamp_map['&'];

  //------------------BEGIN UTILITY METHODS--------------------------------------------------------------------
  // begin decodeHtml
  // 创建decodeHtml方法， 把浏览器实体（&amp;）转换成显示字符&。
  decodeHtml = function(str) {
    return $('<div/>').html(str || '').text();
  }

  // begin encodeHtml
  // 创建encodeHtml方法，把特殊字符（如&）转换成HTML编码值
  encodeHtml = function(input_agr_str, exclude_amp) {
    var input_str = String(input_agr_str),
      regex, lookup_map;

    if (exclude_amp) {
      lookup_map = configMap.encode_noamp_map;
      regex = configMap.regex_encode_noamp;
    } else {
      lookup_map = configMap.html_encode_map;
      regex = configMap.regex_encode_html
    }

    return input_agr_str.replace(regex, function(match, name) {
      return lookup_map[match] || '';
    });
  }

  // begin getEmSize
  // 创建getEmSize方法，计算以em为单位的像素大小
  getEmSize = function(elem) {
    return Number(getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0])
  }
  return {
    decodeHtml: decodeHtml,
    encodeHtml: encodeHtml,
    getEmSize: getEmSize
  };
}());