(function (global) {
    var app = global.app = global.app || {};
    
    app.consts = {
    };
    
    app.config = {
        views: {
            init: "#init-view",
            signIn: "scripts/modules/login/signin.html",
            dashboard: "scripts/modules/dashboard/dashboard.html",
            main: "scripts/modules/dashboard/dashboard.html",
            expenses: "scripts/modules/expenses/expenses.html",
            settings: "scripts/modules/settings/settings.html",
            settingsStarting: "scripts/modules/settings/settings-starting.html"
        }
    };
})(window);