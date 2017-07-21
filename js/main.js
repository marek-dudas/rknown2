/**
 * Created by marek on 21.6.2017.
 */
var $ = require('jquery-browserify');
var app = require('./control/RApp');

window.onSignIn = function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    
    app(profile.getEmail(), id_token).go();
};