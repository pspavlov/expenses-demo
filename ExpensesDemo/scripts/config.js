(function (global) {
    var app = global.app = global.app || {};
    
    app.consts = {
    };
    
    app.config = {
        everlive: {
            apiKey: "L4tA7LlBwMrzfj6m",
            scheme: "https"
        },
        views: {
            init: "#init-view",
            signIn: "scripts/modules/login/signin.html",
            signUp: "scripts/modules/login/signup.html",
            dashboard: "scripts/modules/dashboard/dashboard.html",
            main: "scripts/modules/dashboard/dashboard.html",
            bills: "scripts/modules/bills/bills.html",
            settings: "scripts/modules/settings/settings.html",
            settingsStarting: "scripts/modules/settings/settings-starting.html"
        }
    };
})(window);