/**
 * Created by jo.chan on 2017/7/4.
 */

/**
 * 查积分
 */
function checkAllPoint() {
    var d = $.Deferred();
    var params = {
        actId: pg_config.data.actId_point,
        groupId: pg_config.data.groupId,
        token: globalData.token,
        rewardId: '5a4d982a422ebf0f1c1d9b98'
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            var startTime = new Date(result.state.actStart).getDate();
            var todayTime = new Date().getDate();
            var i = todayTime - startTime;
            $(".nav li span").off('click');
            $(".nav li span.on").removeClass('on');
            $(".nav li span").eq(i).addClass('on').on("click");
            globalData.sumCount = result.state.consumeResource.sumCount;
            var pointWidth = parseInt(globalData.sumCount) / 500000 * 100 + '%';
            $(".progress-bar").animate({width: pointWidth});
            $(".point-item").show().text(globalData.sumCount);
        }
        else {
            tip(pg_config.status[result.code]);
        }
    });
    return d.promise();
}

/**
 * 查循环任务当前积分
 * @param rewardId
 * @param type
 */
function checkRoundPoint(rewardId, buttonIndex, type, index) {
    var params = {
        actId: pg_config.data.actId_work,
        groupId: pg_config.data.groupId,
        token: globalData.token,
        rewardId: rewardId
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            var gameTask = result.state.GameTask;
            if (gameTask > 0) {
                $(".sureButton").attr("data-rewardId", rewardId);
                $(".sureButton").attr("data-type", type);
                $(".sureButton").attr("data-index", index);
                showWeekTip(result);
            }
            else {
                tip("Actuellement, il n'y a aucun point à recevoir, veuillez accéder au jeu et terminer votre mission pour continuer à recevoir les points!");
            }
        }
        else if (result.code == 300) {
            showLogin();
        }
        else {
            tip(pg_config.status[result.code]);
        }
    })
}

/**
 * 领取任务积分
 * join work Activity
 * @param rewardId
 * @param point
 * @param type
 * @param index
 */
function getRewardActivity(rewardId, type, point, index) {
    var params = {
        actId: pg_config.data.actId_work,
        groupId: pg_config.data.groupId,
        token: globalData.token,
        rewardId: rewardId
    };
    ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
        if (result.code == 200) {
            //每日领取成功 恭喜获得积分
            var score = result.state.score;
            var widthPoint = parseInt(score) / 500000 * 100 + '%';
            $(".point-item").show().text(score);
            $(".progress-bar").animate({width: widthPoint});
            if (type == 0) {
                tip('Félicitations, vous obtenez  ' + point + ' points! ');
                $(".day-box li").eq(index).find("a.dayBtn").addClass('dayActive').off("click");
            }
            else if (type == 1) {
                hideWeekTipBox();
                //每周领取成功
                tip("Reçu avec succès, la progression de l' accumulation des points aété augmentée " + result.state.extInfo.increScore);
            }
        }
        else if (result.code == 400) {
            if (type == 0) {
                tip("Vous n'avez pas terminé cette mission, dépêchez-vous devous connecter au jeu!!");
            }
            else if (type == 1) {
                tip(pg_config.status[result.code]);
            }
        }
        else if (result.code == 300) {
            showLogin();
        }
        else {
            tip(pg_config.status[result.code]);
        }
    })
}


/**
 * 领取宝箱奖励
 * @param rewardId
 * @param actId
 * @param buttonIndex
 * @returns {*}
 */
function getBoxReward(rewardId, actId, buttonIndex) {
    var params = {
        actId: actId,
        groupId: pg_config.data.groupId,
        token: globalData.token,
        rewardId: rewardId
    };
    ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
        if (result.code == 200) {
            var data = result.state;
            cdKeyShow(data);
            if (buttonIndex >= 0 && buttonIndex <= 4) {
                gtag('event', 'open', {
                    'event_category': 'open_category',
                    'event_label': 'open_label'
                });
                fbq('track', 'Lead');
            }
        }
        else {
            $(".alert-chest-box").hide();
            tip(pg_config.status[result.code]);
        }
    })
}

/**
 * 查询领取历史记录
 * @param actId
 * @param rewardId
 * @param buttonIndex
 * @param dataNum
 * @param dataPoint
 */
function getHistroy(actId, rewardId, buttonIndex, dataNum, dataPoint) {
    var params = {
        actId: actId,
        groupId: pg_config.data.groupId,
        token: globalData.token,
        rewardId: rewardId
    };
    ajaxDataController(requestUrl.getHistroy, params, function (result) {
        if (result.code == 200) {
            var stateLen = result.state;
            if (stateLen.length > 0) {
                for (var i = 0; i < stateLen.length; i++) {
                    if (actId == stateLen[i].actId) {
                        var data = result.state[i];
                        if (buttonIndex >= 0 && buttonIndex <= 19) {
                            cdKeyShow(data);
                        } else if (buttonIndex >= 20 && buttonIndex <= 23) {
                            goToFb();
                        }
                    }
                }
            }
            else {
                hanleShowBox(buttonIndex, dataNum, dataPoint)
            }
        }
        else {
            tip(pg_config.status[result.code]);
        }
    })
}


$(".dayBtn").on("click", function () {
    var rewardId = $(this).attr('data-rewardId');
    var type = $(this).attr('data-type');
    var point = $(this).attr('data-point');
    var index = $(this).attr('data-index');
    getRewardActivity(rewardId, type, point, index);
});


$(".weekBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        var rewardId = $(this).attr('data-rewardId');
        var type = $(this).attr('data-type');
        var buttonIndex = $(this).attr('data-weekDo');
        var index = $(this).attr('data-index');
        checkRoundPoint(rewardId, buttonIndex, type, index);
    } else {
        showLogin();
    }
});

$(".notButton").on("click", function () {
    hideWeekTipBox();
});

//确认领取循环任务积分
$(".sureButton").on("click", function () {
    var rewardId = $(this).attr('data-rewardId');
    var type = $(this).attr('data-type');
    var index = $(this).attr('data-index');
    getRewardActivity(rewardId, type, '', index);
});

/**
 * 点击宝箱领取按钮,检查积分是否达成,并查询是否领过
 * index lqBtn
 */
$('.lqBtn').on("click", function () {
    if (isLogin() && isChoose()) {
        var dataNum = $(this).attr('data-num');
        var buttonIndex = $(this).attr('data-index');
        var dataPoint = $(this).attr('data-point');
        var rewardId = $(this).attr('data-rewardId');
        var actId = $(this).attr('data-actId');
        var params = {
            actId: pg_config.data.actId_point,
            groupId: pg_config.data.groupId,
            token: globalData.token,
            rewardId: '5a4d982a422ebf0f1c1d9b98'
        };
        ajaxDataController(requestUrl.infoActivity, params, function (result) {
            if (result.code == 200) {
                globalData.sumCount = result.state.consumeResource.sumCount;
                getHistroy(actId, rewardId, buttonIndex, dataNum, dataPoint);
            }
            else {
                tip(pg_config.status[result.code]);
            }
        })
    } else {
        showLogin();
    }
});

$(".nav li span").on("click", function () {
    $(".nav li span.on").removeClass('on');
    $(this).addClass('on');
});

var hideWeekTipBox = function () {
    $(".black-bg").hide();
    $(".playTip-box").hide();
    $(".playTip-main").hide();
    $(".ambilTip-box-2").hide();
    $(".desc-4").hide();
};

//weekTip
var showWeekTip = function (result) {
    showTipBox();
    $(".ambilTip-box-1").hide();
    desc2TipHide();
    $(".ambilTip-box-2").show();
    $(".desc-4").show();
    $(".ambilDesc").text("Points actuellement disponibles à recevoir:" + result.state.GameTask + ",recevoir tous?");
};

//tipbox show
var showTipBox = function () {
    $(".black-bg").show();
    $(".playTip-box").show();
    $(".playTip-main").show();
    $(".ambilTip-box-2").hide();
};

//pubilc tip
var tip = function (tip) {
    showTipBox();
    $(".ambilTip-box-1").show();
    $(".desc-2").show();
    $(".desc-2 p").text(tip);
};

//public tip
var desc2TipHide = function () {
    $(".ambilTip-box-1").hide();
    $(".desc-2").hide();
};

var picData = [
    {
        pic: ['img/qt-1.png', 'img/qt-2.png', 'img/qt-3.png', 'img/qt-4.png', 'img/qt-5.png'],
        desc: ["Gros sac d'argent*4", 'Carte EXP avancé*1', 'Fruit poké*20', 'Coffre élémentaire avancé*2', 'Carte EXP fusion*10'],
        ids: [0, 1, 2, 3, 4],
        point: [1000],
        actId: ['5a4d917c422ebf0f1c1d9b96'],
        rewardId: ['5a4d982a422ebf0f1c1d9b98', '5a4d9850422ebf0f1c1d9b9a', '5a53468e422ebf1748e24b66', '5a5346e1422ebf1748e24b69', '5a535273422ebf1748e24b7b'],
        article: ['Coffre Bronze']
    },
    {
        pic: ['img/by-1.png', 'img/by-2.png', 'img/by-3.png', 'img/by-4.png', 'img/by-5.png'],
        desc: ['Ticket du Pays secret Avancé*3', 'Boîte relooking avancée*10', 'Coffre Talent principal*10', 'Capsule secrète élite cachée*5', 'Spododo*1'],
        ids: [5, 6, 7, 8, 9],
        rewardId: ['5a53477a422ebf1748e24b6d', '5a53479b422ebf1748e24b6f', '5a5347bf422ebf1748e24b71', '5a5347dd422ebf1748e24b73', '5a53480d422ebf1748e24b75'],
        point: [10000],
        actId: ['5a534730422ebf1748e24b6a'],
        article: ['Coffre Argent']
    },
    {
        pic: ['img/hj-1.png', 'img/hj-2.png', 'img/hj-3.png', 'img/hj-4.png', 'img/hj-5.png'],
        desc: ['Pièce flash*50', 'Méga gemme*50', 'Diamant*1500', 'Carte de promotion*150', 'Stalgamin*1'],
        ids: [10, 11, 12, 13, 14],
        point: [30000],
        actId: ['5a53540e422ebf1748e24b86'],
        rewardId: ['5a53545c422ebf1748e24b89', '5a53548a422ebf1748e24b8b', '5a5354a0422ebf1748e24b8d', '5a5354c3422ebf1748e24b8f', '5a5354e7422ebf1748e24b91'],
        article: ['Coffre Or']
    },
    {
        pic: ['img/zj-1.png', 'img/zj-2.png', 'img/zj-3.png', 'img/zj-4.png', 'img/zj-5.png'],
        desc: ['Capsule secrète épique*5', 'Boîte à accessoires épique*10', 'Sceau Z*500', 'Éclat général*400', 'Câblifère*1'],
        ids: [15, 16, 17, 18, 19],
        point: [100000],
        actId: ['5a535513422ebf1748e24b92'],
        rewardId: ['5a535563422ebf1748e24b95', '5a535591422ebf1748e24b97', '5a5355b9422ebf1748e24b99', '5a5355d8422ebf1748e24b9b', '5a5355f3422ebf1748e24b9d'],
        article: ['Coffre Améthyste']
    }
];


/**
 * 检查积分是否达成
 * @param buttonIndex
 * @param dataNum
 * @param dataPoint
 */
function hanleShowBox(buttonIndex, dataNum, dataPoint) {
    var allPoint = parseInt(globalData.sumCount);
    if (allPoint >= dataPoint) {
        $(".boxBtn").css('background', "url('img/alert-chestBtn.png') no-repeat center").removeAttr("disabled");
        alertShowBox(buttonIndex, dataNum);
    }
    else {
        //积分不足
        tip('Pas assez de points, complétez la mission pour obtenir plus de points!');
    }
}


/**
 * 各个宝箱展示
 * @param buttonIndex
 * @param dataNum
 */
var alertShowBox = function (buttonIndex, dataNum) {
    $(".black-bg").show();
    if (dataNum == 1) {
        var data = picData[buttonIndex];
        $(".alert-chest-box").show();
        $('.alert-chest-box .chestbox-ul li').each(function (index) {
            $(this).find("button").attr('data-index', data.ids[index]);
            $(this).css('background', "url(" + data.pic[index] + ") no-repeat center");
            $(this).find("span").text(data.desc[index]);
            $('.qt-box-word p').find("span").text(data.point[0]);
            $('.qt_article').text(data.article[0]);
            $(this).find("button").attr('data-rewardId', data.rewardId[index]);
            $(this).find("button").attr('data-actId', data.actId[0]);
        });
    }
    else if (dataNum == 2) {
        $(".alert-chest-box2").show();
    }
};

/**
 * 打开宝箱领取奖励
 * yesButton box reward
 */
$(".boxBtn").on("click", function () {
    var rewardId = $(this).attr('data-rewardId');
    var buttonIndex = $(this).attr('data-index');
    var actId = $(this).attr('data-actId');
    if (buttonIndex >= 0 && buttonIndex <= 19) {
        getBoxReward(rewardId, actId, buttonIndex);
    } else if (buttonIndex >= 20 && buttonIndex <= 23) {
        goToFb();
    }
});


function cdKeyShow(data) {
    localStorage.setItem('cdKey', data.cdKeys);
    localStorage.setItem('name', data.rewardName);
    showAwardTip();
    desc2TipHide();
}

function goToFb() {
    $(".black-bg").show();
    $(".alert-chest-box2").hide();
    $(".playTip-box").hide();
    $(".playTip-main").hide();
    $(".goToFb-box").show();
}

/**
 * click chestBox
 */
$(".showBoxBtn").on("click", function () {
    $(".boxBtn").css('background', "url('img/notChestBtn.png') no-repeat center").attr('disabled', "true");
    var dataIndex = $(this).attr('data-index');
    var dataNum = $(this).attr('data-num');
    alertShowBox(dataIndex, dataNum);
});


$(".nav-box a").on("click", function () {
    var id = $(this).attr("data-id");
    $("html,body").animate({scrollTop: $(id).offset().top}, 800);
});


var showAwardTip = function () {
    $(".black-bg").show();
    $(".alert-chest-box").hide();
    $(".playTip-box").hide();
    $(".awardTip-box").show();
    $(".awardTip-main").show();
    $(".jhm-p").text(localStorage.getItem("cdKey"));
    $(".jl-p").text(localStorage.getItem("name"));
};
