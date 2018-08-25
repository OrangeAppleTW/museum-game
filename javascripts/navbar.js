// 管理 navbar 狀態用
(function() {
    var matched = location.pathname.match(/stages\/(\d+)/);
    if (matched.length === 1) return;
    
    var stageOrdinal = parseInt(matched[1]);
    var $stageLink = $('.stage-link:nth-child('+ stageOrdinal +')');

    $stageLink.find('span').addClass('current');
})();