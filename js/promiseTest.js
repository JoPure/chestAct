/**
 * Created by jo.chan on 2018/1/17.
 */


/**
 * Created by jo.chan on 2017/8/8.
 */

window.CLocalStorage = {
    getItem: function (key) {
        try {
            if (window.localStorage) {
                return store.get(key);
            } else {
                return Cookies.get(key);
            }
        } catch (e) {
            console.error(e);
        }
    },
    getJsonItem: function (key) {
        try {
            if (window.localStorage) {
                return store.get(key);
            } else {
                return JSON.parse(Cookies.get(key));
            }
        } catch (e) {
            console.error(e);
        }
    },
    setItem: function (key, value) {
        try {
            if (window.localStorage) {
                store.set(key, value);
            } else {
                Cookies.set(key, value, {
                    expires: 30
                });
            }
        } catch (e) {
            console.error(e);
        }
    },
    removeItem: function (key) {
        try {
            if (window.localStorage) {
                store.remove(key);
            } else {
                Cookies.remove(key);
            }
        } catch (e) {
            console.error(e);
        }
    },
    clear: function () {
        try {
            if (window.localStorage) {
                store.clearAll();
            } else {
                var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
                if (keys) {
                    for (var i = 0; i < keys.length; i++) {
                        Cookies.remove(keys[i]);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
};

var MyLocalStorage = {
    getItem: function (key) {
        return CLocalStorage.getItem(key);
    },
    getJsonItem: function (key) {
        return CLocalStorage.getJsonItem(key);
    },
    setItem: function (key, val) {
        CLocalStorage.setItem(key, val)
    },
    removeItem: function (key) {
        CLocalStorage.removeItem(key);
    },
    clear: function () {
        CLocalStorage.clear();
    }
};

var pg_config = {
    status: {
        300: 'Non connecté',
        404: 'Manque des paramètres',
        406: 'Aucun personnage trouvé',
        405: 'Événement non existé',
        402: "L'événement est terminé!",
        401: "L'événement n'a pas encore commencé",
        403: 'Reçu tout le cdkey',
        200: 'Success',
        400: 'Non atteint',
        1000: 'Non atteint',
        1005: 'Reçu',
        1007: "Vous n'avez pas terminé cette mission, dépêchez-vous de vous connecter au jeu!",
        1008: "La mission d'aujourd'hui est terminée, demain, continuez vos efforts!"
    },
    api: {
        server: 'http://10.10.3.144:8081',
        // server: 'https://activity.pocketgamesol.com',
        //平台登录
        login: '/user/sdk/login',
        //fb登录
        fbLogin: '/user/fb/login',
        fb_redirect_uri: 'http://pmfr.pocketgamesol.com/activity/chestAct',
        // fb_redirect_uri: 'http://172.16.3.130:8018/kdyg3ds-fr/activity/chest/index.html',
        //获取区服
        zone: '/user/sdk/zones',
        //获取角色
        role: '/user/player/list'
    },
    data: {
        fb_app_id: 1088475561284955,
        groupId: '5a4b6e5e422ebf0b4c0eb70e',
        //领取积分
        actId_point: '5a4d917c422ebf0f1c1d9b96',
        //每日及循环
        actId_work: '5a4b6eb9422ebf0b4c0eb70f',
        actId_qt: '5a4d917c422ebf0f1c1d9b96',
        appId: 10092
    }
};

var globalData = {
    zones: [],
    playerId: null,
    playerName: null,
    gameZoneId: null,
    token: null,
    userId: null,
    username: null,
    activetime: null
};


//通用ajax
function ajaxDataController(url, params, successCallback, errorFun) {
    $.ajax({
        url: url,
        type: "GET",
        data: params,
        beforeSend: function () {
            loading();
        },
        success: function (result) {
            hideLoading();
            successCallback(result);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            hideLoading();
            tip('request error');
        }
    });
}

//todo 增加promise
function sendRequest(url, params) {
    return new Promise(function (resolve, resolve) {
        ajaxDataController(url, params, resolve, resolve);
    });
}


var requestUrl = {
    //领取积分
    joinActivityUrl: pg_config.api.server + '/activity/join',
    //获取总积分
    infoActivity: pg_config.api.server + '/activity/info',
    //历史奖励
    getHistroy: pg_config.api.server + '/activity/cdKeys'
};


$('.btn-login').on('click', function () {
    var username = $(".username").val();
    var password = md5($(".password").val());
    if (username == "" || password == "") {
        $(".login-tip").show();
        $(".login-tip").text("Faux nom d'utilisateur / mot de passe ou utilisateur inexistant");
        return;
    }
    $.ajax({
        type: "GET",
        url: pg_config.api.server + pg_config.api.login,
        data: {
            userName: username,
            password: password,
            version: 'de'
        },
        beforeSend: function () {
            $(".loadingBtn").show();
        },
        success: function (result) {
            $(".loadingBtn").hide();
            handleLogin(result);
        },
        error: function (error) {
            console.log(error);
        }
    });
});

function checkFBLogin() {
    if (sessionStorage.facebook == 1) {
        sessionStorage.facebook = 0;
        var FB_CODE = $.trim(getParameterByName("code"));
        if (FB_CODE == "") {
            return;
        }
        var requestURL = pg_config.api.server + pg_config.api.fbLogin;
        $.ajax({
            type: "GET",
            async: true,
            url: requestURL,
            data: {
                clientId: pg_config.data.appId,
                redirectUrl: pg_config.api.fb_redirect_uri,
                code: FB_CODE
            },
            beforeSend: function () {
                $(".loadingBtn").show();
            },
            success: function (result) {
                $(".loadingBtn").hide();
                handleLogin(result);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

function handleLogin(result) {
    if (result.code == 200) {
        sessionStorage.setItem("facebook", 0);
        globalData.userId = result.state.userId;
        globalData.username = result.state.userName;
        globalData.token = result.state.token;
        MyLocalStorage.setItem('userId', result.state.userId);
        MyLocalStorage.setItem('username', result.state.userName);
        MyLocalStorage.setItem('token', result.state.token);
        var myTimer = new Date().getTime();
        globalData.activetime = myTimer;
        MyLocalStorage.setItem('activetime', myTimer);
        hideLogin();
        showChannel();
        loadGameZones();
        showMessage();
        if (localStorage.facebook == 1) {
            window.location.href = pg_config.api.fb_redirect_uri;
        }
    }
    else {
        $(".login-tip").show();
        $(".login-tip").text(pg_config.status[result.code]);
    }
}


/**
 * load GameZones
 */
function loadGameZones() {
    var zones = globalData.zones;
    if (zones && zones.length > 2) {
        setZones(zones);
    } else {
        $.ajax({
            url: pg_config.api.server + pg_config.api.zone,
            type: "GET",
            data: {
                appId: pg_config.data.appId,
                token: globalData.token
            },
            beforeSend: function () {
                $(".loadingBtn").show();
            },
            success: function (result) {
                $(".loadingBtn").hide();
                if (result.code == 200) {
                    $(".tip").hide();
                    globalData.zones = result.state;
                    setZones(globalData.zones);
                    MyLocalStorage.setItem("zones", globalData.zones);
                }
                else {
                    $(".tip").show().text(pg_config.status[result.code]);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                tip('request error');
            }
        });
    }
}

//寻找对应区服
function loadPlayer() {
    var gameZoneId = $(".zoneSelect").val();
    globalData.gameZoneId = gameZoneId;
    if (globalData.gameZoneId !== 'Entrez le nom du serveur') {
        MyLocalStorage.setItem("gameZoneId", $(".zoneSelect").val());
        $.ajax({
            url: pg_config.api.server + pg_config.api.role,
            type: "GET",
            data: {
                appId: pg_config.data.appId,
                gameZoneId: globalData.gameZoneId,
                token: globalData.token
            },
            success: function (result) {
                if (result.code == 200) {
                    if (result.state == '') {
                        $(".errorTip").show().text('Aucun personnage trouvé');
                        globalData.playerId = null;
                        globalData.playerName = null;
                        MyLocalStorage.removeItem("playerId");
                        MyLocalStorage.removeItem("playerName");
                    } else {
                        $(".errorTip").hide().text();
                        var data = result.state[0];
                        globalData.playerId = data.playerId;
                        globalData.playerName = data.playerName;
                        MyLocalStorage.setItem("playerId", data.playerId);
                        MyLocalStorage.setItem("playerName", data.playerName);
                    }
                }
                else {
                    $(".errorTip").show().text(pg_config.status[result.code]);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                tip('request error');
            }
        });
    }
    else {
        $(".errorTip").show().text('Aucun personnage trouvé');
        globalData.playerId = null;
        globalData.playerName = null;
        MyLocalStorage.removeItem("playerId");
        MyLocalStorage.removeItem("playerName");
    }

}

/**
 * select list
 * @param list
 */
var recentGameZones = function (list) {
    var dom = '<option selected="selected">Entrez le nom du serveur</option>',
        zoneList = null;
    $(".zoneSelect").empty();
    for (var i = 0; i < list.length; i++) {
        zoneList = list[i];
        dom += '<option value="' + zoneList.gameZoneId + '" data-localName="' + zoneList.localName + '">' + zoneList.localName + '</option>';
    }
    $(".zoneSelect").append(dom);
};

function setZones(data) {
    var list = data;
    var openList = [];
    for (var i = 0; i < list.length; i++) {
        openList.push(list[i]);
    }
    recentGameZones(openList);
}

function isLogin() {
    if (MyLocalStorage.getItem('userId') && MyLocalStorage.getItem('token')) {
        var active = new Date().getTime();
        active -= 1800000;
        if (active < parseInt(MyLocalStorage.getItem('activetime'))) {
            globalData.token = MyLocalStorage.getItem('token');
            globalData.username = MyLocalStorage.getItem('username');
            globalData.playerName = MyLocalStorage.getItem('playerName');
            globalData.gamePlayer = MyLocalStorage.getItem('gamePlayer');
            globalData.userId = MyLocalStorage.getItem('userId');
            globalData.playerId = MyLocalStorage.getItem('playerId');
            globalData.zones = MyLocalStorage.getJsonItem('zones');
            globalData.gameZoneId = MyLocalStorage.getItem('gameZoneId');
            return true;
        } else {
            MyLocalStorage.clear();
            return false;
        }
    } else {
        return false;
    }
}

function isChoose() {
    if (localStorage.playerId) {
        {
            return true;
        }
    } else {
        return false;
    }
}

function saveInfo() {
    if (isLogin() && isChoose()) {
        $(".black-bg").hide();
        $(".chooseBox").hide();
        $(".startTime").hide();
        $(".userMessage").show();
        showMessage();
        checkAllPoint();
    }
    else {
        $(".errorTip").show().text("Aucun personnage trouvé");
    }
}

$(".zoneSelect").change(function () {
    localStorage.gamePlayer = $('.zoneSelect option:selected').text();
    loadPlayer();
});

$(".chooseBoxCloseBtn").on("click", function () {
    saveInfo();
});

$(".channelLogin").on("click", function () {
    saveInfo();
});


$(".loginBtn").on("click", function () {
    showLogin();
});

//选择区服
$(".changeQf").click(function () {
    showChannel();
    loadGameZones();
});

$(".closeBtn").on("click", function () {
    $(".black-bg").hide();
    $(".box").hide();
    $(".desc-1").hide();
});

//注销
$('.init').on('click', function () {
    localStorage.clear();
    $('.user').text("");
    $('.user-qf').text("");
    $('.user-js').text("");
    $(".zoneSelect").empty();
    $('.userMessage').hide();
    $(".startTime").show();
});

$('.fbBtn').on('click', function () {
    sessionStorage.setItem('facebook', 1);
    var random = Math.random() * 1000;
    var loginURL = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + pg_config.data.fb_app_id
        + "&redirect_uri=" + encodeURIComponent(pg_config.api.fb_redirect_uri) + "&r=" + random;
    window.location.href = loginURL;
});


var showMessage = function () {
    $(".userMessage").show();
    $(".startTime").hide();
    $(".user").html(globalData.username);
    $(".user-qf").html(globalData.gamePlayer);
    $(".user-js").html(globalData.playerName);
};

var showChannel = function () {
    $(".black-bg").show();
    $(".chooseBox").show();
};


var showLogin = function () {
    $(".black-bg").show();
    $('.loginBox').show();
};

var hideLogin = function () {
    $(".black-bg").hide();
    $('.loginBox').hide();
};

var loading = function () {
    $(".black-bg").show();
    $('.loading').show();
};

var hideLoading = function () {
    $(".black-bg").hide();
    $('.loading').hide();
};


/**
 * faceBook login check
 * @param name
 * @returns {string}
 */
var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


$(function () {
    if (isLogin()) {
        if (isChoose()) {
            showMessage();
            checkAllPoint();
        }
        else {
            $(".black-bg").show();
            $(".chooseBox").show();
            loadGameZones();
        }
    }
    else {
        checkFBLogin();
    }
});

