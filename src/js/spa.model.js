/*
 * spa.model.js
 * model module
 */

/*jslint browser:true,continue:true,devel:true,indent:2,maxerr:50,newcap:true,nomen:true,plusplus:true,regexp:true,sloppy:true,vars:true,white:true*/

/*global TAFFY, $, spa */
spa.model = (function() {
  'use strict';

  var configMap = {
      anon_id: 'a0' // 为匿名人员保留一个特殊ID
    },
    stateMap = {
      anon_user: null, // 在状态映射中保留anon_user键，用以保存匿名person对象
      cid_serial: 0,
      user: null,
      people_cid_map: {}, // 在状态映射中保留people_cid_map键，用以保存person对象映射，键为用户ID
      people_db: TAFFY() // 在状态映射中保留people_db键，用以保存person对象的TaffyDB集合，集合初始化为空
    },
    isFakeData = true, // 设置isFakeData为true，这个标志告诉Model使用Fake模块的示例数据、对象和方法，而不是Data模块的真实数据。
    personProto, makeCid, clearPeopleDb, completeLogin, makePerson, removePerson, people, initModule;

  // 创建person对象原型，使用原型通常能减少对内存的需求，从而改进对象的性能
  personProto = {
    get_is_user: function() {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon: function() {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  // 添加客户端ID生成器
  makeCid = function() {
    return 'c' + String(stateMap.cid_serial++);
  };

  // 添加一个方法，移除所有除匿名人员之外的person对象，如果已有登入用户，则也要将当前用户对象除外。
  clearPeopleDb = function() {
    var user = stateMap.user;
    stateMap.people_db = TAFFY();
    stateMap.people_cid_map = {};

    if (user) {
      stateMap.people_db.insert(user);
      stateMap.people_cid_map[user.cid] = user;
    }
  };

  // 添加一个方法，当后端发送回用户的确认信息和数据时，完成用户的登入，此方法更新当前用户信息，然后发布登入成功的spa-login事件
  completeLogin = function(user_list) {
    var user_map = user_list[0];
    delete stateMap.people_cid_map[user_map.cid];
    stateMap.user.cid = user_map._id
    stateMap.user.id = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[user_map._id] = stateMap.user;

    $.gevent.publish('spa-login', [stateMap.user]);
  };

  // 添加创建person对象的makePerson方法，并将新创建的对象保存到TaffyDB集合里面。也要确保更新people_cid_map里面的索引。
  makePerson = function(person_map) {
    var person,
      cid = person_map.cid,
      css_map = person_map.css_map,
      id = person_map.id,
      name = person_map.name;

    if (cid === undefined || !name) {
      throw 'client id and name required';
    }

    // 使用Object.create(<prototype>)方法，根据原型创建对象，然后添加实例特殊属性。
    person = Object.create(personProto);
    person.cid = cid;
    person.name = name;
    person.css_map = css_map;
    if (id) { person.id = id }
    stateMap.people_cid_map[cid] = person;
    stateMap.people_db.insert(person);

    return person;
  };

  // 创建从人员列表中移除person对象的方法，添加一些检查，避免逻辑不一致，比如不会移除当前用户和匿名的person
  removePerson = function(person) {
    if (!person) { return false; }
    if (person.id === configMap.anon_id) {
      return false;
    }

    stateMap.people_db({ cid: person.cid }).remove();
    if (person.cid) {
      delete stateMap.people_cid_map[person.cid];
    }

    return true;
  };

  // 定义people对象
  people = (function() {
    // 定义people闭包，这允许我们只共享希望共享的方法。
    var get_by_cid, get_db, get_user, login, logout;
    // 在people闭包里面定义get_by_cid方法，这是一个便捷方法，很容易实现。
    get_by_cid = function(cid) {
      return stateMap.people_cid_map[cid]
    };
    // 返回person对象的taffydb集合
    get_db = function() {
      return stateMap.people_db;
    };
    // 返回当前用户对象
    get_user = function() {
      return stateMap.user;
    };
    // 这里不做任何想象的认证检查
    login = function(name) {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      stateMap.user = makePerson({
        cid: makeCid(),
        css_map: { top: 20, left: 25, backguround_color: '#888' },
        name: name
      });

      // 注册当后端发布了userupdate消息时完成登入过程的回调函数
      sio.on('userupdate', completeLogin);
      // 向后端发送adduser消息，携带用户的详细信息，这里添加用户和登入是一回事。
      sio.emit('adduser', {
        cid: stateMap.user.cid,
        css_map: stateMap.css_map,
        name: stateMap.name
      });
    }

    logout = function() {
      var is_removed, user = stateMap.user;

      is_removed = removePerson(user);
      stateMap.user = stateMap.anon_user;

      $.gevent.publish('spa-logout', [user]);

      return is_removed;
    }

    return {
      get_by_cid: get_by_cid,
      get_db: get_db,
      get_user: get_user,
      login: login,
      logout: logout
    }

  }());

  initModule = function() {
    var i, people_list, person_map;

    stateMap.anon_user = makePerson({
      cid: configMap.anon_id,
      id: configMap.anon_id,
      name: 'anonymous'
    });
    stateMap.user = stateMap.anon_user;

    if (isFakeData) {
      people_list = spa.fake.getPeopleList();
      for (var i = 0; i < people_list.length; i++) {
        person_map = people_list[i];
        makePerson({
          cid: person_map._id,
          css_map: person_map.css_map,
          id: person_map._id,
          name: person_map.name
        });
      }
    }
  };

  return {
    initModule: initModule,
    people: people
  };
}());