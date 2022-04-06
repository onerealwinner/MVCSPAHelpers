//routing
//requires content to be set in a container with id pageBody
(function (PageRouting, $, undefined) {
    //////setup links in app to loadpage
    var myHost = location.host;
    var currentUrl = '/';
    var myPageBody = null;
    //var _stateObjSizeLimit = null;
    var pageData = [];

    $("body").on("click", "a", function (e) {

        if (!Modernizr.history) { return; }

        var link = $(this);
        if (link.hasClass('noSPA') || link.attr('data-spa') === 'false') return;

        var newUrl = link.attr('href');
        var linkHost = this.host;

        if (newUrl.slice(0, 1) === '#') return; //Don't work for hashes

        //TODO: Don't do anything for attachments or downloads...

        //check url to ensure this is for this site
        if (linkHost === myHost) {
            //local -- won't work for linking to different applications with the same host

            //load new page if different
            e.preventDefault();
            $(this).attr('disabled', 'disabled');

            //if (currentUrl != newUrl) {
            loadPage(newUrl, null, function () {
                link.removeAttr('disabled');
                currentUrl = newUrl;
            });
            //}
        }
    });

    var newPageRequest = null;
    function loadPage(url, title, callBackFunction) {
        ///<summary>Loads a new page</summary>
        if (newPageRequest) { newPageRequest.abort(); newPageRequest = null; }

        var loaderImage = $('<div style="display:block;width:100%;height:' + myPageBody.height() + 'px;" />').append($('<div style="padding:48px;" />Loading').append($('#loaderImageLg').clone()));

        myPageBody.html('').append(loaderImage); //myPageBody.html().hide('blind');

        var ajaxComplete = false;
        newPageRequest = $.ajax({
            url: url
            , type: 'GET'
            , contentType: 'text/plain; charset=utf-8'
            //, data: JSON.stringify(dataToSend)
            , placeHolder: myPageBody
            //, dataType: 'JSON'
        }).fail(function (jqXHr, textStatus) {
            if (textStatus !== "abort") {
                myPageBody.html('<div class="container"><h1>Server Error</h1><h3>Error loading page; ' + url + "</h3></div>");
				//ADD LOGGING FOR ERROR
                $(loaderImage).remove();
            }
        }).done(function (result) {
            //unbind everything current
            myPageBody.off();

            setState(url, title, result);

            //transition page
            $("html, body").animate({ scrollTop: 0 }, "fast");
            myPageBody.html(result).show('fade');

            if (typeof callBackFunction === 'function') callBackFunction();

            newPageRequest = null;
        });
    }

    window.onpopstate = function (e) {
        //replace state before moving around ?

        if (e.state) {
            currentUrl = e.state.url;
            myPageBody.off();
            $("html, body").animate({ scrollTop: 0 }, "slow");
            myPageBody.html(pageData[e.state.pageDataIndex].html);
        }
    };

    function setState(url, title, pageHtml) {
        var pageObj = {};
        pageObj.url = url;
        pageObj.html = pageHtml;
        pageData.push(pageObj);

        var stateObj = {};
        stateObj.url = url;
        stateObj.pageDataIndex = (pageData.length - 1);

        window.history.pushState(stateObj, title, url);

    }
    ////////////////////////////

    PageRouting.LoadPage = function (url, title, callBackFunction) {
        loadPage(url, title, callBackFunction);
    }

    PageRouting.PageData = pageData;

    /////////////

    $(document).ready(function () {
        myPageBody = $('#pageBody');

        setState(window.location.href, document.title, myPageBody.html());

        //var agent = navigator.userAgent.toLowerCase();
        //if (agent.indexOf('firefox') > -1) {
        //    _stateObjSizeLimit = 600000; //FireFox
        //} else if (agent.indexOf('chrome') > -1) {
        //    _stateObjSizeLimit = 1000000;
        //} else {
        //    _stateObjSizeLimit = 10000000;
        //}

    });

}(window.PageRouting = window.PageRouting || {}, $));