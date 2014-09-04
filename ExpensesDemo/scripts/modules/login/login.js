(function (global) {
    var LoginBase,
        SignInViewModel,
        SignUpViewModel,
        app = global.app = global.app || {};

    LoginBase = kendo.data.ObservableObject.extend({
        isEn: true,
        $view: null,

        consts: {
            PROVIDER_DEFAULT: "default",
            PROVIDER_FACEBOOK: "facebook",
            PROVIDER_GOOGLE: "google",
            PROVIDER_LIVE_ID: "liveid",
        },

        init: function () {
            var that = this;

            that.initData = $.proxy(that._initData, that);

            kendo.data.ObservableObject.fn.init.apply(that, arguments);
        },

        _initData: function () {
            var that = this,
                language = app.settingsService.getLanguage();

            that.$view = $(that.viewId);
            that.$view.removeClass("en ar").addClass(language);
            that.set("isEn", language === "en");
        },

        checkEnter: function (e) {
            var that = this;

            if (e.keyCode === 13) {
                $(e.target).blur();
                that.onLogin();
            }
        },

        _onStart: function (provider) {
            app.common.showLoading();
        },

        _onCancel: function (provider) {
            app.common.hideLoading();
        },

        _onError: function (provider, e) {
            app.common.hideLoading();
            app.common.notification(this.consts.MESSAGE_TITLE_SIGN_IN_ERROR, e.message);
        }
    });

    SignInViewModel = LoginBase.extend({
        isLoggedIn: false,
        displayName: "",
        viewId: "#signin-view",

        consts: {
            MESSAGE_TITLE_SIGN_IN_ERROR: "Sign In Error",
            MESSAGE_EMPTY_FIELD: "Both fields are required"
        },

        onLogin: function () {
            var that = this,
                username = that.get("username").trim(),
                password = that.get("password").trim();

            if (username === "" || password === "") {
                app.common.notification(that.consts.MESSAGE_TITLE_SIGN_IN_ERROR, that.consts.MESSAGE_EMPTY_FIELD);
                return;
            }

            that._onStart(that.consts.PROVIDER_DEFAULT);

            return app.everlive.Users.login(username, password)
                .then($.proxy(that._onSuccess, that, that.consts.PROVIDER_DEFAULT))
                .then(null, $.proxy(that._onError, that, that.consts.PROVIDER_DEFAULT));
        },

        onLoginFacebook: function () {
            var that = this,
                facebookLoginProvider,
                facebookConfig = {
                    name: "Facebook",
                    loginMethodName: "loginWithFacebook",
                    responseType: "token",
                    accessType: "online",
                    scope: "email",
                    display: "touch",
                    endpoint: app.config.facebook.endpoint,
                    clientId: app.config.facebook.appId,
                    redirectUri: app.config.facebook.redirectUri
                };

            facebookLoginProvider = new app.IdentityProvider(facebookConfig);
            that._onStart(that.consts.PROVIDER_FACEBOOK);

            return facebookLoginProvider.getAccessToken(function (token) {
                if (!token) {
                    that._onCancel(that.consts.PROVIDER_FACEBOOK);
                    return;
                }

                app.everlive.Users.loginWithFacebook(token)
                    .then($.proxy(that._onSuccess, that, that.consts.PROVIDER_FACEBOOK))
                    .then(null, $.proxy(that._onError, that, that.consts.PROVIDER_FACEBOOK));
            });
        },

        onLoginGoogle: function () {
            var that = this,
                googleLoginProvider,
                googleConfig = {
                    name: "Google",
                    loginMethodName: "loginWithGoogle",
                    responseType: "token",
                    accessType: "online",
                    display: "touch",
                    clientId: app.config.google.clientId,
                    redirectUri: app.config.google.redirectUri,
                    scope: app.config.google.scope,
                    endpoint: app.config.google.endpoint
                };

            googleLoginProvider = new app.IdentityProvider(googleConfig);
            that._onStart(that.consts.PROVIDER_GOOGLE);

            return googleLoginProvider.getAccessToken(function (token) {
                if (!token) {
                    that._onCancel(that.consts.PROVIDER_GOOGLE);
                    return;
                }

                app.everlive.Users.loginWithGoogle(token)
                    .then($.proxy(that._onSuccess, that, that.consts.PROVIDER_GOOGLE))
                    .then(null, $.proxy(that._onError, that, that.consts.PROVIDER_GOOGLE));
            });
        },

        onLoginLiveId: function () {
            var that = this,
                liveIdLoginProvider,
                liveIdConfig = {
                    name: "LiveID",
                    loginMethodName: "loginWithLiveID",
                    endpoint: "https://login.live.com/oauth20_authorize.srf",
                    responseType: "token",
                    clientId: app.config.liveId.clientId,
                    redirectUri: app.config.liveId.redirectUri,
                    scope: "wl.basic",
                    accessType: "online",
                    display: "touch"
                };

            liveIdLoginProvider = new app.IdentityProvider(liveIdConfig);
            that._onStart(that.consts.PROVIDER_LIVE_ID);

            return liveIdLoginProvider.getAccessToken(function (token) {
                if (!token) {
                    that._onCancel(that.consts.PROVIDER_LIVE_ID);
                    return;
                }

                app.everlive.Users.loginWithLiveID(token)
                    .then($.proxy(that._onSuccess, that, that.consts.PROVIDER_LIVE_ID))
                    .then(null, $.proxy(that._onError, that, that.consts.PROVIDER_LIVE_ID));
            });
        },

        logout: function () {
            var that = this;

            that.set("isLoggedIn", false);
            app.everlive.Users.logout()
                .then($.proxy(that._onLogout, that))
                .then(null, $.proxy(that._onError, that));
        },

        _onLogout: function () {
            var that = this;

            app.settingsService.removeCredentials();
            app.common.navigateToView(app.config.views.settingsStarting);
        },

        _onSuccess: function (provider, e) {
            var that = this;

            app.common.hideLoading();
            app.everlive.Users.currentUser()
                .then(function (data) {
                    that.set("displayName", data.result.DisplayName);
                    app.currentUser = data.result;

                    app.settingsService.setUserCredentials(that.get("username").trim(), that.get("password").trim(), app.currentUser.Id, e.result.access_token);

                    app.common.navigateToView(app.config.views.dashboard);
                });
        },
    });

    SignUpViewModel = LoginBase.extend({
        viewId: "#signup-view",
        username: "",
        email: "",
        password: "",
        repassword: "",
        consts: {
            MESSAGE_TITLE_SIGN_UP_ERROR: "Sign Up Error",
            MESSAGE_PASSWORD_DO_NOT_MATCH: "Passowrds do not match",
            MESSAGE_ALL_FIELDS_REQUIRED: "All fields are required"
        },

        onSignUp: function () {
            var that = this,
                username = that.get("username").trim(),
                password = that.get("password").trim(),
                repassword = that.get("repassword").trim(),
                email = that.get("email").trim();

            if (that.checkRequiredField("username") &&
                that.checkRequiredField("email") &&
                that.checkRequiredField("password") &&
                that.checkRequiredField("repassword") &&
                that.checkPasword(password, repassword)) {
                that._onStart();
                app.everlive.Users.register(username, password, {
                    Email: email,
                    DisplayName: username
                })
                    .then($.proxy(that._onSuccess, that, that.consts.PROVIDER_DEFAULT))
                    .then(null, $.proxy(that._onError, that, that.consts.PROVIDER_DEFAULT));
            }
        },

        checkRequiredField: function (field) {
            var that = this,
                fieldValue = this.get(field).trim();

            if (!fieldValue) {
                app.common.notification(that.consts.MESSAGE_TITLE_SIGN_UP_ERROR, that.consts.MESSAGE_ALL_FIELDS_REQUIRED);
                return false;
            }

            return true;
        },

        checkPasword: function (password, confirmPassword) {
            var that = this;

            if (password !== confirmPassword) {
                app.common.notification(that.consts.MESSAGE_TITLE_SIGN_UP_ERROR, that.consts.MESSAGE_PASSWORD_DO_NOT_MATCH);
                return false;
            }

            return true;
        },

        _onSuccess: function (provider, data) {
            app.common.hideLoading();

            app.common.notification("Confirmation email has been sent", "Confirmation email has been sent");

            app.common.navigateToView(app.config.views.signIn);
        },
    });

    app.loginService = {
        signInViewModel: new SignInViewModel(),
        signUpViewModel: new SignUpViewModel()
    };
})(window);