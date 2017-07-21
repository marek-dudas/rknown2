/**
 * Created by marek on 21.6.2017.
 */
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['browserify']);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            main: {
                src: 'js/main.js',
                dest: 'rknownApp.js'
            },
            options: {
                browserifyOptions: {
                    debug: true
                }
            }
        }
    });
}
