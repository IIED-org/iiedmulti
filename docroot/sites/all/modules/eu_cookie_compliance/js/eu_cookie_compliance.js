/**
 * @file
 * Cookie Compliance Javascript.
 *
 * Statuses:
 *  null: not yet agreed (or withdrawn), show popup
 *  0: Disagreed
 *  1: Agreed, show thank you banner
 *  2: Agreed.
 */

(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.eu_cookie_compliance_popup = {
    attach: function (context, settings) {
      $(Drupal.settings.eu_cookie_compliance.containing_element, context).once('eu-cookie-compliance', function () {

        Drupal.eu_cookie_compliance.initializeCookieValues();

        // Initialize internal variables.
        Drupal.eu_cookie_compliance._euccCurrentStatus = self.getCurrentStatus();
        Drupal.eu_cookie_compliance._euccSelectedCategories = self.getAcceptedCategories();

        // If configured, check JSON callback to determine if in EU.
        if (Drupal.settings.eu_cookie_compliance.popup_eu_only_js) {
          if (Drupal.eu_cookie_compliance.showBanner()) {
            var url = Drupal.settings.basePath + Drupal.settings.pathPrefix + 'eu-cookie-compliance-check';
            var data = {};
            $.getJSON(url, data, function (data) {
              // If in the EU, show the compliance banner.
              if (data.in_eu) {
                Drupal.eu_cookie_compliance.execute();
              }

              // If not in EU, set an agreed cookie automatically.
              else {
                Drupal.eu_cookie_compliance.setStatus(Drupal.eu_cookie_compliance.cookieValueAgreed);
              }
            });
          }
        }

        // Otherwise, fallback to standard behavior which is to render the banner.
        else {
          Drupal.eu_cookie_compliance.execute();
        }
      }).addClass('eu-cookie-compliance-status-' + Drupal.eu_cookie_compliance.getCurrentStatus());

      // Toggle withdraw banner on links with toggle class:
      $('a.eu-cookie-compliance-toggle-withdraw-banner', context).click(function(e) {
        e.preventDefault();
        Drupal.eu_cookie_compliance.toggleWithdrawBanner();
        return false;
      });
    }
  };

  // Sep up the namespace as a function to store list of arguments in a queue.
  Drupal.eu_cookie_compliance = Drupal.eu_cookie_compliance || function () {
    (Drupal.eu_cookie_compliance.queue = Drupal.eu_cookie_compliance.queue || []).push(arguments)
  };
  // Initialize the object with some data.
  Drupal.eu_cookie_compliance.a = +new Date;
  // A shorter name to use when accessing the namespace.
  var self = Drupal.eu_cookie_compliance;

  Drupal.eu_cookie_compliance.initializeCookieValues = function () {
    Drupal.eu_cookie_compliance.euCookieComplianceBlockCookies = null;
    Drupal.eu_cookie_compliance.cookieValueDisagreed = (typeof Drupal.settings.eu_cookie_compliance.cookie_value_disagreed === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_value_disagreed === '') ? '0' : Drupal.settings.eu_cookie_compliance.cookie_value_disagreed;
    Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou = (typeof Drupal.settings.eu_cookie_compliance.cookie_value_agreed_show_thank_you === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_value_agreed_show_thank_you === '') ? '1' : Drupal.settings.eu_cookie_compliance.cookie_value_agreed_show_thank_you;
    Drupal.eu_cookie_compliance.cookieValueAgreed = (typeof Drupal.settings.eu_cookie_compliance.cookie_value_agreed === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_value_agreed === '') ? '2' : Drupal.settings.eu_cookie_compliance.cookie_value_agreed;
    Drupal.eu_cookie_compliance._euccSelectedCategories = []
    Drupal.eu_cookie_compliance._euccCurrentStatus = null;
  }

  // Save our cookie preferences locally only.
  // Used by external scripts to modify data before it is used.
  self.updateSelectedCategories = function (categories) {
    Drupal.eu_cookie_compliance._euccSelectedCategories = categories;
  }
  self.updateCurrentStatus = function (status) {
    Drupal.eu_cookie_compliance._euccCurrentStatus = status;
  }

  Drupal.eu_cookie_compliance.execute = function () {
    try {
      if (!Drupal.settings.eu_cookie_compliance.popup_enabled) {
        return;
      }

      if (!Drupal.eu_cookie_compliance.cookiesEnabled()) {
        return;
      }

      if (typeof Drupal.eu_cookie_compliance.getVersion() === 'undefined') {
        // If version doesn't exist as a cookie, set it to the current one.
        // For modules that update to this, it prevents needless retriggering
        // For first time runs, it makes no difference as the other IF statements
        // below will still cause the popup to trigger
        // For incrementing the version, it also makes no difference as either it's
        // a returning user and will have a version set, or it's a new user and
        // the other checks will trigger it.
        Drupal.eu_cookie_compliance.setVersion();
      }

      Drupal.eu_cookie_compliance.updateCheck();
      var versionChanged = Drupal.eu_cookie_compliance.getVersion() !== Drupal.settings.eu_cookie_compliance.cookie_policy_version;
      // Closed if status has a value and the version hasn't changed.
      var closed = Drupal.eu_cookie_compliance._euccCurrentStatus !== null && (Drupal.settings.eu_cookie_compliance.method === 'opt_in' || Drupal.settings.eu_cookie_compliance.method === 'categories') && !versionChanged;
      if ((Drupal.eu_cookie_compliance._euccCurrentStatus === 0 && Drupal.settings.eu_cookie_compliance.method === 'default') || Drupal.eu_cookie_compliance._euccCurrentStatus === null || (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) || versionChanged) {
        if (Drupal.settings.eu_cookie_compliance.withdraw_enabled || !Drupal.settings.eu_cookie_compliance.disagree_do_not_show_popup || Drupal.eu_cookie_compliance._euccCurrentStatus === null || versionChanged) {
          // Detect mobile here and use mobile_popup_html_info, if we have a mobile device.
          if (window.matchMedia('(max-width: ' + Drupal.settings.eu_cookie_compliance.mobile_breakpoint + 'px)').matches && Drupal.settings.eu_cookie_compliance.use_mobile_message) {
            Drupal.eu_cookie_compliance.createPopup(Drupal.settings.eu_cookie_compliance.mobile_popup_html_info, closed);
          }
          else {
            Drupal.eu_cookie_compliance.createPopup(Drupal.settings.eu_cookie_compliance.popup_html_info, closed);
          }

          Drupal.eu_cookie_compliance.initPopup();
          Drupal.eu_cookie_compliance.resizeListener();
        }
      }
      if (Drupal.eu_cookie_compliance._euccCurrentStatus === 1 && Drupal.settings.eu_cookie_compliance.popup_agreed_enabled) {
        // Thank you banner.
        Drupal.eu_cookie_compliance.createPopup(Drupal.settings.eu_cookie_compliance.popup_html_agreed);
        Drupal.eu_cookie_compliance.attachHideEvents();
      }
      else if (Drupal.eu_cookie_compliance._euccCurrentStatus === 2 && Drupal.settings.eu_cookie_compliance.withdraw_enabled) {
        if (!Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
          Drupal.eu_cookie_compliance.createWithdrawBanner(Drupal.settings.eu_cookie_compliance.withdraw_markup);
          Drupal.eu_cookie_compliance.resizeListener();
        }
        Drupal.eu_cookie_compliance.attachWithdrawEvents();
      }
    }
    catch (e) {
    }
  };

  Drupal.eu_cookie_compliance.initPopup = function () {
    Drupal.eu_cookie_compliance.attachAgreeEvents();

    if (Drupal.settings.eu_cookie_compliance.method === 'categories') {
      Drupal.eu_cookie_compliance.setPreferenceCheckboxes(Drupal.eu_cookie_compliance._euccSelectedCategories);
      Drupal.eu_cookie_compliance.attachSavePreferencesEvents();
    }

    if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
      Drupal.eu_cookie_compliance.attachWithdrawEvents();
      if (Drupal.eu_cookie_compliance._euccCurrentStatus === 1 || Drupal.eu_cookie_compliance._euccCurrentStatus === 2) {
        $('.eu-cookie-withdraw-button').removeClass('eu-cookie-compliance-hidden');
        $('.eu-cookie-compliance-reject-button').addClass('eu-cookie-compliance-hidden');
      }
    }
  }

  Drupal.eu_cookie_compliance.positionTab = function () {
    if (Drupal.settings.eu_cookie_compliance.popup_position) {
      var totalHeight = $('.eu-cookie-withdraw-tab').outerHeight();
      if ($('#sliding-popup').length) {
        totalHeight += $('#sliding-popup').outerHeight();
      }
      if ($('.eu-cookie-withdraw-wrapper').length) {
        $('.eu-cookie-withdraw-tab').css('margin-top', '0');
      }
      else {
        $('.eu-cookie-withdraw-tab').css('margin-top', totalHeight + 'px');
      }
    }
  };

  Drupal.eu_cookie_compliance.createWithdrawBanner = function (html) {
    var $html = $('<div></div>').html(html);
    var $banner = $('.eu-cookie-withdraw-banner', $html);
    $html.attr('id', 'sliding-popup');
    $html.addClass('eu-cookie-withdraw-wrapper');

    $html.trigger('eu_cookie_compliance_popup_close');
    $('body').removeClass('eu-cookie-compliance-popup-open');

    if (!Drupal.settings.eu_cookie_compliance.popup_use_bare_css) {
      $banner.height(Drupal.settings.eu_cookie_compliance.popup_height)
          .width(Drupal.settings.eu_cookie_compliance.popup_width);
    }
    $html.hide();
    var height = 0;
    if (Drupal.settings.eu_cookie_compliance.popup_position) {
      $html.prependTo(Drupal.settings.eu_cookie_compliance.containing_element);
      height = parseInt($html.outerHeight());

      $html.show()
          .addClass('sliding-popup-top')
          .addClass('clearfix')
          .css({ top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height)});
      // For some reason, the tab outerHeight is -10 if we don't use a timeout
      // function to reveal the tab.
      setTimeout(function () {
        $html.animate({ top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height) }, Drupal.settings.eu_cookie_compliance.popup_delay, null);
        if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
          $('body').animate({ 'margin-top': -height + 'px' });
        }
      }.bind($html, height), 0);
    }
    else {
      if (Drupal.settings.eu_cookie_compliance.better_support_for_screen_readers) {
        $html.prependTo(Drupal.settings.eu_cookie_compliance.containing_element);
      }
      else {
        $html.appendTo(Drupal.settings.eu_cookie_compliance.containing_element);
      }
      height = $html.outerHeight();
      $html.show()
          .addClass('sliding-popup-bottom')
          .css({ bottom: -1 * height });
      // For some reason, the tab outerHeight is -10 if we don't use a timeout
      // function to reveal the tab.
      setTimeout(function () {
        $html.animate({ bottom: -1 * height }, Drupal.settings.eu_cookie_compliance.popup_delay, null, function () {
          var height = $html.outerHeight();

          $html.animate({ bottom: -1 * (height) }, Drupal.settings.eu_cookie_compliance.popup_delay, null);
        });
      }.bind($html, height), 0);
    }
  };

  Drupal.eu_cookie_compliance.getBannerTopPosition = function (height) {
    let bannerTopPosition;
    if (Drupal.settings.eu_cookie_compliance.fixed_top_position) {
      bannerTopPosition = 0;
    }
    else {
      return 0;
    }

    if ($('#toolbar').length) {
      bannerTopPosition += parseInt($('#toolbar').css('height'));
    }

    return bannerTopPosition + 'px';
  }

  Drupal.eu_cookie_compliance.getBannerTopHiddenPosition = function (height) {
    let bannerTopPosition = 0;
    if (Drupal.settings.eu_cookie_compliance.fixed_top_position) {
      bannerTopPosition = -height;
    }
    else {
      if ($('#toolbar').length) {
        bannerTopPosition = -parseInt($('#toolbar').css('height'));
      }

    }

    return bannerTopPosition + 'px';
  }

  Drupal.eu_cookie_compliance.getBannerBottomHiddenPosition = function () {
    return -($('#sliding-popup').outerHeight()) + 'px';
  }

  Drupal.eu_cookie_compliance.toggleWithdrawBanner = function () {
    var $wrapper = $('#sliding-popup');
    var height = parseInt($wrapper.outerHeight());
    var $bannerIsShowing = ($wrapper.find('.eu-cookie-compliance-banner, .eu-cookie-withdraw-banner').is(':visible'));
    if ($bannerIsShowing) {
      let bannerTop = parseInt($wrapper.css('top'));
      let containerPadding = parseInt($(Drupal.settings.eu_cookie_compliance.containing_element).css('padding-top'));
      let containerMargin = parseInt($(Drupal.settings.eu_cookie_compliance.containing_element).css('margin-top'));

      if (Drupal.settings.eu_cookie_compliance.popup_position) {
        if (Drupal.settings.eu_cookie_compliance.fixed_top_position) {
          $bannerIsShowing = !(bannerTop === -height);
        }
        else {
          $bannerIsShowing = !(bannerTop === -(containerPadding + containerMargin + height));
        }
      }
      else {
        $bannerIsShowing = (parseInt($wrapper.css('bottom')) === 0);
      }
    }
    if (Drupal.settings.eu_cookie_compliance.popup_position) {
      if ($bannerIsShowing) {
        if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
          $('body').animate({ 'margin-top': -height + 'px' }, Drupal.settings.eu_cookie_compliance.popup_delay);
        }
        $wrapper.animate({ top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height) }, Drupal.settings.eu_cookie_compliance.popup_delay).trigger('eu_cookie_compliance_popup_close');
        $('body').removeClass('eu-cookie-compliance-popup-open');
      }
      else {
        // If "Do not show cookie policy when the user clicks the Cookie policy button." is
        // selected, the inner banner may be hidden.
        if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
          $('body').animate({ 'margin-top': '0px' }, Drupal.settings.eu_cookie_compliance.popup_delay);
        }
        $wrapper.find('.eu-cookie-compliance-banner').show();
        $wrapper.animate({ top: Drupal.eu_cookie_compliance.getBannerTopPosition(height) }, Drupal.settings.eu_cookie_compliance.popup_delay).trigger('eu_cookie_compliance_popup_open');
        $('body').addClass('eu-cookie-compliance-popup-open');
      }
    }
    else {
      if ($bannerIsShowing) {
        $wrapper.animate({ 'bottom': -1 * height }, Drupal.settings.eu_cookie_compliance.popup_delay).trigger('eu_cookie_compliance_popup_close');
        $('body').removeClass('eu-cookie-compliance-popup-open');
      }
      else {
        // If "Do not show cookie policy when the user clicks the Cookie policy button." is
        // selected, the inner banner may be hidden.
        $wrapper.find('.eu-cookie-compliance-banner').show();
        $wrapper.animate({ 'bottom': 0 }, Drupal.settings.eu_cookie_compliance.popup_delay).trigger('eu_cookie_compliance_popup_open');
        $('body').addClass('eu-cookie-compliance-popup-open');
      }
    }
  };

  Drupal.eu_cookie_compliance.resizeListener = function () {
    var $wrapper = $('#sliding-popup');

    const debounce = function (func, wait ) {
      var timeout;

      return function executedFunction() {
        var later = function () {
          clearTimeout(timeout);
          func();
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    var checkIfPopupIsClosed = debounce(function () {
      var wrapperHeight = $wrapper.outerHeight();
      if (Drupal.settings.eu_cookie_compliance.popup_position) {
        var wrapperTopProperty = parseFloat($wrapper.css('top'));
        if (wrapperTopProperty < 0) {
          if ($('body').hasClass('eu-cookie-compliance-popup-open')) {
            if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
              $('body').css({ 'margin-top': '0px' });
            }
            $wrapper.css('top', Drupal.eu_cookie_compliance.getBannerTopPosition(wrapperHeight));
          }
          else {
            if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
              $('body').css({ 'margin-top': -wrapperHeight + 'px' });
            }
            $wrapper.css('top', Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(wrapperHeight));
          }
        }
        Drupal.eu_cookie_compliance.positionTab();
      }
      else {
        var wrapperBottomProperty = parseFloat($wrapper.css('bottom'));
        if (wrapperBottomProperty !== 0) {
          $wrapper.css('bottom', wrapperHeight * -1);
        }
      }
      Drupal.eu_cookie_compliance.positionTab();
    }, 50);

    setTimeout(function () {
      checkIfPopupIsClosed();
    });

    window.addEventListener('resize', checkIfPopupIsClosed);

  };

  Drupal.eu_cookie_compliance.createPopup = function (html, closed) {
    // This fixes a problem with jQuery 1.9.
    var $popup = $('<div></div>').html(html);
    $popup.attr('id', 'sliding-popup');
    if (!Drupal.settings.eu_cookie_compliance.popup_use_bare_css) {
      $popup.height(Drupal.settings.eu_cookie_compliance.popup_height)
          .width(Drupal.settings.eu_cookie_compliance.popup_width);
    }

    $popup.hide();
    var height = 0;
    if (Drupal.settings.eu_cookie_compliance.popup_position) {
      $popup.prependTo(Drupal.settings.eu_cookie_compliance.containing_element);
      height = $popup.outerHeight();
      $popup.addClass('sliding-popup-top clearfix')
        .css({ top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height) });

      if (closed !== true) {
        $('body').addClass('eu-cookie-compliance-popup-open');
        $popup.show();
        $popup.animate({top: Drupal.eu_cookie_compliance.getBannerTopPosition(height)}, Drupal.settings.eu_cookie_compliance.popup_delay, null, function () {
          $popup.trigger('eu_cookie_compliance_popup_open');
          Drupal.eu_cookie_compliance.positionTab();
        });
      }
      else {
        if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
          $('body').css({ 'margin-top': -height + 'px' });
        }
        setTimeout(function () {
          $popup.show();
          Drupal.eu_cookie_compliance.positionTab();
        }, 0);
      }
    }
    else {
      if (Drupal.settings.eu_cookie_compliance.better_support_for_screen_readers) {
        $popup.prependTo(Drupal.settings.eu_cookie_compliance.containing_element);
      }
      else {
        $popup.appendTo(Drupal.settings.eu_cookie_compliance.containing_element);
      }

      height = $popup.outerHeight();
      $popup.show()
        .attr({ 'class': 'sliding-popup-bottom' })
        .css({ bottom: -1 * height });
      if (closed !== true) {
        $('body').addClass('eu-cookie-compliance-popup-open');
        $popup.animate({bottom: 0}, Drupal.settings.eu_cookie_compliance.popup_delay, null, function () {
          $popup.trigger('eu_cookie_compliance_popup_open');
        });
      }
    }
  };

  Drupal.eu_cookie_compliance.attachAgreeEvents = function () {
    var clickingConfirms = Drupal.settings.eu_cookie_compliance.popup_clicking_confirmation;
    var scrollConfirms = Drupal.settings.eu_cookie_compliance.popup_scrolling_confirmation;

    if (Drupal.settings.eu_cookie_compliance.method === 'categories' && Drupal.settings.eu_cookie_compliance.enable_save_preferences_button) {
      // The agree button becomes an agree to all categories button when the 'save preferences' button is present.
      $('.agree-button').click(Drupal.eu_cookie_compliance.acceptAllAction);
    }
    else {
      $('.agree-button').click(Drupal.eu_cookie_compliance.acceptAction);
    }
    $('.decline-button').click(Drupal.eu_cookie_compliance.declineAction);
    $('.eu-cookie-compliance-close-button').click(Drupal.eu_cookie_compliance.closeAction);
    $('.eu-cookie-compliance-reject-button').click(Drupal.eu_cookie_compliance.rejectAllAction);

    if (clickingConfirms) {
      $('a, input[type=submit], button[type=submit]').not('.popup-content *').bind('click.euCookieCompliance', Drupal.eu_cookie_compliance.acceptAction);
    }

    if (scrollConfirms) {
      var alreadyScrolled = false;
      var scrollHandler = function () {
        if (alreadyScrolled) {
          Drupal.eu_cookie_compliance.acceptAction();
          $(window).off('scroll', scrollHandler);
        }
        else {
          alreadyScrolled = true;
        }
      };

      $(window).bind('scroll', scrollHandler);
    }

    $('.find-more-button').not('.find-more-button-processed').addClass('find-more-button-processed').click(Drupal.eu_cookie_compliance.moreInfoAction);
  };

  Drupal.eu_cookie_compliance.closeAction = function () {
    switch (Drupal.settings.eu_cookie_compliance.close_button_action) {
      case 'close_banner':
        Drupal.eu_cookie_compliance.toggleWithdrawBanner();
        break;

      case 'save_preferences':
        Drupal.eu_cookie_compliance.savePreferencesAction();
        break;

      case 'reject_all_cookies':
        Drupal.eu_cookie_compliance.rejectAllAction();
        break;

      case 'accept_all_cookies':
        Drupal.eu_cookie_compliance.acceptAllAction();
        break;
    }
  };

  Drupal.eu_cookie_compliance.attachSavePreferencesEvents = function () {
    $('.eu-cookie-compliance-save-preferences-button').click(Drupal.eu_cookie_compliance.savePreferencesAction);
  };

  Drupal.eu_cookie_compliance.attachHideEvents = function () {
    var popupHideAgreed = Drupal.settings.eu_cookie_compliance.popup_hide_agreed;
    var clickingConfirms = Drupal.settings.eu_cookie_compliance.popup_clicking_confirmation;
    $('.hide-popup-button').click(function () {
      Drupal.eu_cookie_compliance.changeStatus(Drupal.eu_cookie_compliance.cookieValueAgreed);
    }
    );
    if (clickingConfirms) {
      $('a, input[type=submit], button[type=submit]').unbind('click.euCookieCompliance');
    }

    if (popupHideAgreed) {
      $('a, input[type=submit], button[type=submit]').bind('click.euCookieComplianceHideAgreed', function () {
        Drupal.eu_cookie_compliance.changeStatus(Drupal.eu_cookie_compliance.cookieValueAgreed);
      });
    }

    $('.find-more-button').not('.find-more-button-processed').addClass('find-more-button-processed').click(Drupal.eu_cookie_compliance.moreInfoAction);
  };

  Drupal.eu_cookie_compliance.attachWithdrawEvents = function () {
    $('.eu-cookie-withdraw-button').click(Drupal.eu_cookie_compliance.withdrawAction);
    $('.eu-cookie-withdraw-tab').click(Drupal.eu_cookie_compliance.toggleWithdrawBanner);
  };

  Drupal.eu_cookie_compliance.acceptAction = function () {
    var agreedEnabled = Drupal.settings.eu_cookie_compliance.popup_agreed_enabled;
    var nextStatus = Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou;
    if (!agreedEnabled) {
      Drupal.eu_cookie_compliance.setStatus(Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou);
      nextStatus = Drupal.eu_cookie_compliance.cookieValueAgreed;
    }

    if (!euCookieComplianceHasLoadedScripts && typeof euCookieComplianceLoadScripts === "function") {
      euCookieComplianceLoadScripts();
    }

    if (typeof Drupal.eu_cookie_compliance.euCookieComplianceBlockCookies !== 'undefined') {
      clearInterval(Drupal.eu_cookie_compliance.euCookieComplianceBlockCookies);
    }

    if (Drupal.settings.eu_cookie_compliance.method === 'categories') {
      // Select Checked categories.
      var categories = $("#eu-cookie-compliance-categories input:checkbox:checked").map(function () {
        return $(this).val();
      }).get();
      Drupal.eu_cookie_compliance.setAcceptedCategories(categories);
      // Load scripts for all categories. If no categories selected, none
      // will be loaded.
      Drupal.eu_cookie_compliance.loadCategoryScripts(categories);
      if (!categories.length) {
        // No categories selected is the same as declining all cookies.
        nextStatus = Drupal.eu_cookie_compliance.cookieValueDisagreed;
      }
    }

    Drupal.eu_cookie_compliance.changeStatus(nextStatus);

    if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
      Drupal.eu_cookie_compliance.attachWithdrawEvents();
      if (Drupal.eu_cookie_compliance._euccCurrentStatus === 1 || Drupal.eu_cookie_compliance._euccCurrentStatus === 2) {
        $('.eu-cookie-withdraw-button').removeClass('eu-cookie-compliance-hidden');
        $('.eu-cookie-compliance-reject-button').addClass('eu-cookie-compliance-hidden');
      }
    }
  };

  Drupal.eu_cookie_compliance.acceptAllAction = function () {
    var allCategories = Drupal.settings.eu_cookie_compliance.cookie_categories;
    Drupal.eu_cookie_compliance.setPreferenceCheckboxes(allCategories);
    Drupal.eu_cookie_compliance.acceptAction();
  }

  Drupal.eu_cookie_compliance.rejectAllAction = function () {
    Drupal.eu_cookie_compliance.setStatus(Drupal.eu_cookie_compliance.cookieValueDisagreed);
    Drupal.eu_cookie_compliance.setPreferenceCheckboxes([]);
    Drupal.eu_cookie_compliance.acceptAction();
  }

  Drupal.eu_cookie_compliance.savePreferencesAction = function () {
    var categories = $("#eu-cookie-compliance-categories input:checkbox:checked").map(function () {
      return $(this).val();
    }).get();
    var agreedEnabled = Drupal.settings.eu_cookie_compliance.popup_agreed_enabled;
    var nextStatus = Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou;
    if (!agreedEnabled) {
      Drupal.eu_cookie_compliance.setStatus(Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou);
      nextStatus = Drupal.eu_cookie_compliance.cookieValueAgreed;
    }

    Drupal.eu_cookie_compliance.setAcceptedCategories(categories);
    // Load scripts for all categories. If no categories selected, none
    // will be loaded.
    Drupal.eu_cookie_compliance.loadCategoryScripts(categories);
    if (!categories.length) {
      // No categories selected is the same as declining all cookies.
      nextStatus = Drupal.eu_cookie_compliance.cookieValueDisagreed;
    }
    Drupal.eu_cookie_compliance.changeStatus(nextStatus);
  };

  Drupal.eu_cookie_compliance.loadCategoryScripts = function (categories) {
    for (var cat in categories) {
      if (euCookieComplianceHasLoadedScriptsForCategory[categories[cat]] !== true && typeof euCookieComplianceLoadScripts === "function") {
        euCookieComplianceLoadScripts(categories[cat]);
        euCookieComplianceHasLoadedScriptsForCategory[categories[cat]] = true;
      }
    }
  }

  Drupal.eu_cookie_compliance.declineAction = function () {
    Drupal.eu_cookie_compliance.setStatus(Drupal.eu_cookie_compliance.cookieValueDisagreed);
    var popup = $('#sliding-popup');
    if (popup.hasClass('sliding-popup-top')) {
      let height = popup.outerHeight();
      if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
        $('body').animate({ 'margin-top': -height + 'px' }, Drupal.settings.eu_cookie_compliance.popup_delay);
      }
      if (Drupal.settings.eu_cookie_compliance.settings_tab_enabled) {
        popup.animate({top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height)}, Drupal.settings.eu_cookie_compliance.popup_delay, null).trigger('eu_cookie_compliance_popup_close');
        $('.eu-cookie-withdraw-tab').click(Drupal.eu_cookie_compliance.toggleWithdrawBanner);
      }
      else {
        popup.animate({top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height)}, Drupal.settings.eu_cookie_compliance.popup_delay, null, function () {
          popup.hide();
        }).trigger('eu_cookie_compliance_popup_close');
        $('body').removeClass('eu-cookie-compliance-popup-open');
      }
    }
    else {
      if (Drupal.settings.eu_cookie_compliance.settings_tab_enabled) {
        popup.animate({ bottom: popup.outerHeight() * -1 }, Drupal.settings.eu_cookie_compliance.popup_delay, null).trigger('eu_cookie_compliance_popup_close');
        $('.eu-cookie-withdraw-tab').click(Drupal.eu_cookie_compliance.toggleWithdrawBanner);
      }
      else {
        popup.animate({ bottom: popup.outerHeight() * -1 }, Drupal.settings.eu_cookie_compliance.popup_delay, null, function () {
          popup.hide();
        }).trigger('eu_cookie_compliance_popup_close');
        $('body').removeClass('eu-cookie-compliance-popup-open');
      }
    }
  };

  Drupal.eu_cookie_compliance.withdrawAction = function () {
    // Save "decline".
    Drupal.eu_cookie_compliance.setStatus(0);

    Drupal.eu_cookie_compliance.setAcceptedCategories([]);
    location.reload();
  };

  Drupal.eu_cookie_compliance.moreInfoAction = function () {
    if (Drupal.settings.eu_cookie_compliance.disagree_do_not_show_popup) {
      Drupal.eu_cookie_compliance.setStatus(Drupal.eu_cookie_compliance.cookieValueDisagreed);
      if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
        $('#sliding-popup .eu-cookie-compliance-banner').trigger('eu_cookie_compliance_popup_close').hide();
        $('body').removeClass('eu-cookie-compliance-popup-open');
      }
      else {
        $('#sliding-popup').trigger('eu_cookie_compliance_popup_close').remove();
        $('body').removeClass('eu-cookie-compliance-popup-open');
      }
    }
    else {
      if (Drupal.settings.eu_cookie_compliance.popup_link_new_window) {
        window.open(Drupal.settings.eu_cookie_compliance.popup_link);
      }
      else {
        window.location.href = Drupal.settings.eu_cookie_compliance.popup_link;
      }
    }
  };

  Drupal.eu_cookie_compliance.getCurrentStatus = function () {
    // Make a new observer & fire it to allow other scripts to hook in.
    var preStatusLoadObject = new PreStatusLoad();
    self.handleEvent('preStatusLoad', preStatusLoadObject);

    var cookieName = (typeof eu_cookie_compliance_cookie_name === 'undefined' || eu_cookie_compliance_cookie_name === '') ? 'cookie-agreed' : eu_cookie_compliance_cookie_name;
    if ($.cookie(cookieName) === Drupal.eu_cookie_compliance.cookieValueDisagreed) {
      var numericalStatus = '0';
    } else if  ($.cookie(cookieName) === Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou) {
      var numericalStatus = '1';
    } else if  ($.cookie(cookieName) === Drupal.eu_cookie_compliance.cookieValueAgreed) {
      var numericalStatus = '2';
    }
    var storedStatus = numericalStatus;
    Drupal.eu_cookie_compliance._euccCurrentStatus = parseInt(storedStatus);
    if (isNaN(Drupal.eu_cookie_compliance._euccCurrentStatus)) {
      Drupal.eu_cookie_compliance._euccCurrentStatus = null;
    }

    // Make a new observer & fire it to allow other scripts to hook in.
    var postStatusLoadObject = new PostStatusLoad();
    self.handleEvent('postStatusLoad', postStatusLoadObject);

    return Drupal.eu_cookie_compliance._euccCurrentStatus;
  };

  Drupal.eu_cookie_compliance.setPreferenceCheckboxes = function (categories) {
    // Unset all categories to prevent a problem where the checkboxes with a
    // default state set would always show up as checked.
    if (Drupal.eu_cookie_compliance.getCurrentStatus() !== null || Drupal.eu_cookie_compliance.getCurrentStatus() === 0) {
      $("#eu-cookie-compliance-categories input:checkbox").not(":disabled").attr("checked", false);
    }
    // Check the appropriate checkboxes.
    for (var i in categories) {
      // Rewrite the id like we do in Drupal 7 drupal_html_class.
      var safeCategoryId = categories[i].toString().replace(/[ _\/\[\]]/g,'-').toLowerCase();
      var categoryElement = document.getElementById('cookie-category-' + safeCategoryId);
      if (categoryElement !== null) {
        categoryElement.checked = true;
      }
    }
  }

  Drupal.eu_cookie_compliance.getAcceptedCategories = function () {
    // Make a new observer & fire it to allow other scripts to hook in.
    var prePreferencesLoadObject = new PrePreferencesLoad();
    self.handleEvent('prePreferencesLoad', prePreferencesLoadObject);

    var cookieName = (typeof eu_cookie_compliance_cookie_name === 'undefined' || eu_cookie_compliance_cookie_name === '') ? 'cookie-agreed-categories' : Drupal.settings.eu_cookie_compliance.cookie_name + '-categories';
    var storedCategories = $.cookie(cookieName);

    if (storedCategories !== null && typeof storedCategories !== 'undefined') {
      Drupal.eu_cookie_compliance._euccSelectedCategories = JSON.parse(storedCategories);
    }
    else {
      Drupal.eu_cookie_compliance._euccSelectedCategories = [];
    }

    // Merge in required categories if not already present. Mimics old
    // logic where "fix first category" changed logic in
    // .hasAgreedWithCategory and this function.
    for (var _categoryName in Drupal.settings.eu_cookie_compliance.cookie_categories_details) {
      var _category = Drupal.settings.eu_cookie_compliance.cookie_categories_details[_categoryName];
      if (_category.checkbox_default_state === 'required' && $.inArray(_category.machine_name, Drupal.eu_cookie_compliance._euccSelectedCategories) === -1) {
        Drupal.eu_cookie_compliance._euccSelectedCategories.push(_category.machine_name);
      }
    }

    // Make a new observer & fire it to allow other scripts to hook in.
    var postPreferencesLoadObject = new PostPreferencesLoad();
    self.handleEvent('postPreferencesLoad', postPreferencesLoadObject);

    return Drupal.eu_cookie_compliance._euccSelectedCategories;
  };

  Drupal.eu_cookie_compliance.changeStatus = function (value) {
    var reloadPage = Drupal.settings.eu_cookie_compliance.reload_page;
    var previousState = Drupal.eu_cookie_compliance._euccCurrentStatus;
    if (Drupal.eu_cookie_compliance._euccCurrentStatus === parseInt(value)) {
      return;
    }

    if (Drupal.settings.eu_cookie_compliance.popup_position) {
      let height = $('#sliding-popup').outerHeight();
      if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
        $('body').animate({ 'margin-top': -height + 'px' }, Drupal.settings.eu_cookie_compliance.popup_delay);
      }

      $('.sliding-popup-top').animate({ top: Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height) }, Drupal.settings.eu_cookie_compliance.popup_delay, function () {
        $('body').removeClass('eu-cookie-compliance-popup-open');
        if (value === Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou && previousState === null && !reloadPage) {
          if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
            $('body').animate({ 'margin-top': '0px' }, Drupal.settings.eu_cookie_compliance.popup_delay);
          }
          $('.sliding-popup-top').not('.eu-cookie-withdraw-wrapper').html(Drupal.settings.eu_cookie_compliance.popup_html_agreed).animate({ top: Drupal.eu_cookie_compliance.getBannerTopPosition(height) }, Drupal.settings.eu_cookie_compliance.popup_delay);
          Drupal.eu_cookie_compliance.attachHideEvents();
        }
        else if (previousState === Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou) {
          if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
            $('#sliding-popup').hide();
            // Restore popup content.
            if (window.matchMedia('(max-width: ' + Drupal.settings.eu_cookie_compliance.mobile_breakpoint + 'px)').matches && Drupal.settings.eu_cookie_compliance.use_mobile_message) {
              $('.sliding-popup-top').not('.eu-cookie-withdraw-wrapper').html(Drupal.settings.eu_cookie_compliance.mobile_popup_html_info);
            }
            else {
              $('.sliding-popup-top').not('.eu-cookie-withdraw-wrapper').html(Drupal.settings.eu_cookie_compliance.popup_html_info);
            }
            height = $('#sliding-popup').outerHeight();
            if (!Drupal.settings.eu_cookie_compliance.fixed_top_position) {
              $('body').animate({ 'margin-top': -height + 'px' }, Drupal.settings.eu_cookie_compliance.popup_delay);
            }
            $('.sliding-popup-top').css('top', Drupal.eu_cookie_compliance.getBannerTopHiddenPosition(height));
            $('.sliding-popup-top').not('.eu-cookie-withdraw-wrapper').trigger('eu_cookie_compliance_popup_close');
            $('body').removeClass('eu-cookie-compliance-popup-open');
            Drupal.eu_cookie_compliance.initPopup();
            Drupal.eu_cookie_compliance.resizeListener();
            $('#sliding-popup').show();
          }
          else {
            $('.sliding-popup-top').not('.eu-cookie-withdraw-wrapper').trigger('eu_cookie_compliance_popup_close').remove();
            $('body').css({ 'margin-top': '0px' });
          }
          $('body').removeClass('eu-cookie-compliance-popup-open');
        }
        if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && !Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
          Drupal.eu_cookie_compliance.showWithdrawBanner(value);
        }
      });
    }
    else {
      $('.sliding-popup-bottom').animate({ bottom: $('#sliding-popup').outerHeight() * -1 }, Drupal.settings.eu_cookie_compliance.popup_delay, function () {
        if (value === Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou && previousState === null && !reloadPage) {
          $('.sliding-popup-bottom').not('.eu-cookie-withdraw-wrapper').html(Drupal.settings.eu_cookie_compliance.popup_html_agreed).animate({ bottom: 0 }, Drupal.settings.eu_cookie_compliance.popup_delay);
          Drupal.eu_cookie_compliance.attachHideEvents();
        }
        else if (previousState === Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou) {
          $('#sliding-popup').css('display', 'none');
          if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
            // Restore popup content.
            if (window.matchMedia('(max-width: ' + Drupal.settings.eu_cookie_compliance.mobile_breakpoint + 'px)').matches && Drupal.settings.eu_cookie_compliance.use_mobile_message) {
              $('.sliding-popup-bottom').not('.eu-cookie-withdraw-wrapper').html(Drupal.settings.eu_cookie_compliance.mobile_popup_html_info);
            }
            else {
              $('.sliding-popup-bottom').not('.eu-cookie-withdraw-wrapper').html(Drupal.settings.eu_cookie_compliance.popup_html_info);
            }
            $('.sliding-popup-bottom').css('bottom', Drupal.eu_cookie_compliance.getBannerBottomHiddenPosition());
            $('.sliding-popup-bottom').not('.eu-cookie-withdraw-wrapper').trigger('eu_cookie_compliance_popup_close');
            $('body').removeClass('eu-cookie-compliance-popup-open');
            Drupal.eu_cookie_compliance.initPopup();
            Drupal.eu_cookie_compliance.resizeListener();
            $('#sliding-popup').css('display', 'block');
          }
          else {
            $('.sliding-popup-bottom').not('.eu-cookie-withdraw-wrapper').trigger('eu_cookie_compliance_popup_close').remove();
            $('body').removeClass('eu-cookie-compliance-popup-open');
          }
        }
        if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && !Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
          Drupal.eu_cookie_compliance.showWithdrawBanner(value);
        }
      });
    }

    if (reloadPage) {
      location.reload();
    }

    Drupal.eu_cookie_compliance.setStatus(value);
  };

  Drupal.eu_cookie_compliance.showWithdrawBanner = function (value) {
    if (value === Drupal.eu_cookie_compliance.cookieValueAgreed && Drupal.settings.eu_cookie_compliance.withdraw_enabled) {
      if (!Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
        Drupal.eu_cookie_compliance.createWithdrawBanner(Drupal.settings.eu_cookie_compliance.withdraw_markup);
        Drupal.eu_cookie_compliance.resizeListener();
      }
      Drupal.eu_cookie_compliance.attachWithdrawEvents();
      if (Drupal.settings.eu_cookie_compliance.popup_position) {
        Drupal.eu_cookie_compliance.positionTab();
      }
    }
  };

  Drupal.eu_cookie_compliance.setStatus = function (status) {

    // Make a new observer & fire it to allow other scripts to hook in.
    var preStatusSaveObject = new PreStatusSave();
    self.handleEvent('preStatusSave', preStatusSaveObject);

    var date = new Date();
    var domain = Drupal.settings.eu_cookie_compliance.domain ? Drupal.settings.eu_cookie_compliance.domain : '';
    var path = Drupal.settings.eu_cookie_compliance.domain_all_sites ? '/' : Drupal.settings.basePath;
    var cookieName = (typeof eu_cookie_compliance_cookie_name === 'undefined' || eu_cookie_compliance_cookie_name === '') ? 'cookie-agreed' : eu_cookie_compliance_cookie_name;
    if (path.length > 1) {
      var pathEnd = path.length - 1;
      if (path.lastIndexOf('/') === pathEnd) {
        path = path.substring(0, pathEnd);
      }
    }

    var cookieSession = parseInt(Drupal.settings.eu_cookie_compliance.cookie_session);
    if (cookieSession) {
      $.cookie(cookieName, status, { path: path, domain: domain });
    }
    else {
      var lifetime = parseInt(Drupal.settings.eu_cookie_compliance.cookie_lifetime);
      date.setDate(date.getDate() + lifetime);
      $.cookie(cookieName, status, { expires: date, path: path, domain: domain });
    }
    Drupal.eu_cookie_compliance._euccCurrentStatus = status;
    $(document).trigger('eu_cookie_compliance.changeStatus', [status]);
    // Status set means something happened, update the version.
    Drupal.eu_cookie_compliance.setVersion();

    // Store consent if applicable.
    if (Drupal.settings.eu_cookie_compliance.store_consent && ((status === Drupal.eu_cookie_compliance.cookieValueAgreedShowThankYou && Drupal.settings.eu_cookie_compliance.popup_agreed_enabled) || (status === Drupal.eu_cookie_compliance.cookieValueAgreed  && !Drupal.settings.eu_cookie_compliance.popup_agreed_enabled))) {
      var url = Drupal.settings.basePath + Drupal.settings.pathPrefix + 'eu-cookie-compliance/store_consent/banner';
      $.post(url, {}, function (data) { });
    }

    // Make a new observer & fire it to allow other scripts to hook in.
    var postStatusSaveObject = new PostStatusSave();
    self.handleEvent('postStatusSave', postStatusSaveObject);

    if (status === Drupal.eu_cookie_compliance.cookieValueDisagreed && Drupal.settings.eu_cookie_compliance.method === 'opt_out') {
      Drupal.eu_cookie_compliance.euCookieComplianceBlockCookies = setInterval(Drupal.eu_cookie_compliance.BlockCookies, 5000);
    }
  };

  Drupal.eu_cookie_compliance.setAcceptedCategories = function (categories) {

    // Make a new observer & fire it to allow other scripts to hook in.
    var prePreferencesSaveObject = new PrePreferencesSave();
    self.handleEvent('prePreferencesSave', prePreferencesSaveObject);

    var date = new Date();
    var domain = Drupal.settings.eu_cookie_compliance.domain ? Drupal.settings.eu_cookie_compliance.domain : '';
    var path = Drupal.settings.eu_cookie_compliance.domain_all_sites ? '/' : Drupal.settings.basePath;
    var cookieName = (typeof eu_cookie_compliance_cookie_name === 'undefined' || eu_cookie_compliance_cookie_name === '') ? 'cookie-agreed-categories' : Drupal.settings.eu_cookie_compliance.cookie_name + '-categories';
    if (path.length > 1) {
      var pathEnd = path.length - 1;
      if (path.lastIndexOf('/') === pathEnd) {
        path = path.substring(0, pathEnd);
      }
    }
    var categoriesString = JSON.stringify(categories);
    var cookie_session = parseInt(Drupal.settings.eu_cookie_compliance.cookie_session);
    if (cookie_session) {
      $.cookie(cookieName, categoriesString, { path: path, domain: domain });
    }
    else {
      var lifetime = parseInt(Drupal.settings.eu_cookie_compliance.cookie_lifetime);
      date.setDate(date.getDate() + lifetime);
      $.cookie(cookieName, categoriesString, { expires: date, path: path, domain: domain });
    }
    Drupal.eu_cookie_compliance._euccSelectedCategories = categories;
    $(document).trigger('eu_cookie_compliance.changePreferences', [categories]);

    // TODO: Store categories with consent if applicable?
    // Make a new observer & fire it to allow other scripts to hook in.
    var postPreferencesSaveObject = new PostPreferencesSave();
    self.handleEvent('postPreferencesSave', postPreferencesSaveObject);
  };

  Drupal.eu_cookie_compliance.hasAgreed = function (category) {
    var agreed = (Drupal.eu_cookie_compliance._euccCurrentStatus === 1 || Drupal.eu_cookie_compliance._euccCurrentStatus === 2);

    if (category !== undefined && agreed) {
      agreed = Drupal.eu_cookie_compliance.hasAgreedWithCategory(category);
    }

    return agreed;
  };

  Drupal.eu_cookie_compliance.hasAgreedWithCategory = function (category) {
    return $.inArray(category, Drupal.eu_cookie_compliance._euccSelectedCategories) !== -1;
  };

  Drupal.eu_cookie_compliance.showBanner = function () {
    var showBanner = false;
    if ((Drupal.eu_cookie_compliance._euccCurrentStatus === 0 && Drupal.settings.eu_cookie_compliance.method === 'default') || Drupal.eu_cookie_compliance._euccCurrentStatus === null) {
      if (!Drupal.settings.eu_cookie_compliance.disagree_do_not_show_popup || Drupal.eu_cookie_compliance._euccCurrentStatus === null) {
        showBanner = true;
      }
    }
    else if (Drupal.eu_cookie_compliance._euccCurrentStatus === 1 && Drupal.settings.eu_cookie_compliance.popup_agreed_enabled) {
      showBanner = true;
    }
    else if (Drupal.eu_cookie_compliance._euccCurrentStatus === 2 && Drupal.settings.eu_cookie_compliance.withdraw_enabled) {
      showBanner = true;
    }

    return showBanner;
  };

  Drupal.eu_cookie_compliance.cookiesEnabled = function () {
    var cookieEnabled = navigator.cookieEnabled;
    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testCookie';
      cookieEnabled = (document.cookie.indexOf('testCookie') !== -1);
    }

    return cookieEnabled;
  };

  Drupal.eu_cookie_compliance.cookieMatches = function (cookieName, pattern) {
    if (cookieName === pattern) {
      return true;
    }
    if (pattern.indexOf('*') < 0) {
      return false;
    }
    try {
      var regexp = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.+') + '$', 'g');
      return regexp.test(cookieName);
    }
    catch (err) {
      return false;
    }
  };

  Drupal.eu_cookie_compliance.isAllowed = function (cookieName) {
    // Skip the PHP session cookie.
    if (cookieName.indexOf('SESS') === 0 || cookieName.indexOf('SSESS') === 0) {
      return true;
    }
    // Split the allowed cookies.
    var euCookieComplianceAllowlist = Drupal.settings.eu_cookie_compliance.allowed_cookies.split(/\r\n|\n|\r/g);

    // Add the EU Cookie Compliance cookie.
    euCookieComplianceAllowlist.push((typeof Drupal.settings.eu_cookie_compliance.cookie_name === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_name === '') ? 'cookie-agreed' : Drupal.settings.eu_cookie_compliance.cookie_name);
    euCookieComplianceAllowlist.push((typeof Drupal.settings.eu_cookie_compliance.cookie_name === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_name === '') ? 'cookie-agreed-categories' : Drupal.settings.eu_cookie_compliance.cookie_name + '-categories');
    euCookieComplianceAllowlist.push((typeof Drupal.settings.eu_cookie_compliance.cookie_name === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_name === '') ? 'cookie-agreed-version' : Drupal.settings.eu_cookie_compliance.cookie_name + '-version');

    // Check if the cookie is allowed.
    for (var item in euCookieComplianceAllowlist) {
      // Defensively check types for comparison.
      if (typeof euCookieComplianceAllowlist[item] === "string") {
        if (Drupal.eu_cookie_compliance.cookieMatches(cookieName, euCookieComplianceAllowlist[item])) {
          return true;
        }
        // Handle cookie names that are prefixed with a category.
        if (Drupal.settings.eu_cookie_compliance.method === 'categories') {
          var separatorPos = euCookieComplianceAllowlist[item].indexOf(":");
          if (separatorPos !== -1) {
            var category = euCookieComplianceAllowlist[item].substr(0, separatorPos);
            var wlCookieName = euCookieComplianceAllowlist[item].substr(separatorPos + 1);

            if (Drupal.eu_cookie_compliance.cookieMatches(cookieName, wlCookieName) && Drupal.eu_cookie_compliance.hasAgreedWithCategory(category)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  // This code upgrades the cookie agreed status when upgrading for an old version.
  Drupal.eu_cookie_compliance.updateCheck = function () {
    var legacyCookie = 'cookie-agreed-' + Drupal.settings.eu_cookie_compliance.popup_language;
    var domain = Drupal.settings.eu_cookie_compliance.domain ? Drupal.settings.eu_cookie_compliance.domain : '';
    var path = Drupal.settings.eu_cookie_compliance.domain_all_sites ? '/' : Drupal.settings.basePath;
    var cookie = $.cookie(legacyCookie);
    var date = new Date();
    var cookieName = (typeof eu_cookie_compliance_cookie_name === 'undefined' || eu_cookie_compliance_cookie_name === '') ? 'cookie-agreed' : eu_cookie_compliance_cookie_name;

    // jQuery.cookie 1.0 (bundled with Drupal) returns null,
    // jQuery.cookie 1.4.1 (bundled with some themes) returns undefined.
    // We had a 1.4.1 related bug where the value was set to 'null' (string).
    if (cookie !== undefined && cookie !== null && cookie !== 'null') {
      date.setDate(date.getDate() + parseInt(Drupal.settings.eu_cookie_compliance.cookie_lifetime));
      $.cookie(cookieName, cookie, { expires: date, path:  path, domain: domain });

      // Use removeCookie if the function exists.
      if (typeof $.removeCookie !== 'undefined') {
        $.removeCookie(legacyCookie);
      }
      else {
        $.cookie(legacyCookie, null, { path: path, domain: domain });
      }
    }
  };

  Drupal.eu_cookie_compliance.getVersion = function () {
    var cookieName = (typeof Drupal.settings.eu_cookie_compliance.cookie_name === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_name === '') ? 'cookie-agreed-version' : Drupal.settings.eu_cookie_compliance.cookie_name + '-version';
    return $.cookie(cookieName);
  };

  Drupal.eu_cookie_compliance.setVersion = function () {
    var date = new Date();
    var domain = Drupal.settings.eu_cookie_compliance.domain ? Drupal.settings.eu_cookie_compliance.domain : '';
    var path = Drupal.settings.eu_cookie_compliance.domain_all_sites ? '/' : Drupal.settings.basePath;
    var cookieName = (typeof Drupal.settings.eu_cookie_compliance.cookie_name === 'undefined' || Drupal.settings.eu_cookie_compliance.cookie_name === '') ? 'cookie-agreed-version' : Drupal.settings.eu_cookie_compliance.cookie_name + '-version';

    if (path.length > 1) {
      var pathEnd = path.length - 1;
      if (path.lastIndexOf('/') === pathEnd) {
        path = path.substring(0, pathEnd);
      }
    }
    var eucc_version = Drupal.settings.eu_cookie_compliance.cookie_policy_version;
    var cookie_session = parseInt(Drupal.settings.eu_cookie_compliance.cookie_session);
    if (cookie_session) {
      $.cookie(cookieName, eucc_version, { path: path, domain: domain });
    }
    else {
      var lifetime = parseInt(Drupal.settings.eu_cookie_compliance.cookie_lifetime);
      date.setDate(date.getDate() + lifetime);
      $.cookie(cookieName, eucc_version, { expires: date, path: path, domain: domain });
    }
  };

  // Load blocked scripts if the user has agreed to being tracked.
  var euCookieComplianceHasLoadedScripts = false;
  var euCookieComplianceHasLoadedScriptsForCategory = {};
  $(function () {
    if (Drupal.eu_cookie_compliance.hasAgreed()
        || (Drupal.eu_cookie_compliance._euccCurrentStatus === null && Drupal.settings.eu_cookie_compliance.method !== 'opt_in' && Drupal.settings.eu_cookie_compliance.method !== 'categories')
    ) {
      if (typeof euCookieComplianceLoadScripts === "function") {
        euCookieComplianceLoadScripts();
      }
      euCookieComplianceHasLoadedScripts = true;

      if (Drupal.settings.eu_cookie_compliance.method === 'categories') {
        Drupal.eu_cookie_compliance.loadCategoryScripts(Drupal.eu_cookie_compliance._euccSelectedCategories);
      }
    }
  });

  // Block cookies when the user hasn't agreed.
  Drupal.behaviors.eu_cookie_compliance_popup_block_cookies = {
    initialized: false,
    attach: function (context, settings) {
      if (!Drupal.behaviors.eu_cookie_compliance_popup_block_cookies.initialized && settings.eu_cookie_compliance) {
        Drupal.behaviors.eu_cookie_compliance_popup_block_cookies.initialized = true;
        if (settings.eu_cookie_compliance.automatic_cookies_removal &&
          ((settings.eu_cookie_compliance.method === 'opt_in' && (Drupal.eu_cookie_compliance._euccCurrentStatus === null || !Drupal.eu_cookie_compliance.hasAgreed()))
            || (settings.eu_cookie_compliance.method === 'opt_out' && !Drupal.eu_cookie_compliance.hasAgreed() && Drupal.eu_cookie_compliance._euccCurrentStatus !== null)
          || (Drupal.settings.eu_cookie_compliance.method === 'categories'))
        ) {
          // Split the allowed cookies.
          var euCookieComplianceAllowlist = settings.eu_cookie_compliance.allowed_cookies.split(/\r\n|\n|\r/g);

          // Add the EU Cookie Compliance cookie.
          var cookieName = (typeof eu_cookie_compliance_cookie_name === 'undefined' || eu_cookie_compliance_cookie_name === '') ? 'cookie-agreed' : eu_cookie_compliance_cookie_name;
          euCookieComplianceAllowlist.push(cookieName);

          Drupal.eu_cookie_compliance.euCookieComplianceBlockCookies = setInterval(Drupal.eu_cookie_compliance.BlockCookies, 5000);
        }
      }
    }
  }

  Drupal.eu_cookie_compliance.BlockCookies = function () {
    // Load all cookies from jQuery.
    var cookies = $.cookie();

    // Check each cookie and try to remove it if it's not allowed.
    for (var i in cookies) {
      var remove = true;
      var hostname = window.location.hostname;
      var cookieRemoved = false;
      var index = 0;

      remove = !Drupal.eu_cookie_compliance.isAllowed(i);

      // Remove the cookie if it's not allowed.
      if (remove) {
        while (!cookieRemoved && hostname !== '') {
          // Attempt to remove.
          cookieRemoved = $.removeCookie(i, { domain: '.' + hostname, path: '/' });
          if (!cookieRemoved) {
            cookieRemoved = $.removeCookie(i, { domain: hostname, path: '/' });
          }

          index = hostname.indexOf('.');

          // We can be on a sub-domain, so keep checking the main domain as well.
          hostname = (index === -1) ? '' : hostname.substring(index + 1);
        }

        // Some jQuery Cookie versions don't remove cookies well.  Try again
        // using plain js.
        if (!cookieRemoved) {
          document.cookie = i + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
        }
      }
    }
  }

  /**
   * Filter the event listeners by event name and return the list of handlers.
   *
   * @param forEventName
   *
   * @returns {[]}
   */
  var filterQueue = function (forEventName) {
    var handlers = [];
    if (typeof Drupal.eu_cookie_compliance !== 'undefined' &&
      typeof Drupal.eu_cookie_compliance.queue !== 'undefined' &&
      Drupal.eu_cookie_compliance.queue.length) {
      // Loop over the list of arguments (objects) pushed into the queue.
      for (var i = 0; i < Drupal.eu_cookie_compliance.queue.length; i++) {
        if (Drupal.eu_cookie_compliance.queue[i].length) {
          var queueItem = Drupal.eu_cookie_compliance.queue[i];
          var eventName = queueItem[0];
          var eventHandler = queueItem[1];
          // If the first element is a string and the second is a function.
          if (typeof eventName === 'string' && typeof eventHandler === 'function') {
            // And the string matches the event name.
            if (eventName === forEventName) {
              // Return the functions so they can be executed.
              handlers.push(eventHandler);
            }
          }
        }
      }
    }
    return handlers;
  }

  /**
   * Handle event by finding and executing handlers pushed to the queue.
   */
  self.handleEvent = function (eventName, observer) {
    var handlers = filterQueue(eventName);
    for (var i = 0; i < handlers.length; i++) {
      if (typeof handlers[i] !== 'undefined') {
        observer.subscribe(handlers[i]);
        observer.fire({
          currentStatus: Drupal.eu_cookie_compliance._euccCurrentStatus,
          currentCategories: Drupal.eu_cookie_compliance._euccSelectedCategories
        });
        observer.unsubscribe(handlers[i]);
      }
    }
  };

  /**
   * Observer: triggered before status gets read from cookie.
   */
  var PreStatusLoad = (function () {
    // Constructor.
    var PreStatusLoad = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = PreStatusLoad.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return PreStatusLoad;
  })();

  /**
   * Observer: triggered after status was read from cookie and stored in
   * private variable.
   */
  var PostStatusLoad = (function () {
    // Constructor.
    var PostStatusLoad = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = PostStatusLoad.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return PostStatusLoad;
  })();

  /**
   * Observer: triggered before status gets saved into cookie.
   */
  var PreStatusSave = (function () {
    // Constructor.
    var PreStatusSave = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = PreStatusSave.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return PreStatusSave;
  })();

  /**
   * Observer: triggered after status was saved into cookie.
   */
  var PostStatusSave = (function () {
    // Constructor.
    var PostStatusSave = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = PostStatusSave.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return PostStatusSave;
  })();

  /**
   * Observer: triggered before categories are read from cookie.
   */
  var PrePreferencesLoad = (function () {
    // Constructor.
    var prePreferencesLoad = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = prePreferencesLoad.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return prePreferencesLoad;
  })();

  /**
   * Observer: triggered after categories were read from cookie.
   */
  var PostPreferencesLoad = (function () {
    // Constructor.
    var postPreferencesLoad = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = postPreferencesLoad.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return postPreferencesLoad;
  })();

  /**
   * Observer: triggered before categories are being saved to cookie.
   */
  var PrePreferencesSave = (function () {
    // Constructor.
    var prePreferencesSave = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = prePreferencesSave.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return prePreferencesSave;
  })();

  /**
   * Observer: triggered after categories were saved to cookie.
   */
  var PostPreferencesSave = (function () {
    // Constructor.
    var postPreferencesSave = function () {
      // Observers.
      this.handlers = [];
    };
    // Convenience var for the prototype.
    var prototype = postPreferencesSave.prototype;
    prototype.subscribe = function (fn) {
      this.handlers.push(fn);
    };
    prototype.unsubscribe = function (fn) {
      this.handlers = this.handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    };
    prototype.fire = function (o, thisObj) {
      var scope = thisObj || window;
      this.handlers.forEach(function (item) {
        item.call(scope, o);
      });
    };
    return postPreferencesSave;
  })();

})(jQuery, Drupal);
